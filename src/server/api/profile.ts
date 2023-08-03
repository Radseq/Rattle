import clerkClient from "@clerk/clerk-sdk-node"
import type { PostAuthor, Profile, ProfileExtend } from "~/components/profilePage/types"
import { filterClarkClientToAuthor, getFullName } from "~/utils/helpers"
import { prisma } from "../db"
import { type CacheSpecialKey, getCacheData, setCacheData } from "../cache"
import { userFollowFollowedCount } from "./follow"

const MAX_CHACHE_USER_LIFETIME_IN_SECONDS = 600

export const getProfileByUserName = async (userName: string) => {
	const userCacheKey: CacheSpecialKey = { id: userName, type: "profileUserName" }
	const profile = await getCacheData<Profile>(userCacheKey)
	if (profile) {
		return profile
	}

	const authors = await clerkClient.users.getUserList({
		username: [userName],
	})

	if (authors.length > 1 || !authors[0]) {
		return null
	}

	const author = authors[0]

	const extended = author.publicMetadata.extended as ProfileExtend | null

	const fullName = getFullName(author.firstName, author.lastName)

	if (!author.username) {
		return null
	}

	const { watchedCount, watchingCount } = await userFollowFollowedCount(author.id)

	const result = {
		id: author.id,
		username: author.username ?? "",
		profileImageUrl: author.profileImageUrl,
		fullName,
		createdAt: author.createdAt,
		extended,
		watchedCount,
		watchingCount,
	} as Profile

	void setCacheData(userCacheKey, result, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
}

export const getPostAuthor = async (authorId: string) => {
	const authorCacheKey: CacheSpecialKey = { id: authorId, type: "author" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		author = filterClarkClientToAuthor(await clerkClient.users.getUser(authorId))
		void setCacheData(authorCacheKey, author, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
	}

	return author
}

export const getUserVotedAnyPostsPoll = async (
	userId: string,
	postsId: string[]
): Promise<{ postId: string; choiceId: number }[]> => {
	const pollVoted = await prisma.userPollVote.findMany({
		where: {
			userId,
			postId: {
				in: postsId,
			},
		},
		select: {
			choiceId: true,
			postId: true,
		},
	})

	return pollVoted.map((poll) => {
		return {
			postId: poll.postId,
			choiceId: poll.choiceId,
		}
	})
}

export const getPostsLikedByUser = async (userId: string, postIds: string[]) => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsLiked" }
	const chacheIds = await getCacheData<string[]>(userCacheKey)
	if (chacheIds) {
		return chacheIds
	}

	const posts = await prisma.userLikePost.findMany({
		where: {
			userId,
			postId: {
				in: postIds,
			},
		},
		select: {
			postId: true,
		},
	})

	const ids = posts.map((post) => post.postId)
	void setCacheData(userCacheKey, ids, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
	return ids
}

export const isUserLikedPost = async (userId: string, postId: string): Promise<boolean> => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsLiked" }
	const chacheIds = await getCacheData<string[]>(userCacheKey)
	if (chacheIds) {
		return chacheIds.some((val) => val === postId)
	}

	const alreadyLikePost = await prisma.userLikePost.findFirst({
		where: {
			userId,
			postId,
		},
	})

	if (alreadyLikePost) {
		return true
	}
	return false
}

export const getPostIdsForwardedByUser = async (userId: string) => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsForwarded" }
	const chacheIds = await getCacheData<string[]>(userCacheKey)
	if (chacheIds) {
		return chacheIds
	}

	const result = await prisma.userPostForward.findMany({
		where: {
			userId,
		},
		select: {
			postId: true,
		},
	})

	const ids = result.map((post) => post.postId)
	void setCacheData(userCacheKey, ids, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)

	return ids
}

export const isUserForwardedPost = async (userId: string, postId: string): Promise<boolean> => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsForwarded" }
	const chacheIds = await getCacheData<string[]>(userCacheKey)
	if (chacheIds) {
		return chacheIds.some((val) => val === postId)
	}

	const forwardedPost = await prisma.userPostForward.findFirst({
		where: {
			userId,
			postId,
		},
	})
	if (forwardedPost) {
		return true
	}
	return false
}
