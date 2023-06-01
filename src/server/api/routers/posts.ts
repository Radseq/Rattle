import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { CONFIG } from "~/config"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import { filterClarkClientToUser } from "~/utils/helpers"
import { getPostById, getPostIdsForwardedByUser, getPostsLikedByUser } from "../posts"

const postRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

export const postsRouter = createTRPCRouter({
	getAllByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const postIds: string[] = []
		const postsByAuthorIds = ctx.prisma.post.findMany({
			where: { authorId: input, replayId: null },
			orderBy: { createdAt: "desc" },
			take: CONFIG.MAX_POSTS_BY_AUTHOR_ID,
			select: {
				id: true,
			},
		})

		const forwardedPostsIds = getPostIdsForwardedByUser(input)

		const [getPostForwardedIds, getPostsByAuthorIds] = await Promise.all([
			forwardedPostsIds,
			postsByAuthorIds,
		])

		for (const post of getPostsByAuthorIds) {
			postIds.push(post.id)
		}

		for (const id of getPostForwardedIds) {
			postIds.push(id)
		}

		let postsLikedBySignInUser: string[] = []
		if (ctx.authUserId) {
			postsLikedBySignInUser = await getPostsLikedByUser(ctx.authUserId, postIds)
		}

		const posts = await Promise.all(postIds.map((id) => getPostById(id)))

		const author = await clerkClient.users.getUser(input)

		if (!author || !author.username) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author for posts not found!",
			})
		}

		return posts
			.sort((postA, postB) => postB.createdAt.getTime() - postA.createdAt.getTime())
			.map((post) => ({
				post: {
					...post,
					createdAt: post.createdAt.toString(),
					isLikedBySignInUser: postsLikedBySignInUser.some(
						(postId) => postId === post.id
					),
				},
				author: filterClarkClientToUser(author),
			}))
	}),
	getAll: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.prisma.post.findMany({ take: 10 })

		const users = (
			await clerkClient.users.getUserList({
				userId: posts.map((post) => post.authorId),
				limit: 10, // todo remove magic number
			})
		).map((user) => filterClarkClientToUser(user))

		return posts.map((post) => {
			const postAuthor = users.find((user) => user.id === post.authorId)
			if (!users) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author of posts not found",
				})
			}
			return {
				post,
				postAuthor,
			}
		})
	}),
	createPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Message is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Message is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			return await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content,
				},
			})
		}),
	createReplayPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Replay is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Replay is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				replayPostId: z.string().cuid(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			return await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content,
					replayId: input.replayPostId,
				},
			})
		}),
	deletePost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			return await ctx.prisma.post.deleteMany({
				where: {
					id: input,
					authorId: ctx.authUserId,
				},
			})
		}),
	setPostLiked: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const alreadyLikePost = await ctx.prisma.userLikePost.findFirst({
				where: {
					userId: ctx.authUserId,
					postId: input,
				},
			})

			if (alreadyLikePost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post already liked!",
				})
			}

			const result = await ctx.prisma.userLikePost.create({
				data: {
					postId: input,
					userId: ctx.authUserId,
				},
			})
			return result.postId
		}),
	setPostUnliked: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const alreadyLikePost = await ctx.prisma.userLikePost.findFirst({
				where: {
					userId: ctx.authUserId,
				},
			})

			if (!alreadyLikePost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is not liked!",
				})
			}

			await ctx.prisma.userLikePost.deleteMany({
				where: {
					postId: input,
					userId: ctx.authUserId,
				},
			})

			return input
		}),
	getPostsLikedByUser: privateProcedure
		.input(z.string().array().optional())
		.query(async ({ input, ctx }) => {
			if (!input) {
				return []
			}
			return await getPostsLikedByUser(ctx.authUserId, input)
		}),
	getPostReplays: publicProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.query(async ({ input, ctx }) => {
			const getPostReplays = await ctx.prisma.post.findMany({
				where: {
					replayId: input,
				},
				orderBy: { createdAt: "desc" },
				take: CONFIG.MAX_POST_REPLAYS,
				select: {
					id: true,
					authorId: true,
				},
			})

			const postReplays = await Promise.all(
				getPostReplays.map((post) => getPostById(post.id))
			)

			let postsLikedBySignInUser: string[] = []

			if (ctx.authUserId) {
				postsLikedBySignInUser = await getPostsLikedByUser(
					ctx.authUserId,
					postReplays.map((post) => post.id)
				)
			}

			const replaysAuthors = await clerkClient.users.getUserList({
				userId: getPostReplays.map((post) => post.authorId),
			})

			if (!replaysAuthors) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author of posts not found",
				})
			}

			return postReplays.map((postReplay) => {
				const postAuthor = replaysAuthors.find((user) => user.id === postReplay.authorId)
				if (!postAuthor || !postAuthor.username) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Author of one of the posts not found",
					})
				}
				return {
					post: {
						...postReplay,
						createdAt: postReplay.createdAt.toString(),
						isLikedBySignInUser: postsLikedBySignInUser.some(
							(postId) => postId === postReplay.id
						),
					},
					author: filterClarkClientToUser(postAuthor),
				}
			})
		}),
	forwardPost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const alreadyForwarded = ctx.prisma.userPostForward.findFirst({
				where: {
					userId: ctx.authUserId,
				},
			})

			const postToForward = ctx.prisma.post.findFirst({
				where: {
					id: input,
					authorId: ctx.authUserId,
				},
			})

			const [isAlreadyForwarded, getPostToForward] = await Promise.all([
				alreadyForwarded,
				postToForward,
			])
			// todo uncomment after test
			// if (isAlreadyForwarded) {
			// 	throw new TRPCError({
			// 		code: "INTERNAL_SERVER_ERROR",
			// 		message: "Can't forward own post!",
			// 	})
			// } else
			if (!getPostToForward) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is already forwarded!",
				})
			}

			const result = await ctx.prisma.userPostForward.create({
				data: {
					userId: ctx.authUserId,
					postId: input,
				},
			})
			return result.postId
		}),
	removePostForward: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const forwardedPost = await ctx.prisma.userPostForward.findFirst({
				where: {
					userId: ctx.authUserId,
				},
			})

			if (!forwardedPost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is not frowarded!",
				})
			}

			await ctx.prisma.userPostForward.deleteMany({
				where: {
					postId: input,
					userId: ctx.authUserId,
				},
			})

			return input
		}),
	getPostIdsForwardedByUser: privateProcedure.query(async ({ ctx }) => {
		return getPostIdsForwardedByUser(ctx.authUserId)
	}),
})
