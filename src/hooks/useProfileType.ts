import type { ProfilePageType, SignInUser } from "~/components/profilePage/types"

export const useProfileType = (
	profileId: string,
	signInUser: SignInUser,
	isUserFollowProfile: boolean | null
): ProfilePageType => {
	const { isSignedIn, userId } = signInUser

	if (!isSignedIn) {
		return "view"
	} else if (isSignedIn && userId === profileId) {
		return "own"
	} else if (isSignedIn && isUserFollowProfile) {
		return "follow"
	}
	return "unfollow"
}
