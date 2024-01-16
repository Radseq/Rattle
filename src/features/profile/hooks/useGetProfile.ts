import { api } from "~/utils/api"
import { type WatchedWatching } from "../types"
import { useState } from "react"

export const useGetProfile = (username: string) => {
	const [watchedWatching, setWatchedWatching] = useState<WatchedWatching>({
		watchedCount: 0,
		watchingCount: 0,
	})

	const profile = api.profile.getProfileByUsername.useQuery(username)

	const isUserFollowProfile = api.follow.isFollowed.useQuery(profile.data?.id ?? "", {
		enabled: !!profile.data,
	})

	const watchedWatchingCount = api.follow.getProfileWatchedWatching.useQuery(
		profile.data?.id ?? "",
		{
			onSuccess: () => {
				if (watchedWatchingCount.data) {
					setWatchedWatching(watchedWatchingCount.data)
				}
			},
			enabled: !!profile.data,
		},
	)

	return {
		profile: profile.data,
		isUserFollowProfile: isUserFollowProfile.data,
		watchedWatchingCount: watchedWatching,
		setWatchedWatching,
	}
}
