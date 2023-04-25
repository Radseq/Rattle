import type { PostOptionMenuType } from "~/components/postsPage/types"
import type { SignInUser } from "~/components/profilePage/types"

export const usePostOptionMenuType = (
	isUserFollowProfile: boolean | null,
	signInUser: SignInUser,
	authorId: string
): PostOptionMenuType => {
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
