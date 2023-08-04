import { type PostWithAuthor } from "~/components/postsPage/types"

export type PostReplies = {
	postWithUser: PostWithAuthor
	repliesWithAuthor: PostWithAuthor[]
}