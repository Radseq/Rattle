import { TRPCError } from "@trpc/server"
import { CONFIG } from "~/config"
import { getUserFollowList } from "~/server/api/follow"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
} from "~/server/api/profile"
import { CacheSpecialKey, getCacheData } from "~/server/cache"
import { prisma } from "~/server/db"

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

	let postsLikedBySignInUser: string[] = []
	let postsPollVotedByUser: {
		postId: string
		choiceId: number
	}[] = []

	const [getPostsLikedBySignInUser, getPostsPollVotedByUser] = await Promise.all([
		getPostsLikedByUser(signInUserId, postIds),
		getUserVotedAnyPostsPoll(signInUserId, postIds),
	])
	postsLikedBySignInUser = getPostsLikedBySignInUser
	postsPollVotedByUser = getPostsPollVotedByUser

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

	const sortedPosts = posts.sort(
		(postA, postB) => new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
	)
	const result: PostWithAuthor[] = []
	for (const sortedPost of sortedPosts) {
		const postWithAuthor = {
			post: {
				...sortedPost,
				createdAt: sortedPost.createdAt.toString(),
				isLikedBySignInUser: postsLikedBySignInUser.some(
					(postId) => postId === sortedPost.id
				),
			},
			author,
		} as PostWithAuthor
		if (postWithAuthor.post.poll) {
			postWithAuthor.post.poll.choiceVotedBySignInUser = postsPollVotedByUser.find(
				(value) => value.postId === sortedPost.id
			)?.choiceId
		}
		result.push(postWithAuthor)
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

	return quotedByUser.map((post) => post.quotedId)
}
