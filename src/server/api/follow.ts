import { type CacheSpecialKey, getCacheData, setCacheData } from "../cache"
import { prisma } from "../db"

const MAX_CACHE_USER_LIFETIME_IN_SECONDS = 600

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
	const result = await Promise.all([watchedCount, watchingCount])

	return {
		watchedCount: result[0],
		watchingCount: result[1],
	}
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

	void setCacheData(cacheKey, result, MAX_CACHE_USER_LIFETIME_IN_SECONDS)

	return result
}
