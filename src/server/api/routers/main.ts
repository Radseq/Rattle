import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "../trpc"
import { getUserFollowList } from "../follow"
import { ProfileExtend } from "~/components/profilePage/types"
import { getFullName } from "~/utils/helpers"

const MAS_USERS_TO_FOLLOW = 10

export const mainRouter = createTRPCRouter({
	whoToFollow: publicProcedure.query(async ({ ctx }) => {
		const usersToFollow = await clerkClient.users.getUserList({
			orderBy: "-created_at",
			limit: MAS_USERS_TO_FOLLOW,
		})
		let users = [...usersToFollow]
		if (ctx.authUserId) {
			const signInUser = await clerkClient.users.getUser(ctx.authUserId)
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
	}),
})
