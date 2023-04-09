import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"

const postRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

export const postsRouter = createTRPCRouter({
	getAllByAuthorId: publicProcedure.input(z.string()).query(async ({ ctx, input }) => {
		const posts = await ctx.prisma.post.findMany({
			where: { authorId: input },
			orderBy: { createdAt: "desc" },
			take: 10,
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
		).map((user) => ({
			id: user.id,
			username: user.username,
			profileImageUrl: user.profileImageUrl,
		}))

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
		.input(z.object({ content: z.string().min(1).max(144) }))
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
})
