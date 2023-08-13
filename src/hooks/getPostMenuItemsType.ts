import { type User } from "@clerk/nextjs/dist/api"
import { type PostMenuItemsType } from "~/components/post/types"

export const getPostMenuItemsType = (
	isUserFollowProfile: boolean | null,
	user: User | undefined,
	authorId: string
): PostMenuItemsType => {
	if (user?.id === authorId) {
		return "own"
	} else if (user) {
		return "view"
	} else if (isUserFollowProfile) {
		return "followedAuthor"
	}
	return "notFollowedAuthor"
}
