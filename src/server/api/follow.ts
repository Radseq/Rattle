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
