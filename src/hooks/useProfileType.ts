import type { Profile, ProfilePageType, SignInUser } from "~/components/profilePage/types"

export const useProfileType = (profile: Profile, signInUser: SignInUser): ProfilePageType => {
	const { isSignedIn, userId } = signInUser

	if (!isSignedIn) {
		return "view"
	} else if (userId === profile.id) {
		return "current user"
	}
	return "different user"
}
