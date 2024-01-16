import { TRPCError } from "@trpc/server"
import { CONFIG } from "~/config"
import { type PostWithAuthor } from "~/features/postItem"
import { type PostAuthor } from "~/features/profile"
import { getUserFollowList } from "~/server/api/follow"
import { getPostById } from "~/server/api/posts"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
	isPostsQuotedByUser,
} from "~/server/api/profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "~/server/cache"
import { prisma } from "~/server/db"
import { calculateSkip } from "~/utils/helpers"

// todo get from config file
const MAX_CACHE_USER_LIFETIME_IN_SECONDS = 600

export const fetchHomePosts = async (
	signInUserId: string,
	limit: number,
	cursor: string | null | undefined,
	skip: number | undefined,
) => {
	const followedAuthorsByUser = await getUserFollowList(signInUserId)

	const take = limit ?? CONFIG.MAX_POSTS_BY_AUTHOR_ID
	const postIds: string[] = []

	const postsByAuthorIds = prisma.post.findMany({
		where: { authorId: { in: [signInUserId, ...followedAuthorsByUser] }, replyId: null },
		skip: calculateSkip(skip, cursor),
		take: take + 1,
		cursor: cursor ? { id: cursor } : undefined,
		orderBy: {
			id: "desc",
		},
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

	let nextCursor: typeof cursor | undefined = undefined
	if (getPostsByAuthorIds.length > limit) {
		const nextItem = getPostsByAuthorIds.pop() // return the last item from the array
		nextCursor = nextItem?.id
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
	let followedUsers: string[] = []

	const [
		getPostsLikedBySignInUser,
		getPostsPollVotedByUser,
		getPostsIdsQuotedByUser,
		getFollowedUsers,
	] = await Promise.all([
		getPostsLikedByUser(signInUserId, postIds),
		getUserVotedAnyPostsPoll(signInUserId, postIds),
		isPostsQuotedByUser(signInUserId, postIds),
		getUserFollowList(signInUserId),
	])
	postsLikedByUser = getPostsLikedBySignInUser
	postsPollVotedByUser = getPostsPollVotedByUser
	postsQuotedByUser = getPostsIdsQuotedByUser
	followedUsers = getFollowedUsers

	const authorCacheKey: CacheSpecialKey = { id: signInUserId, type: "author" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		author = await getPostAuthor(signInUserId)
		void setCacheData(authorCacheKey, author, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
	}

	if (!author || !author.username) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Author for posts not found!",
		})
	}

	const posts = await Promise.all(postIds.map((id) => getPostById(id)))

	const sortedPosts = posts.sort(
		(postA, postB) => new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime(),
	)
	const result: PostWithAuthor[] = []
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
					(vote) => vote.postId === sortedPost.id,
				)[0]?.choiceId,
				authorFollowed: followedUsers.some((authorId) => authorId === author?.id),
			},
		} as PostWithAuthor
		result.push(homePost)
	}

	return {
		result,
		nextCursor,
	}
}
