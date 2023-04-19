import { z } from "zod"
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc"
import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "~/server/db"

export const followRouter = createTRPCRouter({
	isFolloweed: publicProcedure
		.input(z.string().min(32, { message: "Wrong user input!" }))
		.query(async ({ ctx, input }) => {
			if (!ctx.authUserId) {
				return false
			}

			const followeed = await prisma.followeed.findFirst({
				where: {
					watched: ctx.authUserId,
					watching: input,
				},
			})

			if (followeed) {
				return true
			}

			return false
		}),
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
	stopFollowing: privateProcedure
		.input(z.string().min(32, { message: "Wrong user input!" }))
		.mutation(async ({ ctx, input }) => {
			const followed = ctx.authUserId
			if (input === followed) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "System Error!",
				})
			}

			const following = await clerkClient.users.getUser(input)
			if (!following) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "User to following not found!",
				})
			}

			return await prisma.followeed.deleteMany({
				where: {
					watched: followed,
					watching: following.id,
				},
			})
		}),
})
