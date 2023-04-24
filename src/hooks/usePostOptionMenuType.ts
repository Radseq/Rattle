import type { PostOptionMenuType } from "~/components/postsPage/types"
import type { SignInUser } from "~/components/profilePage/types"

export const usePostOptionMenuType = (
	isUserFollowProfile: boolean | null,
	signInUser: SignInUser,
	ownPost: boolean
): PostOptionMenuType => {
	const { isSignedIn } = signInUser

	if (isUserFollowProfile && isSignedIn && ownPost) {
		return "own"
	} else if (isUserFollowProfile && isSignedIn) {
		return "followedAuthor"
	} else if (!isUserFollowProfile && isSignedIn) {
		return "notFollowedAuthor"
	}
	return "view"
}
