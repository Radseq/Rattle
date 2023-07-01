import type { Post as PrismaPost } from "@prisma/client"
import { type PostAuthor } from "../profilePage/types"

export type PostWithAuthor = {
	author: PostAuthor
	post: Post
}

export type PostReplays = {
	postWithUser: PostWithAuthor
	replaysWithAuthor: PostWithAuthor[]
}

export type PostMenuItemsType = "view" | "followedAuthor" | "notFollowedAuthor" | "own"

type UserPollVotes = {
	id: number
	choice: string
	voteCount: number
}

export type Poll = {
	endDate: string
	userVotes: UserPollVotes[]
	choiceVotedBySignInUser: number | undefined
}

export type Post = PrismaPost & {
	createdAt: string
	likeCount: number
	replaysCount: number
	forwardsCount: number
	isLikedBySignInUser: boolean
	isForwardedPostBySignInUser: boolean
	quotedPost: PostWithAuthor | null
	quotedCount: number
	poll: Poll | null
}
