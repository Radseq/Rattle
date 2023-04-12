import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"

const getFullName = (frstName: string | null, lastName: string | null) => {
	let fullName = frstName
	if (fullName && lastName) {
		fullName += " " + lastName
	}
	return fullName
}

export const profileRouter = createTRPCRouter({
	getProfileByUsername: publicProcedure.input(z.string().min(3)).query(async ({ ctx, input }) => {
		const authors = await clerkClient.users.getUserList({
			username: [input],
		})

		if (authors.length > 1 || !authors[0]) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author for posts not found!",
			})
		}

		const author = authors[0]

		if (!author.username) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Author don't has username!",
			})
		}

		const user = await ctx.prisma.user.findFirst({
			where: {
				id: author.id,
			},
		})

		return {
			id: author.id,
			username: author.username,
			profileImageUrl: author.profileImageUrl,
			fullName: getFullName(author.firstName, author.lastName),
			createdAt: author.createdAt,
			bannerImgUrl: user && user.bannerImageUrl,
			bio: user && user.bio,
			webPage: user && user.webPage,
		}
	}),
})
