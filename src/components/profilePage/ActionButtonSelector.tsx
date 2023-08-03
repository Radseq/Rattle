import { type FC } from "react"
import type { ProfilePageType } from "./types"
import { DangerButton, PrimaryButton } from "../styledHTMLElements/StyledButtons"

export const ActionButtonSelector: FC<{
	profileType: ProfilePageType
	onClick: (actionType: "signUp" | "follow" | "unfollow" | null) => void
}> = ({ profileType, onClick }) => {
	if (profileType === "own") {
		return <PrimaryButton onClick={() => onClick("signUp")}>Set up profile</PrimaryButton>
	} else if (profileType === "follow") {
		return <DangerButton onClick={() => onClick("unfollow")}>Unfollow</DangerButton>
	} else if (profileType === "unfollow") {
		return <PrimaryButton onClick={() => onClick("follow")}>Follow</PrimaryButton>
	}
	return null // not sign in user, no action button needed
}
