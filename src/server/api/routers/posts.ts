import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { CONFIG } from "~/config"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import { filterClarkClientToUser } from "~/utils/helpers"

const postRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

export const postsRouter = createTRPCRouter({
	getAllByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const posts = await ctx.prisma.post.findMany({
			where: { authorId: input, replayId: null },
			orderBy: { createdAt: "desc" },
			take: CONFIG.MAX_POSTS_BY_AUTHOR_ID,
		})

		const author = await clerkClient.users.getUser(input)

		if (!author || !author.username) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author for posts not found!",
			})
		}

		const username = author.username

		return posts.map((post) => ({
			post,
			author: {
				id: author.id,
				username,
				profileImageUrl: author.profileImageUrl,
			},
		}))
	}),
	getAll: publicProcedure.query(async ({ ctx }) => {
		const posts = await ctx.prisma.post.findMany({ take: 10 })

		const users = (
			await clerkClient.users.getUserList({
				userId: posts.map((post) => post.authorId),
				limit: 10,
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
				},
			})

			if (alreadyLikePost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post already liked!",
				})
			}

			return await ctx.prisma.userLikePost.create({
				data: {
					postId: input,
					userId: ctx.authUserId,
				},
			})
		}),
	unlikePost: privateProcedure
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

			return await ctx.prisma.userLikePost.deleteMany({
				where: {
					postId: input,
					userId: ctx.authUserId,
				},
			})
		}),
})
