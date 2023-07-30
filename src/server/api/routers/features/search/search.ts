import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

const MAX_USERS_COUNT = 20

export const searchRouter = createTRPCRouter({
	getAllUsersAndTags: publicProcedure.input(z.string()).query(async ({ input }) => {
		if (!input) {
			return ""
		}

		const usersMatching = await clerkClient.users.getUserList({
			query: input,
			limit: MAX_USERS_COUNT,
		})

		//todo future search tags?
		const searchedTags = [input]

		const searchedProfiles = usersMatching.map((user) => {
			return {
				id: user.id,
				username: user.username,
				firstName: user.firstName,
				lastName: user.lastName,
			}
		})

		return {
			searchedProfiles,
			searchedTags,
		}
	}),
})
