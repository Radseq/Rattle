import clerkClient from "@clerk/clerk-sdk-node"

import { filterClarkClientToAuthor, getFullName } from "~/utils/helpers"
import { prisma } from "../db"
import { type CacheSpecialKey, getCacheData, setCacheData } from "../cache"
import type { PostAuthor, Profile, ProfileExtend } from "~/features/profile"

const MAX_CACHE_USER_LIFETIME_IN_SECONDS = 600

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

	const result = {
		id: author.id,
		username: author.username ?? "",
		profileImageUrl: author.profileImageUrl,
		fullName,
		createdAt: author.createdAt,
		extended,
	} as Profile

	void setCacheData(userCacheKey, result, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
	return result
}

export const getPostAuthor = async (authorId: string) => {
	const authorCacheKey: CacheSpecialKey = { id: authorId, type: "author" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		author = filterClarkClientToAuthor(await clerkClient.users.getUser(authorId))
		void setCacheData(authorCacheKey, author, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
	}

	return author
}

export const getPostAuthorByUsername = async (username: string) => {
	const authorCacheKey: CacheSpecialKey = { id: username, type: "authorByUsername" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		const users = await clerkClient.users.getUserList({ [username]: username })
		const user = users.at(0)
		if (user) {
			author = filterClarkClientToAuthor(user)
			void setCacheData(authorCacheKey, author, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
		}
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
	const cacheIds = await getCacheData<string[]>(userCacheKey)
	if (cacheIds) {
		return cacheIds
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
	void setCacheData(userCacheKey, ids, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
	return ids
}

export const isUserLikedPost = async (userId: string, postId: string): Promise<boolean> => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsLiked" }
	const cacheIds = await getCacheData<string[]>(userCacheKey)
	if (cacheIds) {
		return cacheIds.some((val) => val === postId)
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
	const cacheIds = await getCacheData<string[]>(userCacheKey)
	if (cacheIds) {
		return cacheIds
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
	void setCacheData(userCacheKey, ids, MAX_CACHE_USER_LIFETIME_IN_SECONDS)

	return ids
}

export const isUserForwardedPost = async (userId: string, postId: string): Promise<boolean> => {
	const userCacheKey: CacheSpecialKey = { id: userId, type: "postsForwarded" }
	const cacheIds = await getCacheData<string[]>(userCacheKey)
	if (cacheIds) {
		return cacheIds.some((val) => val === postId)
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

export const isPostsQuotedByUser = async (userId: string, postsId: string[]) => {
	const quotedByUser = await prisma.post.findMany({
		where: {
			authorId: userId,
			quotedId: {
				in: postsId,
			},
		},
		select: {
			quotedId: true,
		},
	})
	const result: string[] = []

	quotedByUser.forEach((post) => {
		if (post.quotedId) {
			result.push(post.quotedId)
		}
	})

	return result
}
