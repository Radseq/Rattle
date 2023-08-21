import { type WatchedWatching } from "~/features/profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "../cache"
import { prisma } from "../db"
import { CONFIG } from "~/config"

export const isFollowed = async (watched: string, watching: string) => {
	const followed = await prisma.followed.findFirst({
		where: {
			watched,
			watching,
		},
	})

	if (followed) {
		return true
	}

	return false
}

export const userFollowFollowedCount = async (userId: string) => {
	const cacheKey: CacheSpecialKey = { id: userId, type: "watchedWatching" }
	const watchedWatchingCache = await getCacheData<WatchedWatching>(cacheKey)
	if (watchedWatchingCache) {
		return watchedWatchingCache
	}

	const watchedCount = prisma.followed.count({
		where: {
			watched: userId,
		},
	})
	const watchingCount = prisma.followed.count({
		where: {
			watching: userId,
		},
	})
	const watchedWatching = await Promise.all([watchedCount, watchingCount])

	const result = {
		watchedCount: watchedWatching[0],
		watchingCount: watchedWatching[1],
	}

	void setCacheData(cacheKey, result, CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS)
	return result
}

export const getUserFollowList = async (userId: string) => {
	const cacheKey: CacheSpecialKey = { id: userId, type: "UserFollowList" }
	const followingCache = await getCacheData<string[]>(cacheKey)
	if (followingCache) {
		return followingCache
	}

	const follow = await prisma.followed.findMany({
		where: {
			watched: userId,
		},
		select: {
			watching: true,
		},
	})

	const result: string[] = follow.map((userId) => userId.watching)

	void setCacheData(cacheKey, result, CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS)

	return result
}

export const setWatchingCountCache = async (userId: string, type: "add" | "remove") => {
	const cacheWatchedWatchingKey: CacheSpecialKey = {
		id: userId,
		type: "watchedWatching",
	}

	const watchedWatchingCache = await getCacheData<WatchedWatching>(cacheWatchedWatchingKey)
	if (watchedWatchingCache) {
		watchedWatchingCache.watchingCount = type == "add" ? +1 : -1
		void setCacheData(
			cacheWatchedWatchingKey,
			watchedWatchingCache,
			CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS
		)
	}
}

export const setWatchedCountCache = async (userId: string, type: "add" | "remove") => {
	const cacheWatchedWatchingKey: CacheSpecialKey = {
		id: userId,
		type: "watchedWatching",
	}

	const watchedWatchingCache = await getCacheData<WatchedWatching>(cacheWatchedWatchingKey)
	if (watchedWatchingCache) {
		watchedWatchingCache.watchedCount = type == "add" ? +1 : -1
		void setCacheData(
			cacheWatchedWatchingKey,
			watchedWatchingCache,
			CONFIG.MAX_CACHE_USER_LIFETIME_IN_SECONDS
		)
	}
}
