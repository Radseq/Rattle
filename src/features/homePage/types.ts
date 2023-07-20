import { Poll, PostWithAuthor } from "~/components/postsPage/types"
import type { Post as PrismaPost } from "@prisma/client"
import { PostAuthor } from "~/components/profilePage/types"

export type Post = PrismaPost & {
	createdAt: string
	likeCount: number
	replyCount: number
	forwardsCount: number
	quotedPost: PostWithAuthor | null
	quotedCount: number
	poll: Poll | null
}

export type SignInUser = {
	postId: string
	isLiked: boolean
	isForwarded: boolean
	isQuoted: boolean
}

export type HomePost = {
	author: PostAuthor
	post: Post
	signInUser: SignInUser | undefined
}
