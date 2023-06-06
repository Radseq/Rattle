import { type User } from "@clerk/nextjs/dist/api"
import type { ProfilePageType } from "~/components/profilePage/types"

export const useProfileType = (
	profileId: string,
	user: User | undefined,
	isUserFollowProfile: boolean | null
): ProfilePageType => {
	if (!user) {
		return "view"
	} else if (user.id === profileId) {
		return "own"
	} else if (isUserFollowProfile) {
		return "follow"
	}
	return "unfollow"
}
