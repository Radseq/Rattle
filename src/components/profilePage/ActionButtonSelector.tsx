import { type FC } from "react"
import type { ProfilePageType } from "./types"
import { DangerButton, PrimalyButton } from "../StyledButtons"

export const ActionButtonSelector: FC<{
	profileType: ProfilePageType
	onClick: (actionType: "signUp" | "follow" | "unfollow" | null) => void
}> = ({ profileType, onClick }) => {
	if (profileType === "own") {
		return <PrimalyButton onClick={() => onClick("signUp")}>Set up profile</PrimalyButton>
	} else if (profileType === "follow") {
		return <DangerButton onClick={() => onClick("unfollow")}>Unfollow</DangerButton>
	} else if (profileType === "unfollow") {
		return <PrimalyButton onClick={() => onClick("follow")}>Follow</PrimalyButton>
	}
	return null // not sign in user, no action button needed
}
