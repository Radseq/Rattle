import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import {
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getProfileByUserName,
	isUserLikedPost,
} from "../profile"

import type { ProfileExtend } from "~/components/profilePage/types"
import { clerkClient } from "@clerk/nextjs/dist/server/clerk"

const updateProfileRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

export const profileRouter = createTRPCRouter({
	getProfileByUsername: publicProcedure.input(z.string().min(3)).query(async ({ input }) => {
		const profile = await getProfileByUserName(input)
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

			const authors = await clerkClient.users.getUserList({
				userId: [authorId],
			})

			if (authors.length > 1 || !authors[0]) {
				throw new TRPCError({ code: "NOT_FOUND" })
			}

			const extended: ProfileExtend = {
				bannerImgUrl: input.bannerImageUrl,
				bio: input.bio,
				country: ctx.opts?.req.query.country as string | null,
				webPage: input.webPage,
			}

			await clerkClient.users.updateUserMetadata(authorId, {
				publicMetadata: {
					extended: extended,
				},
			})

			return extended
		}),
	votePostPoll: privateProcedure
		.input(
			z.object({
				postId: z.string().min(25, { message: "wrong postId" }),
				choiceId: z.number(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const getPostAlreadyVoted = ctx.prisma.userPollVote.findFirst({
				where: {
					postId: input.postId,
					userId: ctx.authUserId,
				},
			})

			const getPostPoll = ctx.prisma.postPoll.findFirst({
				where: {
					postId: input.postId,
				},
			})

			const [alreadyVoted, postPoll] = await Promise.all([getPostAlreadyVoted, getPostPoll])

			if (postPoll && new Date(postPoll.endDate) < new Date()) {
				throw new TRPCError({
					code: "CONFLICT",
					message: "Can't vote ended poll",
				})
			}

			const result: { oldChoiceId: number | null; newChoiceId: number | null } = {
				newChoiceId: null,
				oldChoiceId: null,
			}

			if (alreadyVoted && alreadyVoted.choiceId === input.choiceId) {
				const deletedVote = await ctx.prisma.userPollVote.delete({
					where: {
						id: alreadyVoted.id,
					},
				})
				if (!deletedVote) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Can't delete vote",
					})
				}

				result.newChoiceId = null
				result.oldChoiceId = alreadyVoted.choiceId
				return result
			} else if (alreadyVoted) {
				const updateVote = await ctx.prisma.userPollVote.update({
					where: {
						id: alreadyVoted.id,
					},
					data: {
						choiceId: input.choiceId,
					},
				})
				result.newChoiceId = updateVote.choiceId
				result.oldChoiceId = alreadyVoted.choiceId
				return result
			}
			const addVote = await ctx.prisma.userPollVote.create({
				data: {
					userId: ctx.authUserId,
					choiceId: input.choiceId,
					postId: input.postId,
				},
			})

			result.newChoiceId = addVote.choiceId
			result.oldChoiceId = null
			return result
		}),
	setPostLiked: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const alreadyLikePost = await isUserLikedPost(ctx.authUserId, input)

			if (alreadyLikePost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post already liked!",
				})
			}

			const result = await ctx.prisma.userLikePost.create({
				data: {
					postId: input,
					userId: ctx.authUserId,
				},
			})
			return result.postId
		}),
	setPostUnliked: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const alreadyLikePost = await isUserLikedPost(ctx.authUserId, input)

			if (!alreadyLikePost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is not liked!",
				})
			}

			await ctx.prisma.userLikePost.deleteMany({
				where: {
					postId: input,
					userId: ctx.authUserId,
				},
			})

			return input
		}),
	getPostsLikedByUser: privateProcedure
		.input(z.string().array().optional())
		.query(async ({ input, ctx }) => {
			if (!input) {
				return []
			}
			return await getPostsLikedByUser(ctx.authUserId, input)
		}),
	getPostIdsForwardedByUser: privateProcedure.query(async ({ ctx }) => {
		return getPostIdsForwardedByUser(ctx.authUserId)
	}),
})
