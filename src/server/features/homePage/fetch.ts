import { TRPCError } from "@trpc/server"
import { type PostAuthor } from "~/components/profilePage/types"
import { CONFIG } from "~/config"
import type { HomePost, Post } from "~/features/homePage"
import { getUserFollowList } from "~/server/api/follow"
import { getPostById } from "~/server/api/posts"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
} from "~/server/api/profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "~/server/cache"
import { prisma } from "~/server/db"

// todo get from config file
const MAX_CHACHE_USER_LIFETIME_IN_SECONDS = 600

export const FetchPosts = async (signInUserId: string) => {
	const followedAuthorsByUser = await getUserFollowList(signInUserId)

	const postIds: string[] = []
	const postsByAuthorIds = prisma.post.findMany({
		where: { authorId: { in: [signInUserId, ...followedAuthorsByUser] }, replyId: null },
		orderBy: { createdAt: "desc" },
		take: CONFIG.MAX_POSTS_BY_AUTHOR_ID,
		select: {
			id: true,
		},
	})

	const forwardedPostsIds = getPostIdsForwardedByUser(signInUserId)

	const [getPostForwardedIds, getPostsByAuthorIds] = await Promise.all([
		forwardedPostsIds,
		postsByAuthorIds,
	])

	for (const post of getPostsByAuthorIds) {
		postIds.push(post.id)
	}

	for (const id of getPostForwardedIds) {
		postIds.push(id)
	}

	let postsLikedByUser: string[] = []
	let postsPollVotedByUser: {
		postId: string
		choiceId: number
	}[] = []
	let postsQuotedByUser: string[] = []

	const [getPostsLikedBySignInUser, getPostsPollVotedByUser, getPostsIdsQuotedByUser] =
		await Promise.all([
			getPostsLikedByUser(signInUserId, postIds),
			getUserVotedAnyPostsPoll(signInUserId, postIds),
			isPostsAreQuoted(signInUserId, postIds),
		])
	postsLikedByUser = getPostsLikedBySignInUser
	postsPollVotedByUser = getPostsPollVotedByUser
	postsQuotedByUser = getPostsIdsQuotedByUser

	const authorCacheKey: CacheSpecialKey = { id: signInUserId, type: "author" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		author = await getPostAuthor(signInUserId)
		void setCacheData(authorCacheKey, author, MAX_CHACHE_USER_LIFETIME_IN_SECONDS)
	}

	if (!author || !author.username) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Author for posts not found!",
		})
	}

	const posts = await Promise.all(postIds.map((id) => getPostById(id)))
	const newPosts: Post[] = []

	// to cast 'old post' to new post (from homepost types)
	posts.forEach((loopPost) => {
		newPosts.push(loopPost as Post)
	})

	const sortedPosts = newPosts.sort(
		(postA, postB) => new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
	)
	const result: HomePost[] = []
	for (const sortedPost of sortedPosts) {
		const homePost = {
			post: {
				...sortedPost,
				createdAt: sortedPost.createdAt.toString(),
			},
			author,
			signInUser: {
				isForwarded: getPostForwardedIds.some((post) => post === sortedPost.id),
				isLiked: postsLikedByUser.some((post) => post === sortedPost.id),
				isQuoted: postsQuotedByUser.some((post) => post === sortedPost.id),
				isVotedChoiceId: postsPollVotedByUser.filter(
					(vote) => vote.postId === sortedPost.id
				)[0]?.choiceId,
			},
		} as HomePost
		result.push(homePost)
	}

	return result
}

const isPostsAreQuoted = async (userId: string, postsId: string[]) => {
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
