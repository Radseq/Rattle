import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

export const profileRouter = createTRPCRouter({
	getProfileByUsername: publicProcedure.input(z.string().min(3)).query(async ({ input }) => {
		const authors = await clerkClient.users.getUserList({
			username: [input],
		})

		if (authors.length > 1 || !authors[0]) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author for posts not found!",
			})
		}

		const author = authors[0]

		return {
			id: author.id,
			username: author.username,
			profileImageUrl: author.profileImageUrl,
		}
	}),
})
