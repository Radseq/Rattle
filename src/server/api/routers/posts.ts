import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { CONFIG } from "~/config"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import { addTimeToDate, filterClarkClientToAuthor, type TimeAddToDate } from "~/utils/helpers"
import { getPostById, isPostExists } from "../posts"
import type { Post, PostWithAuthor } from "~/components/postsPage/types"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
	isUserForwardedPost,
} from "../profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "~/server/cache"
import { type PostAuthor } from "~/components/profilePage/types"

const postRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

const MAX_CHACHE_POST_LIFETIME_IN_SECONDS = 60
const MAX_CHACHE_USER_LIFETIME_IN_SECONDS = 600

export const postsRouter = createTRPCRouter({
	getAllByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const postIds: string[] = []
		const postsByAuthorIds = ctx.prisma.post.findMany({
			where: { authorId: input, replyId: null },
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
		let postsPollVotedByUser: {
			postId: string
			choiceId: number
		}[] = []
		if (ctx.authUserId) {
			const [getPostsLikedBySignInUser, getPostsPollVotedByUser] = await Promise.all([
				getPostsLikedByUser(ctx.authUserId, postIds),
				getUserVotedAnyPostsPoll(ctx.authUserId, postIds),
			])
			postsLikedBySignInUser = getPostsLikedBySignInUser
			postsPollVotedByUser = getPostsPollVotedByUser
		}

		const authorCacheKey: CacheSpecialKey = { id: input, type: "author" }
		let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
		if (!author) {
			author = await getPostAuthor(input)
			void setCacheData(authorCacheKey, author, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
		}

		if (!author || !author.username) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author for posts not found!",
			})
		}

		const posts = await Promise.all(postIds.map((id) => getPostById(id)))

		const sortedPosts = posts.sort(
			(postA, postB) =>
				new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
		)
		const result: PostWithAuthor[] = []
		for (const sortedPost of sortedPosts) {
			const postWithAuthor = {
				post: {
					...sortedPost,
					createdAt: sortedPost.createdAt.toString(),
					isLikedBySignInUser: postsLikedBySignInUser.some(
						(postId) => postId === sortedPost.id
					),
				},
				author,
			} as PostWithAuthor
			if (postWithAuthor.post.poll) {
				postWithAuthor.post.poll.choiceVotedBySignInUser = postsPollVotedByUser.find(
					(value) => value.postId === sortedPost.id
				)?.choiceId
			}
			result.push(postWithAuthor)
		}

		return result
	}),
	getAll: publicProcedure.query(async ({ ctx }) => {
		// todo delete
		const posts = await ctx.prisma.post.findMany({ take: 10 })

		const users = (
			await clerkClient.users.getUserList({
				userId: posts.map((post) => post.authorId),
				limit: 10, // todo remove magic number
			})
		).map((user) => filterClarkClientToAuthor(user))

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
				message: z
					.string()
					.min(1, { message: "Message is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Message is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				poll: z
					.object({
						choices: z
							.string()
							.array()
							.min(1, { message: "Post poll shoud have at last two elements!" }),
						length: z.object({
							days: z.number(),
							hours: z.number(),
							minutes: z.number(),
						}),
					})
					.optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			let result: Post | false = false

			if (input.poll) {
				await ctx.prisma.$transaction(async (tx) => {
					// input.poll give us belowe error even if code is in quard if (input.poll)
					if (!input.poll) {
						throw new Error("Poll is not provided for post!")
					}

					const createPost = await tx.post.create({
						data: {
							authorId,
							content: input.message,
						},
					})

					const endDate = addTimeToDate(new Date(), input.poll.length as TimeAddToDate)
					if (!endDate) {
						throw new Error("Can't set end date for poll!")
					}

					const pollChoices = input.poll.choices.map((choice) => {
						return { choice: choice }
					})
					const createPoll = await tx.postPoll.create({
						data: {
							choices: {
								create: pollChoices,
							},
							postId: createPost.id,
							endDate,
						},
					})

					if (createPost && createPoll) {
						result = createPost as Post
					}
				})
			} else {
				const createPost = await ctx.prisma.post.create({
					data: {
						authorId,
						content: input.message,
					},
				})
				if (createPost) {
					result = createPost as Post
				}
			}

			if (!result) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Can't create post",
				})
			}

			const postCacheKey: CacheSpecialKey = { id: result.id, type: "post" }
			void setCacheData(postCacheKey, result, MAX_CHACHE_POST_LIFETIME_IN_SECONDS)

			return result
		}),
	createQuotedPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Message is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Message is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				quotedPostId: z.string().min(25, { message: "wrong quotedPostId" }),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			const postExists = await isPostExists(input.quotedPostId)
			if (!postExists) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Quoted post not exists",
				})
			}

			return await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content,
					quotedId: input.quotedPostId,
				},
			})
		}),
	createReplyPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Reply is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Reply is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				replyPostId: z.string().cuid(),
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
					replyId: input.replyPostId,
				},
			})
		}),
	deletePost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			// todo delete data from all related tables
			return await ctx.prisma.post.deleteMany({
				where: {
					id: input,
					authorId: ctx.authUserId,
				},
			})
		}),
	getPostReplies: publicProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.query(async ({ input, ctx }) => {
			const getPostReplies = await ctx.prisma.post.findMany({
				where: {
					replyId: input,
				},
				orderBy: { createdAt: "desc" },
				take: CONFIG.MAX_POST_REPLIES,
				select: {
					id: true,
					authorId: true,
				},
			})

			const postReplies = await Promise.all(
				getPostReplies.map((post) => getPostById(post.id))
			)

			let postsLikedBySignInUser: string[] = []

			if (ctx.authUserId) {
				postsLikedBySignInUser = await getPostsLikedByUser(
					ctx.authUserId,
					postReplies.map((post) => post.id)
				)
			}

			const postAuthors = await Promise.all(
				getPostReplies.map((post) => getPostAuthor(post.authorId))
			)

			return postReplies.map((postReply) => {
				const postAuthor = postAuthors.find((user) => user.id === postReply.authorId)
				if (!postAuthor || !postAuthor.username) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Author of one of the posts not found",
					})
				}
				return {
					post: {
						...postReply,
						createdAt: postReply.createdAt.toString(),
						isLikedBySignInUser: postsLikedBySignInUser.some(
							(postId) => postId === postReply.id
						),
					},
					author: postAuthor,
				} as PostWithAuthor
			})
		}),
	forwardPost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const [isAlreadyForwarded, postExists] = await Promise.all([
				isUserForwardedPost(ctx.authUserId, input),
				isPostExists(input),
			])

			if (isAlreadyForwarded) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is already forwarded!",
				})
			}
			if (!postExists) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post not exists!",
				})
			}

			const createForward = await ctx.prisma.userPostForward.create({
				data: {
					userId: ctx.authUserId,
					postId: input,
				},
			})

			if (!createForward) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to forward post!",
				})
			}

			const postCacheKey: CacheSpecialKey = { id: input, type: "post" }
			let post = await getCacheData<Post>(postCacheKey)
			if (post) {
				post.forwardsCount += 1
				post.isForwardedPostBySignInUser = true
			} else {
				post = await getPostById(input)
			}
			void setCacheData(postCacheKey, post, MAX_CHACHE_POST_LIFETIME_IN_SECONDS)

			const authorCacheKey: CacheSpecialKey = { id: post.authorId, type: "author" }
			let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
			if (!author) {
				author = await getPostAuthor(post.authorId)

				void setCacheData(authorCacheKey, author, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
			}

			const userCacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "postsForwarded" }
			const chacheIds = await getCacheData<string[]>(userCacheKey)
			if (chacheIds) {
				chacheIds.push(input)
				void setCacheData(userCacheKey, chacheIds, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
			}

			// todo uncomment after testing
			// if (getPostToForward.authorId === ctx.authUserId) {
			// 	throw new TRPCError({
			// 		code: "INTERNAL_SERVER_ERROR",
			// 		message: "Can't forward own post!",
			// 	})
			// }

			return {
				post,
				author,
			} as PostWithAuthor
		}),
	removePostForward: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const forwardedPost = await isUserForwardedPost(ctx.authUserId, input)

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

			const postCacheKey: CacheSpecialKey = { id: input, type: "post" }
			let post = await getCacheData<Post>(postCacheKey)
			if (post) {
				post.forwardsCount -= 1
				post.isForwardedPostBySignInUser = false
			} else {
				post = await getPostById(input)
			}
			void setCacheData(postCacheKey, post, MAX_CHACHE_POST_LIFETIME_IN_SECONDS)

			const userCacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "postsForwarded" }
			const chacheIds = await getCacheData<string[]>(userCacheKey)
			if (chacheIds) {
				const removed = chacheIds.filter((postId) => postId !== input)
				void setCacheData(userCacheKey, removed, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
			}

			return post
		}),
})
