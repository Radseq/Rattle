import type { Post as PrismaPost } from "@prisma/client"
import { type PostAuthor } from "~/components/profilePage/types"
import { type Post as OtherPost } from "~/components/postsPage/types"

export type Post = Omit<OtherPost, "isLikedBySignInUser" | "isForwardedPostBySignInUser"> &
	PrismaPost

export type SignInUser = {
	isLiked: boolean
	isForwarded: boolean
	isQuoted: boolean
	isVotedChoiceId: number | undefined
}

export type HomePost = {
	author: PostAuthor
	post: Post
	signInUser: SignInUser | undefined
}
