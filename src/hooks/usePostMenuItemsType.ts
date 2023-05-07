import type { PostMenuItemsType } from "~/components/postsPage/types"
import type { SignInUser } from "~/components/profilePage/types"

export const usePostMenuItemsType = (
	isUserFollowProfile: boolean | null,
	signInUser: SignInUser,
	authorId: string
): PostMenuItemsType => {
	const { isSignedIn, userId } = signInUser

	if (!isSignedIn) {
		return "view"
	} else if (userId === authorId) {
		return "own"
	} else if (isUserFollowProfile) {
		return "followedAuthor"
	}
	return "notFollowedAuthor"
}
