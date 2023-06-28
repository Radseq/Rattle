import type { Post as PrismaPost } from "@prisma/client"
import { type PostAuthor } from "../profilePage/types"
import { type PollLength } from "../homePage/types"

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

export type PostPoll = {
	length: PollLength
	userVotes: UserPollVotes[]
	choiceVotedBySignInUser: number
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
	poll: PostPoll | null
}
