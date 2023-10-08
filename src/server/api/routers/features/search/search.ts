import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { Trends } from "~/server/features/trends/TrendsCache"
import { getAllUsersByTag, getPostsByTagInMessage } from "~/server/features/search"

const MAX_TRENDS_LOADED = 12

export const searchRouter = createTRPCRouter({
	getAllUsersAndTags: publicProcedure.input(z.string()).query(async ({ input }) => {}),
	getAllUsersByTag: publicProcedure
		.input(
			z.object({
				limit: z.number(),
				tag: z.string().min(3),
			})
		)
		.query(async ({ input }) => {
			return getAllUsersByTag(input.tag, input.limit)
		}),
	getPostsByTagInMessage: publicProcedure
		.input(
			z.object({
				limit: z.number(),
				cursor: z.string().optional(),
				skip: z.number().optional(),
				tag: z.string().min(3),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, tag, cursor, skip } = input

			return getPostsByTagInMessage(limit, tag, ctx.authUserId, skip, cursor)
		}),
	getLastTrends: publicProcedure.query(() => {
		const trends = Trends()
		return trends.GetTrends("world", MAX_TRENDS_LOADED)
	}),
})
