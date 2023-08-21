import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { getFullName } from "~/utils/helpers"
import { type Profile } from "~/features/search"
import { CONFIG } from "~/config"

export const searchRouter = createTRPCRouter({
	getAllUsersAndTags: publicProcedure.input(z.string()).query(async ({ input }) => {
		const searchedProfiles: Profile[] = []

		if (input.length < 3) {
			return {
				searchedProfiles,
				searchedTags: [],
			}
		}

		const usersMatching = await clerkClient.users.getUserList({
			query: input,
			limit: CONFIG.LIMIT_PROFILE_ENTITIES,
		})

		//todo future search tags?
		const searchedTags = [input]

		usersMatching.forEach((user) => {
			const fullName = getFullName(user.firstName, user.lastName)
			if (user.username && fullName) {
				searchedProfiles.push({
					id: user.id,
					username: user.username,
					fullName,
					imageUrl: user.profileImageUrl,
				})
			}
		})

		return {
			searchedProfiles,
			searchedTags,
		}
	}),
})
