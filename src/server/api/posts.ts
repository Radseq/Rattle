import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import type { Post } from "~/components/postsPage/types"

export const getPostById = async (postId: string) => {
	const getPost = prisma.post.findUnique({
		where: {
			id: postId,
		},
	})

	const getLikeCount = getPostLikeCount(postId)
	const getReplayCount = getPostReplayCount(postId)
	const getForwardsCount = getPostForwatdCount(postId)

	const [post, likeCount, replaysCount, forwardsCount] = await Promise.all([
		getPost,
		getLikeCount,
		getReplayCount,
		getForwardsCount,
	])
	if (!post) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Post not found",
		})
	}
	return {
		id: post.id,
		createdAt: post.createdAt,
		content: post.content,
		authorId: post.authorId,
		imageUrl: post.imageUrl,
		mediaUrl: post.mediaUrl,
		replayId: post.replayId,
		likeCount,
		replaysCount,
		forwardsCount,
	} as Post
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
