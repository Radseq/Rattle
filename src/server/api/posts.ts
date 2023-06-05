import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import type { Post } from "~/components/postsPage/types"
import { getPostAuthor } from "./profile"

export const getPostById = async (postId: string) => {
	const getPost = prisma.post.findUnique({
		where: {
			id: postId,
		},
	})

	const getLikeCount = getPostLikeCount(postId)
	const getReplayCount = getPostReplayCount(postId)
	const getForwardsCount = getPostForwatdCount(postId)
	const getQuotedPost = getPostQuoteById(postId)
	const [post, likeCount, replaysCount, forwardsCount, quotedPost] = await Promise.all([
		getPost,
		getLikeCount,
		getReplayCount,
		getForwardsCount,
		getQuotedPost,
	])
	if (!post) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Post not found",
		})
	}

	const createdAt = post.createdAt.toString()

	return {
		id: post.id,
		createdAt,
		content: post.content,
		authorId: post.authorId,
		imageUrl: post.imageUrl,
		mediaUrl: post.mediaUrl,
		replayId: post.replayId,
		likeCount,
		replaysCount,
		forwardsCount,
		quotedPost: quotedPost,
	} as Post
}

export const getPostQuoteById = async (postId: string) => {
	const getQuotedPost = await prisma.post.findUnique({
		where: {
			id: postId,
		},
		select: {
			quotedId: true,
		},
	})

	if (!getQuotedPost?.quotedId) {
		return null
	}

	const getPost = await prisma.post.findUnique({
		where: {
			id: getQuotedPost?.quotedId,
		},
	})

	if (!getPost) {
		return null
	}

	const createdAt = getPost.createdAt.toString()

	return {
		post: {
			id: getPost.id,
			createdAt,
			content: getPost.content,
			authorId: getPost.authorId,
			imageUrl: getPost.imageUrl,
			mediaUrl: getPost.mediaUrl,
			replayId: getPost.replayId,
			likeCount: 0,
			replaysCount: 0,
			forwardsCount: 0,
		} as Post,
		author: await getPostAuthor(getPost.authorId),
	}
}

export const getPostLikeCount = async (postId: string) => {
	return await prisma.userLikePost.count({
		where: {
			postId: postId,
		},
	})
}

export const getPostLikedByUser = async (postId: string, signInUserId: string) => {
	const result = await prisma.userLikePost.findFirst({
		where: {
			postId: postId,
			userId: signInUserId,
		},
	})

	if (result) {
		return true
	}
	return false
}

export const getPostReplayCount = async (postId: string) => {
	return await prisma.post.count({
		where: {
			replayId: postId,
		},
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

export const getPostForwatdCount = async (postId: string) => {
	return await prisma.userPostForward.count({
		where: {
			postId,
		},
	})
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

export const isUserForwardedPost = async (userId: string, postId: string): Promise<boolean> => {
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
