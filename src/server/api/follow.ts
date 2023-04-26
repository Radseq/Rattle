import { prisma } from "../db"

export const isFolloweed = async (watched: string, watching: string) => {
	const followeed = await prisma.followeed.findFirst({
		where: {
			watched,
			watching,
		},
	})

	if (followeed) {
		return true
	}

	return false
}

export const userFollowFolloweedCount = async (userId: string) => {
	const watchedCount = prisma.followeed.count({
		where: {
			watched: userId,
		},
	})
	const watchingCount = prisma.followeed.count({
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
