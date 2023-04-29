import type { RouterOutputs } from "~/utils/api"

export type PostWithUser = RouterOutputs["posts"]["getAllByAuthorId"][number]

export type PostReplays = {
	postWithUser: PostWithUser
	replaysWithAuthor: PostWithUser[]
}
