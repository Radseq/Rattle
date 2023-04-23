import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import { getProfileByUserName } from "../profile"

const updateProfileRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

export const profileRouter = createTRPCRouter({
	getProfileByUsername: publicProcedure.input(z.string().min(3)).query(async ({ ctx, input }) => {
		const profile = getProfileByUserName(input)
		if (!profile) {
			throw new TRPCError({
				code: "INTERNAL_SERVER_ERROR",
				message: "Profil not found!",
			})
		}
		return profile
	}),
	updateUser: privateProcedure
		.input(
			z.object({
				webPage: z
					.string()
					.max(100, { message: "Web Page url is too large, max 100 characters" })
					.url({ message: "Web Page url is not valid!" })
					.nullable(),
				bio: z
					.string()
					.max(500, { message: "Bio is too large, max 500 characters" })
					.nullable(),
				bannerImageUrl: z
					.string()
					.url({ message: "Banner Image Url is not valid!" })
					.max(100, { message: "Banner Image Url is too large, max 100 characters" })
					.nullable(),
				profileImageUrl: z
					.string()
					.url({ message: "Profile Image Url is not valid!" })
					.max(100, { message: "Profile Image Url is too large, max 100 characters" })
					.nullable(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await updateProfileRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			const user = await ctx.prisma.user.findFirst({
				where: {
					id: authorId,
				},
			})

			if (!user) {
				return await ctx.prisma.user.create({
					data: {
						id: authorId,
						bannerImageUrl: input.bannerImageUrl,
						bio: input.bio,
						profileImageUrl: input.profileImageUrl,
						webPage: input.webPage,
						country: ctx.opts?.req.query.country as string | undefined,
					},
				})
			}
			return await ctx.prisma.user.update({
				where: {
					id: authorId,
				},
				data: {
					bannerImageUrl: input.bannerImageUrl,
					bio: input.bio,
					profileImageUrl: input.profileImageUrl,
					webPage: input.webPage,
					country: ctx.opts?.req.query.country as string | undefined,
				},
			})
		}),
})
