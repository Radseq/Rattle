import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "~/server/api/trpc"
import clerkClient from "@clerk/clerk-sdk-node"
import { calculateSkip, getFullName } from "~/utils/helpers"
import { type Profile } from "~/features/profile"
import { type PrivateMessage } from "~/features/privateMessagePage"

export const privateMessagesRouter = createTRPCRouter({
	getLastPrivateMessagesUsers: privateProcedure
		.input(
			z.object({
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const take = input.limit ?? 10 // todo move to config

			const incomeMessages = await ctx.prisma.privateMessages.findMany({
				where: {
					destUserId: ctx.authUserId,
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(input.skip, input.cursor),
				take: take + 1,
				cursor: input.cursor ? { id: input.cursor } : undefined,
				select: {
					authorId: true,
				},
			})

			let nextCursor: typeof input.cursor | undefined = undefined
			if (incomeMessages.length > input.limit) {
				const nextItem = incomeMessages.pop()
				nextCursor = nextItem?.authorId
			}

			if (incomeMessages && incomeMessages.length === 0) {
				return {
					result: [],
					nextCursor,
				}
			}

			const users = await clerkClient.users.getUserList({
				userId: incomeMessages.map((message) => message.authorId),
			})

			const result = users.map((user) => {
				const fullName = getFullName(user.firstName, user.lastName)

				const result = {
					id: user.id,
					username: user.username ?? "",
					profileImageUrl: user.imageUrl,
					fullName,
					createdAt: user.createdAt,
				} as Profile

				return result
			})

			return {
				result,
				nextCursor,
			}
		}),
	getPrivateMessages: privateProcedure
		.input(
			z.object({
				authorId: z.string(),
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			const take = input.limit ?? 10 // todo move to config

			const incomeMessages = await ctx.prisma.privateMessages.findMany({
				where: {
					destUserId: input.authorId,
				},
				orderBy: { createdAt: "desc" },
				skip: calculateSkip(input.skip, input.cursor),
				take: take + 1,
				cursor: input.cursor ? { id: input.cursor } : undefined,
			})

			let nextCursor: typeof input.cursor | undefined = undefined
			if (incomeMessages.length > input.limit) {
				const nextItem = incomeMessages.pop()
				nextCursor = nextItem?.authorId
			}

			return {
				result: incomeMessages.map((message) => {
					return {
						createAt: message.createdAt,
						imageUrl: message.imageUrl,
						text: message.text,
						id: message.id,
					} as PrivateMessage
				}),
				nextCursor,
			}
		}),
})
