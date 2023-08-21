import { clerkClient } from "@clerk/nextjs/server"
import { CONFIG } from "~/config"
import { type ProfileExtend } from "~/features/profile"
import { getUserFollowList } from "~/server/api/follow"
import { getFullName } from "~/utils/helpers"

export const whoToFollow = async (userId: string | null) => {
	const usersToFollow = await clerkClient.users.getUserList({
		orderBy: "-created_at",
		limit: CONFIG.LIMIT_USERS_IN_WHO_TO_FOLLOW,
	})

	let users = [...usersToFollow]
	if (userId) {
		const signInUser = await clerkClient.users.getUser(userId)
		const follows = await getUserFollowList(signInUser.id)
		if (follows) {
			users = users.filter((user) => !follows.includes(user.id))
		}
	}

	return users.map((user) => {
		const extended = user.publicMetadata.extended as ProfileExtend | null

		const fullName = getFullName(user.firstName, user.lastName)
		return {
			id: user.id,
			username: user.username,
			fullName,
			profileImageUrl: user.profileImageUrl,
			bio: extended?.bio ?? null,
		}
	})
}
