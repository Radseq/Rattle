import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import { filterClarkClientToUser } from "~/utils/helpers"
import { CONFIG } from "~/config"
import type { Post } from "~/components/postsPage/types"

export const getPostReplays = async (postId: string) => {
	const getPostReplays = await prisma.post.findMany({
		where: {
			replayId: postId,
		},
		orderBy: { createdAt: "desc" },
		take: CONFIG.MAX_POST_REPLAYS,
		select: {
			id: true,
			authorId: true,
		},
	})

	const postReplays = await Promise.all(getPostReplays.map((post) => getPostById(post.id)))

	const replaysAuthors = await clerkClient.users.getUserList({
		userId: getPostReplays.map((post) => post.authorId),
	})

	if (!replaysAuthors) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Author of posts not found",
		})
	}

	return {
		replays: postReplays.map((postReplay) => {
			const postAuthor = replaysAuthors.find((user) => user.id === postReplay.authorId)
			if (!postAuthor) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author of one of the posts not found",
				})
			}
			return {
				post: { ...postReplay, createdAt: postReplay.createdAt.toString() },
				author: filterClarkClientToUser(postAuthor),
			}
		}),
	}
}

export const getPostById = async (postId: string) => {
	const getPost = prisma.post.findUnique({
		where: {
			id: postId,
		},
	})

	const getLikeCount = getPostLiksCount(postId)

	const getReplayCount = getPostReplayCount(postId)

	const [post, likeCount, replaysCount] = await Promise.all([
		getPost,
		getLikeCount,
		getReplayCount,
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
	} as Post
}

export const getPostLiksCount = async (postId: string) => {
	return await prisma.userLikePost.count({
		where: {
			postId: postId,
		},
	})
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
