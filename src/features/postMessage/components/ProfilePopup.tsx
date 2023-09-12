import { useAuth } from "@clerk/nextjs"
import { type FC, type PropsWithChildren } from "react"
import {
	type Profile,
	ProfileAvatarImageUrl,
	ProfileWatchedWatching,
	useGetProfile,
	type WatchedWatching,
} from "~/features/profile"
import { getPostProfileType } from "~/utils/helpers"
import { ActionButtonSelector } from "./ActionButtonSelector"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"

export const ProfilePopupUI: FC<
	{
		profile: Profile
		watchedWatchingCount: WatchedWatching
	} & PropsWithChildren
> = ({ profile, watchedWatchingCount, children }) => {
	return (
		<article
			className="absolute left-0 top-4 z-20  flex  rounded-lg border-2 
			border-gray-400 bg-gray-200 p-4 text-black"
		>
			<div className=" w-72">
				<header className="flex justify-between ">
					<div>
						<ProfileAvatarImageUrl src={profile.profileImageUrl} />
						<div className=" mt-1 flex w-10/12 flex-col">
							<div className="h-5 font-bold">{profile.fullName}</div>
							<div className="text-gray-500">{`@${profile.username}`}</div>
						</div>
					</div>
					{children}
				</header>
				<div className="mt-2">
					<span>{profile.extended && profile.extended.bio}</span>
				</div>
				<footer className="mt-2">
					<ProfileWatchedWatching watchedWatchingCount={watchedWatchingCount} />
				</footer>
			</div>
		</article>
	)
}

export const ProfilePopup: FC<{ profileName: string }> = ({ profileName }) => {
	const normalizedProfileName = profileName.replace("@", "")
	const user = useAuth()

	const { profile, isUserFollowProfile, watchedWatchingCount, setWatchedWatching } =
		useGetProfile(normalizedProfileName)

	const profileType = getPostProfileType(isUserFollowProfile, profile?.id, user.userId)

	const { mutate: addUserToFollow, isLoading: isFollowed } =
		api.follow.addUserToFollow.useMutation({
			onMutate: () => {
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount += 1),
				})
			},
			onSuccess: () => {
				toast.success(`${profile?.username ?? ""} is now followed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount -= 1),
				})
			},
		})

	const { mutate: stopFollowing, isLoading: isUnFollowing } =
		api.follow.stopFollowing.useMutation({
			onMutate: () => {
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount -= 1),
				})
			},
			onSuccess: () => {
				toast.success(`${profile?.username ?? ""} is no longer followed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to stop follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount += 1),
				})
			},
		})

	if (!profile) {
		return <></>
	}

	return (
		<ProfilePopupUI profile={profile} watchedWatchingCount={watchedWatchingCount}>
			<ActionButtonSelector
				isLoading={true}
				profileType={profileType}
				onClick={(actionType) => {
					if (actionType === "unfollow") {
						stopFollowing(profile.id)
					} else {
						addUserToFollow(profile.id)
					}
				}}
			/>
		</ProfilePopupUI>
	)
}
