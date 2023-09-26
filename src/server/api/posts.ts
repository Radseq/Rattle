import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import { getPostAuthor } from "./profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "../cache"
import { type Post as PrismaPost } from "@prisma/client"
import type { Post, PostWithAuthor } from "~/components/post/types"

const MAX_CACHE_LIFETIME_IN_SECONDS = 60

export const getPostById = async (postId: string) => {
	const cacheKey: CacheSpecialKey = { id: postId, type: "post" }
	const postToReturn = await getCacheData<Post>(cacheKey)
	if (postToReturn) {
		return postToReturn
	}

	const getPost = prisma.post.findUnique({
		where: {
			id: postId,
		},
	})

	const getLikeCount = getPostLikeCount(postId)
	const getReplyCount = getPostReplyCount(postId)
	const getForwardsCount = getPostForwardCount(postId)
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

	const returnPost = {
		...post,
		createdAt,
		likeCount,
		replyCount,
		forwardsCount,
		quotedPost: quotedPost,
		quotedCount: quotedCount,
		poll: postPoll,
	} as Post

	void setCacheData(cacheKey, returnPost, MAX_CACHE_LIFETIME_IN_SECONDS)

	return returnPost
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

	return {
		post: createPostOfPrismaPost(getPost),
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

export const getPostForwardCount = async (postId: string) => {
	return await prisma.userPostForward.count({
		where: {
			postId,
		},
	})
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

export const replacementPostInArray = (
	replacement: PostWithAuthor,
	array: PostWithAuthor[] | undefined
) => {
	if (array) {
		const result = array.map((postWithAuthor) => {
			if (postWithAuthor.post.id === replacement.post.id) {
				return replacement
			}
			return postWithAuthor
		})
		return result
	}
	return undefined
}

export const createPostOfPrismaPost = (prismaPost: PrismaPost) => {
	return {
		...prismaPost,
		createdAt: prismaPost.createdAt.toString(),

		likeCount: 0,
		replyCount: 0,
		forwardsCount: 0,
		quotedPost: null,
		quotedCount: 0,
		poll: null,
		quotedId: null,
	} as Post
}

export const deletePost = async (postId: string, authorId: string) => {
	const result = prisma.post.deleteMany({
		where: {
			id: postId,
			authorId,
		},
	})

	const cacheKey: CacheSpecialKey = { id: postId, type: "post" }
	const postCache = getCacheData<Post>(cacheKey)

	const [getDeletedPost, getCachedPost] = await Promise.all([result, postCache])

	if (getCachedPost) {
		void setCacheData(cacheKey, null, 0)
	}

	return getDeletedPost.count > 0
}
