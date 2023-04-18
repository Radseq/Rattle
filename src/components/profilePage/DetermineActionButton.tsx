import { type FC, useState } from "react"
import { SetUpProfileModal } from "./setUpProfileModal"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"
import { LoadingSpinner } from "../LoadingPage"
import { type ProfileData } from "./types"
import { useUser } from "@clerk/nextjs"

const ZOD_ERROR_DURATION_MS = 10000

const FollowButton: FC<{ profileId: string; username: string }> = ({ profileId, username }) => {
	const { mutate, isLoading: isFolloweed } = api.follow.addUserToFollow.useMutation({
		onSuccess: () => {
			toast.success(`${username} is now followeed`)
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: ZOD_ERROR_DURATION_MS })
		},
	})

	return (
		<button
			className="m-2 rounded-full bg-blue-500 py-2 px-4 font-bold text-white hover:bg-blue-700"
			onClick={(e) => {
				e.preventDefault()
				mutate(profileId)
			}}
		>
			{isFolloweed && <LoadingSpinner />}
			Follow
		</button>
	)
}

const UnFollowButton: FC<{ profileId: string; username: string }> = ({ profileId, username }) => {
	const { mutate, isLoading: isUnFollowing } = api.follow.stopFollowing.useMutation({
		onSuccess: () => {
			toast.success(`${username} is now Unfolloweed`)
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: ZOD_ERROR_DURATION_MS })
		},
	})

	return (
		<button
			className="m-2 rounded-full bg-red-500 py-2 px-4 font-bold text-white hover:bg-red-700"
			onClick={(e) => {
				e.preventDefault()
				mutate(profileId)
			}}
		>
			{isUnFollowing && <LoadingSpinner />}
			Unfollow
		</button>
	)
}

const SetUpButton: FC<{ profileData: ProfileData }> = ({ profileData }) => {
	const [showModal, setShowModal] = useState<boolean>()
	return (
		<div>
			<button
				className="block rounded-lg bg-blue-500 px-5 py-2.5 text-center font-bold 
					text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 
					dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				type="button"
				onClick={(e) => {
					setShowModal(true)
					e.preventDefault()
				}}
			>
				Set up profile
			</button>
			{showModal ? (
				<div>
					<SetUpProfileModal
						bannerImageUrl={profileData.bannerImgUrl ?? ""}
						bio={profileData.bio ?? ""}
						webPage={profileData.webPage ?? ""}
						profileImageUrl={profileData.profileImageUrl}
						showModal={(e: boolean) => setShowModal(e)}
					/>
					<div className="fixed inset-0 z-40 bg-black opacity-25"></div>
				</div>
			) : null}
		</div>
	)
}

export const DetermineActionButton: FC<{ profileData: ProfileData }> = ({ profileData }) => {
	const { data: isAlreadyFollowing } = api.follow.isFolloweed.useQuery(profileData.id)
	const { user, isSignedIn } = useUser()

	if (user && isSignedIn && user.id === profileData.id) {
		return <SetUpButton profileData={profileData} />
	} else if (isAlreadyFollowing && isSignedIn) {
		return <UnFollowButton profileId={profileData.id} username={profileData.username} />
	} else if (isSignedIn) {
		return <FollowButton profileId={profileData.id} username={profileData.username} />
	}
	return null
}
