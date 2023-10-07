import { z } from "zod"
import { clerkClient } from "@clerk/nextjs/server"
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc"
import { calculateSkip, getFullName } from "~/utils/helpers"
import { type Profile as WhoToFolloWProfile } from "~/features/search"
import type { Profile, ProfileExtend } from "~/features/profile"
import { CONFIG } from "~/config"
import { prisma } from "~/server/db"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
	isPostsQuotedByUser,
} from "~/server/api/profile"
import { getUserFollowList } from "~/server/api/follow"
import { type PostWithAuthor } from "~/components/post/types"
import { getPostById } from "~/server/api/posts"
import { Trends } from "~/server/features/trends/TrendsCache"

const MAX_USERS_COUNT = 20
const MAX_TRENDS_LOADED = 12

export const searchRouter = createTRPCRouter({
	getAllUsersAndTags: publicProcedure.input(z.string()).query(async ({ input }) => {
		const searchedProfiles: WhoToFolloWProfile[] = []

		if (input.length < 3) {
			return {
				searchedProfiles,
				searchedTags: [],
			}
		}

		const usersMatching = await clerkClient.users.getUserList({
			query: input,
			limit: MAX_USERS_COUNT,
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
	getAllUsersByTag: publicProcedure
		.input(
			z.object({
				limit: z.number(),
				tag: z.string().min(3),
			})
		)
		.query(async ({ input }) => {
			const { limit, tag } = input

			const searchedProfiles: Profile[] = []

			const users = await clerkClient.users.getUserList({
				query: tag,
				limit,
			})

			users.forEach((user) => {
				const fullName = getFullName(user.firstName, user.lastName)
				const extended = user.publicMetadata.extended as ProfileExtend | null
				if (user.username && fullName) {
					searchedProfiles.push({
						id: user.id,
						username: user.username,
						fullName,
						profileImageUrl: user.profileImageUrl,
						createdAt: user.createdAt,
						extended,
					})
				}
			})
			return searchedProfiles
		}),
	getPostsByTagInMessage: publicProcedure
		.input(
			z.object({
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
				tag: z.string().min(3),
			})
		)
		.query(async ({ ctx, input }) => {
			const { limit, tag, cursor, skip } = input

			const take = limit ?? CONFIG.MAX_POSTS_BY_AUTHOR_ID

			const postsDb = await prisma.post.findMany({
				where: {
					content: {
						contains: tag,
					},
					replyId: null,
				},
				skip: calculateSkip(skip, cursor),
				take: take + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: {
					id: "desc",
				},
				select: {
					id: true,
					authorId: true,
				},
			})

			const signInUserId = ctx.authUserId

			let nextCursor: typeof cursor | undefined = undefined
			if (postsDb.length > limit) {
				const nextItem = postsDb.pop() // return the last item from the array
				nextCursor = nextItem?.id
			}

			let postsLikedByUser: string[] = []
			let postsPollVotedByUser: {
				postId: string
				choiceId: number
			}[] = []
			let postsQuotedByUser: string[] = []
			let followedUsers: string[] = []
			let forwardedPostsIds: string[] = []

			const postsIds = postsDb.map((post) => post.id)

			if (signInUserId) {
				const [
					getPostsLikedBySignInUser,
					getPostsPollVotedByUser,
					getPostsIdsQuotedByUser,
					getFollowedUsers,
					getForwardedPostsIds,
				] = await Promise.all([
					getPostsLikedByUser(signInUserId, postsIds),
					getUserVotedAnyPostsPoll(signInUserId, postsIds),
					isPostsQuotedByUser(signInUserId, postsIds),
					getUserFollowList(signInUserId),
					getPostIdsForwardedByUser(signInUserId),
				])
				postsLikedByUser = getPostsLikedBySignInUser
				postsPollVotedByUser = getPostsPollVotedByUser
				postsQuotedByUser = getPostsIdsQuotedByUser
				followedUsers = getFollowedUsers
				forwardedPostsIds = getForwardedPostsIds
			}

			const posts = await Promise.all(postsIds.map((id) => getPostById(id)))
			const postAuthors = await Promise.all(
				postsDb.map(({ authorId }) => getPostAuthor(authorId))
			)

			const sortedPosts = posts.sort(
				(postA, postB) =>
					new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
			)

			const result: PostWithAuthor[] = []
			for (const sortedPost of sortedPosts) {
				const author = postAuthors.find((post) => post.id === sortedPost.authorId)
				const post = {
					post: {
						...sortedPost,
						createdAt: sortedPost.createdAt.toString(),
					},
					author,
					signInUser: {
						isForwarded: forwardedPostsIds.some((postId) => postId === sortedPost.id),
						isLiked: postsLikedByUser.some((postId) => postId === sortedPost.id),
						isQuoted: postsQuotedByUser.some((postId) => postId === sortedPost.id),
						isVotedChoiceId: postsPollVotedByUser.filter(
							(vote) => vote.postId === sortedPost.id
						)[0]?.choiceId,
						authorFollowed: followedUsers.some((authorId) => authorId === author?.id),
					},
				} as PostWithAuthor
				result.push(post)
			}

			return {
				result,
				nextCursor,
			}
		}),
	getLastTrends: publicProcedure.query(() => {
		const trends = Trends()
		return trends.GetTrends("world", MAX_TRENDS_LOADED)
	}),
})
