import { z } from "zod"
import { createTRPCRouter, privateProcedure, publicProcedure } from "../trpc"
import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "~/server/db"
import {
	isFollowed,
	setWatchedCountCache,
	setWatchingCountCache,
	userFollowFollowedCount,
} from "../follow"
import { type CacheSpecialKey, getCacheData, setCacheData } from "~/server/cache"
import { CONFIG } from "~/config"

export const followRouter = createTRPCRouter({
	isFollowed: publicProcedure
		.input(z.string().min(32, { message: "Wrong user input!" }))
		.query(async ({ ctx, input }) => {
			if (!ctx.authUserId) {
				return false
			}

			return isFollowed(ctx.authUserId, input)
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
			if (!following || !following.username) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "User to following not found!",
				})
			}

			const create = await prisma.followed.create({
				data: {
					watched: followed,
					watching: following.id,
				},
			})
			if (create) {
				const cacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "UserFollowList" }
				const followingCache = await getCacheData<string[]>(cacheKey)
				if (followingCache) {
					void setCacheData(
						cacheKey,
						[followingCache, following.id],
						CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS
					)
				}

				await setWatchedCountCache(input, "add")

				if (ctx.authUserId) {
					await setWatchingCountCache(ctx.authUserId, "add")
				}

				return {
					addedUserName: following.username,
					idAdded: create.watching,
					userId: create.watched,
				}
			}
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
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

			const deleted = await prisma.followed.deleteMany({
				where: {
					watched: followed,
					watching: following.id,
				},
			})
			if (deleted.count) {
				const cacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "UserFollowList" }
				const followingCache = await getCacheData<string[]>(cacheKey)
				if (followingCache) {
					void setCacheData(
						cacheKey,
						followingCache.filter((userId) => userId != followed),
						CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS
					)
				}

				await setWatchedCountCache(input, "remove")

				if (ctx.authUserId) {
					await setWatchingCountCache(ctx.authUserId, "remove")
				}
			}
		}),
	getProfileWatchedWatching: publicProcedure.input(z.string()).query(async ({ input }) => {
		return await userFollowFollowedCount(input)
	}),
})
