import { useAuth } from "@clerk/nextjs"
import { type FC, useState } from "react"
import { ProfileAvatarImageUrl, ProfileWatchedWatching, useGetProfile } from "~/features/profile"
import { getPostProfileType } from "~/utils/helpers"
import { ActionButtonSelector } from "./ActionButtonSelector"

const ProfileWindow: FC<{ profileName: string }> = ({ profileName }) => {
	const { profile, isUserFollowProfile, watchedWatchingCount } = useGetProfile(
		profileName.replace("@", "")
	)
	const user = useAuth()
	const profileType = getPostProfileType(isUserFollowProfile, profile?.id, user.userId)

	if (!profile) {
		return <></>
	}

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
					<div>
						<ActionButtonSelector
							profileType={profileType}
							onClick={(actionType) => {
								if (actionType === "unfollow") {
								} else if (actionType === "follow") {
								}
							}}
						/>
					</div>
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
	const [showProfile, setShowProfile] = useState<string | null>(null)

	return (
		<span
			onMouseLeave={() => setShowProfile(null)}
			onMouseEnter={() => setShowProfile(profileName)}
			className=" relative  text-blue-400 "
		>
			{profileName}
			{showProfile && <ProfileWindow profileName={showProfile} />}
		</span>
	)
}
