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

export const getUserFollowList = async (userId: string) => {
	const follow = await prisma.followeed.findMany({
		where: {
			watched: userId,
		},
		select: {
			watching: true,
		},
	})

	if (follow) {
		return follow.map((userId) => userId.watching)
	}

	return []
}
