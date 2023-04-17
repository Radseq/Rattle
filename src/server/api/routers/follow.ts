import { z } from "zod"
import { createTRPCRouter, privateProcedure } from "../trpc"
import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "~/server/db"

export const followRouter = createTRPCRouter({
	addUserToFollow: privateProcedure
		.input(z.string().min(32, { message: "Wrong user input!" }))
		.mutation(async ({ ctx, input }) => {
			const followed = ctx.authUserId
			if (input === followed) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "You can't follow yourself!",
				})
			}

			const following = await clerkClient.users.getUser(input)
			if (!following) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "User to following not found!",
				})
			}

			return await prisma.followeed.create({
				data: {
					watched: followed,
					watching: following.id,
				},
			})
		}),
})
