import { clerkClient } from "@clerk/nextjs/server"
import { type PostWithAuthor } from "~/components/post/types"
import { CONFIG } from "~/config"
import type { Profile, ProfileExtend } from "~/features/profile"
import { getUserFollowList } from "~/server/api/follow"
import { getPostById } from "~/server/api/posts"
import {
	getPostAuthor,
	getPostIdsForwardedByUser,
	getPostsLikedByUser,
	getUserVotedAnyPostsPoll,
	isPostsQuotedByUser,
} from "~/server/api/profile"
import { prisma } from "~/server/db"
import { calculateSkip, getFullName } from "~/utils/helpers"
import { type Profile as WhoToFolloWProfile } from "~/features/search"

const MAX_USERS_COUNT = 20

export const getAllUsersByTag = async (tag: string, limit: number) => {
	const searchedProfiles: Profile[] = []

	const users = await clerkClient.users.getUserList({
		query: tag,
		limit,
	})

	users.forEach((user) => {
		const fullName = getFullName(user.firstName, user.lastName)
		const extended = user.publicMetadata.extended as ProfileExtend | null
		if (user.username && fullName) {
			searchedProfiles.push({
				id: user.id,
				username: user.username,
				fullName,
				profileImageUrl: user.profileImageUrl,
				createdAt: user.createdAt,
				extended,
			})
		}
	})
	return searchedProfiles
}

export const getPostsByTagInMessage = async (
	limit: number,
	tag: string,
	authUserId?: string,
	skip?: number,
	cursor?: string
) => {
	const take = limit ?? CONFIG.MAX_POSTS_BY_AUTHOR_ID

	const postsDb = await prisma.post.findMany({
		where: {
			content: {
				contains: tag,
			},
			replyId: null,
		},
		skip: calculateSkip(skip, cursor),
		take: take + 1,
		cursor: cursor ? { id: cursor } : undefined,
		orderBy: {
			id: "desc",
		},
		select: {
			id: true,
			authorId: true,
		},
	})

	let nextCursor: typeof cursor | undefined = undefined
	if (postsDb.length > limit) {
		const nextItem = postsDb.pop() // return the last item from the array
		nextCursor = nextItem?.id
	}

	let postsLikedByUser: string[] = []
	let postsPollVotedByUser: {
		postId: string
		choiceId: number
	}[] = []
	let postsQuotedByUser: string[] = []
	let followedUsers: string[] = []
	let forwardedPostsIds: string[] = []

	const postsIds = postsDb.map((post) => post.id)

	if (authUserId) {
		const [
			getPostsLikedBySignInUser,
			getPostsPollVotedByUser,
			getPostsIdsQuotedByUser,
			getFollowedUsers,
			getForwardedPostsIds,
		] = await Promise.all([
			getPostsLikedByUser(authUserId, postsIds),
			getUserVotedAnyPostsPoll(authUserId, postsIds),
			isPostsQuotedByUser(authUserId, postsIds),
			getUserFollowList(authUserId),
			getPostIdsForwardedByUser(authUserId),
		])
		postsLikedByUser = getPostsLikedBySignInUser
		postsPollVotedByUser = getPostsPollVotedByUser
		postsQuotedByUser = getPostsIdsQuotedByUser
		followedUsers = getFollowedUsers
		forwardedPostsIds = getForwardedPostsIds
	}

	const posts = await Promise.all(postsIds.map((id) => getPostById(id)))
	const postAuthors = await Promise.all(postsDb.map(({ authorId }) => getPostAuthor(authorId)))

	const sortedPosts = posts.sort(
		(postA, postB) => new Date(postB.createdAt).getTime() - new Date(postA.createdAt).getTime()
	)

	const result: PostWithAuthor[] = []
	for (const sortedPost of sortedPosts) {
		const author = postAuthors.find((post) => post.id === sortedPost.authorId)
		const post = {
			post: {
				...sortedPost,
				createdAt: sortedPost.createdAt.toString(),
			},
			author,
			signInUser: {
				isForwarded: forwardedPostsIds.some((postId) => postId === sortedPost.id),
				isLiked: postsLikedByUser.some((postId) => postId === sortedPost.id),
				isQuoted: postsQuotedByUser.some((postId) => postId === sortedPost.id),
				isVotedChoiceId: postsPollVotedByUser.filter(
					(vote) => vote.postId === sortedPost.id
				)[0]?.choiceId,
				authorFollowed: followedUsers.some((authorId) => authorId === author?.id),
			},
		} as PostWithAuthor
		result.push(post)
	}

	return {
		result,
		nextCursor,
	}
}

export const getAllUsersAndTags = async (tag: string) => {
	const searchedProfiles: WhoToFolloWProfile[] = []

	if (tag.length < 3) {
		return {
			searchedProfiles,
			searchedTags: [],
		}
	}

	const usersMatching = await clerkClient.users.getUserList({
		query: tag,
		limit: MAX_USERS_COUNT,
	})

	//todo future search tags?
	const searchedTags = [tag]

	usersMatching.forEach((user) => {
		const fullName = getFullName(user.firstName, user.lastName)
		if (user.username && fullName) {
			searchedProfiles.push({
				id: user.id,
				username: user.username,
				fullName,
				imageUrl: user.profileImageUrl,
			})
		}
	})

	return {
		searchedProfiles,
		searchedTags,
	}
}
