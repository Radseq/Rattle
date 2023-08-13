import type { Post as PrismaPost } from "@prisma/client"
import { type PostAuthor } from "../profilePage/types"
import { type RouterOutputs } from "~/utils/api"

export type PostWithAuthor = {
	author: PostAuthor
	post: Post
	signInUser: SignInUser | null
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
	replyCount: number
	forwardsCount: number
	quotedPost: PostWithAuthor | null
	quotedCount: number
	poll: Poll | null
}

export type PollVote = RouterOutputs["profile"]["votePostPoll"]

export type SignInUser = {
	isLiked: boolean
	isForwarded: boolean
	isQuoted: boolean
	isVotedChoiceId: number | undefined
	authorFollowed: boolean
}
