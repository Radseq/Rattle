import { Profile, SignInUser } from "~/components/profilePage/types"

type ProfilePageType =
	| { type: "loading" }
	| { type: "view"; profileData: Profile }
	| { type: "current user"; profileData: Profile }
	| { type: "different user"; profileData: Profile }

export const useProfileType = (profile: Profile, signInUser: SignInUser): ProfilePageType => {
	const { isLoaded, isSignedIn, userId } = signInUser

	if (!isSignedIn) {
		return {
			profileData: profile,
			type: "view",
		}
	} else if (!userId || !isLoaded) {
		return {
			type: "loading",
		}
	} else if (userId === profile.id) {
		return {
			profileData: profile,
			type: "current user",
		}
	} else {
		return {
			profileData: profile,
			type: "different user",
		}
	}
}
