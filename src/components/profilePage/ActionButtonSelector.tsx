import { type FC } from "react"
import { useProfileType } from "~/hooks/useProfileType"
import type { Profile, SignInUser } from "./types"
import { DangerButton, PrimalyButton } from "../StyledButtons"

export const ActionButtonSelector: FC<{
	profile: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
	onClick: CallableFunction
}> = ({ profile, signInUser, isUserFollowProfile, onClick }) => {
	const profileType = useProfileType(profile, signInUser)

	if (profileType === "current user") {
		return (
			<div>
				<PrimalyButton
					onClick={(e) => {
						e.preventDefault()
						onClick("", "modal")
					}}
				>
					Set up profile
				</PrimalyButton>
			</div>
		)
	} else if (isUserFollowProfile && profileType === "different user") {
		return (
			<DangerButton
				onClick={(e) => {
					e.preventDefault()
					onClick(profile.id, "unfollow")
				}}
			>
				Unfollow
			</DangerButton>
		)
	} else if (signInUser.isSignedIn && !isUserFollowProfile) {
		return (
			<PrimalyButton
				onClick={(e) => {
					e.preventDefault()
					onClick(profile.id, "follow")
				}}
			>
				Follow
			</PrimalyButton>
		)
	}
	return null
}
