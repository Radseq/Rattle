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
	const getReplyCount = getPostReplyCount(postId)
	const getForwardsCount = getPostForwatdCount(postId)
	const getQuotedPost = getPostQuoteById(postId)
	const getQuotedCount = getPostQuotedCount(postId)
	const getPostPoll = getPostPollById(postId)
	const [post, likeCount, replyCount, forwardsCount, quotedPost, quotedCount, postPoll] =
		await Promise.all([
			getPost,
			getLikeCount,
			getReplyCount,
			getForwardsCount,
			getQuotedPost,
			getQuotedCount,
			getPostPoll,
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
		replyId: post.replyId,
		likeCount,
		replyCount: replyCount,
		forwardsCount,
		quotedPost: quotedPost,
		quotedCount: quotedCount,
		poll: postPoll,
	} as Post
}

export const getPostPollById = async (postId: string) => {
	const getPoll = await prisma.postPoll.findUnique({
		where: {
			postId,
		},
		include: {
			choices: true,
		},
	})

	if (!getPoll) {
		return null
	}

	const getPollVotesByUser = await prisma.userPollVote.findMany({
		where: {
			postId: postId,
		},
	})

	const userVotes = getPoll.choices.map((pollChoice) => {
		return {
			id: pollChoice.id,
			choice: pollChoice.choice,
			voteCount: getPollVotesByUser.filter((vote) => vote.choiceId === pollChoice.id).length,
		}
	})

	return {
		endDate: getPoll.endDate.toString(),
		userVotes,
	}
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
			replyId: getPost.replyId,
			likeCount: 0,
			replyCount: 0,
			forwardsCount: 0,
		} as Post,
		author: await getPostAuthor(getPost.authorId),
	}
}

export const getPostQuotedCount = async (postId: string) => {
	return await prisma.post.count({
		where: {
			quotedId: postId,
		},
	})
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

export const getPostReplyCount = async (postId: string) => {
	return await prisma.post.count({
		where: {
			replyId: postId,
		},
	})
}

export const getPostForwatdCount = async (postId: string) => {
	return await prisma.userPostForward.count({
		where: {
			postId,
		},
	})
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

export const isPostExists = async (postId: string): Promise<boolean> => {
	const post = await prisma.post.count({
		where: {
			id: postId,
		},
	})

	if (post) {
		return true
	}
	return false
}
