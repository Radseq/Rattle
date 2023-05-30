import type { RouterOutputs } from "~/utils/api"
import type { Post as PrismaPost } from "@prisma/client"

export type PostWithUser = RouterOutputs["posts"]["getAllByAuthorId"][number]

export type PostReplays = {
	postWithUser: PostWithUser
	replaysWithAuthor: PostWithUser[]
}

export type PostMenuItemsType = "view" | "followedAuthor" | "notFollowedAuthor" | "own"

export type Post = PrismaPost & {
	likeCount: number
	replaysCount: number
	forwardsCount: number
}
