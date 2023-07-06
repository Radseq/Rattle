import clerkClient from "@clerk/clerk-sdk-node"
import type { Profile, ProfileExtend } from "~/components/profilePage/types"
import { filterClarkClientToUser, getFullName } from "~/utils/helpers"
import { prisma } from "../db"

export const getProfileByUserName = async (userName: string) => {
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

	return {
		id: author.id,
		username: author.username ?? "",
		profileImageUrl: author.profileImageUrl,
		fullName,
		createdAt: author.createdAt,
		extended,
	} as Profile
}

export const getPostAuthor = async (authorId: string) => {
	const author = await clerkClient.users.getUser(authorId)
	if (!author) {
		return null
	}

	return filterClarkClientToUser(author)
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

	return posts.map((post) => post.postId)
}

export const isUserLikedPost = async (userId: string, postId: string): Promise<boolean> => {
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
	const result = await prisma.userPostForward.findMany({
		where: {
			userId,
		},
		select: {
			postId: true,
		},
	})
	if (result) {
		return result.map((post) => post.postId)
	}
	return []
}
