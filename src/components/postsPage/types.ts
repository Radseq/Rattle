import type { Post as PrismaPost } from "@prisma/client"
import { PostAuthor } from "../profilePage/types"

export type PostWithAuthor = {
	author: PostAuthor
	post: Post
}

export type PostReplays = {
	postWithUser: PostWithAuthor
	replaysWithAuthor: PostWithAuthor[]
}

export type PostMenuItemsType = "view" | "followedAuthor" | "notFollowedAuthor" | "own"

export type Post = PrismaPost & {
	createdAt: string
	likeCount: number
	replaysCount: number
	forwardsCount: number
	isLikedBySignInUser: boolean
	isForwardedPostBySignInUser: boolean
}
