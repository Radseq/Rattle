import { api } from "~/utils/api"

export const useGetProfile = (username: string) => {
	const profile = api.profile.getProfileByUsername.useQuery(username)

	const isUserFollowProfile = api.follow.isFollowed.useQuery(profile.data?.id ?? "")

	const watchedWatchingCount = api.follow.getProfileWatchedWatching.useQuery(
		profile.data?.id ?? ""
	)

	return {
		profile: profile.data,
		isUserFollowProfile: isUserFollowProfile.data,
		watchedWatchingCount: watchedWatchingCount.data,
	}
}
