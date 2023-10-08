import { TRPCError } from "@trpc/server"
import { type PostWithAuthor } from "~/components/post/types"
import { CONFIG } from "~/config"
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

export const fetchProfilePosts = async (
	authorId: string,
	limit: number,
	cursor?: string,
	skip?: number,
	signInUserId?: string
) => {
	const postIds: string[] = []

	const take = limit ?? CONFIG.MAX_POSTS_BY_AUTHOR_ID

	const postsByAuthorIds = prisma.post.findMany({
		where: { authorId, replyId: null },
		orderBy: { createdAt: "desc" },
		skip: calculateSkip(skip, cursor),
		take: take + 1,
		cursor: cursor ? { id: cursor } : undefined,
		select: {
			id: true,
		},
	})

	const forwardedPostsIds = getPostIdsForwardedByUser(authorId)

	const [getPostForwardedIds, getPostsByAuthorIds] = await Promise.all([
		forwardedPostsIds,
		postsByAuthorIds,
	])

	let nextCursor: typeof cursor | undefined = undefined
	if (getPostsByAuthorIds.length > limit) {
		const nextItem = getPostsByAuthorIds.pop()
		nextCursor = nextItem?.id
	}

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
	let postsQuotedByUser: string[] = []
	let followedUsers: string[] = []
	if (signInUserId) {
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
		postsLikedBySignInUser = getPostsLikedBySignInUser
		postsPollVotedByUser = getPostsPollVotedByUser
		postsQuotedByUser = getPostsIdsQuotedByUser
		followedUsers = getFollowedUsers
	}

	const authorCacheKey: CacheSpecialKey = { id: authorId, type: "author" }
	let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
	if (!author) {
		author = await getPostAuthor(authorId)
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
		(postA, postB) => new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
	)
	const result: PostWithAuthor[] = []
	for (const sortedPost of sortedPosts) {
		const postWithAuthor = {
			post: {
				...sortedPost,
				createdAt: sortedPost.createdAt.toString(),
			},
			signInUser: {
				isForwarded: getPostForwardedIds.some((post) => post === sortedPost.id),
				isLiked: postsLikedBySignInUser.some((post) => post === sortedPost.id),
				isQuoted: postsQuotedByUser.some((post) => post === sortedPost.id),
				isVotedChoiceId: postsPollVotedByUser.filter(
					(vote) => vote.postId === sortedPost.id
				)[0]?.choiceId,
				authorFollowed: followedUsers.some((authorId) => authorId === author?.id),
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
	return {
		result,
		nextCursor,
	}
}
