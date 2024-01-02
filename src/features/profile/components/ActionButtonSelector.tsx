import { type FC } from "react"
import { DangerButton, PrimaryButton } from "../../../components/styledHTMLElements/StyledButtons"
import { type PostProfileType } from "~/features/postItem"

export const ActionButtonSelector: FC<{
	profileType: PostProfileType
	onClick: (actionType: "signUp" | "follow" | "unfollow" | null) => void
}> = ({ profileType, onClick }) => {
	if (profileType === "own") {
		return <PrimaryButton onClick={() => onClick("signUp")}>Set up profile</PrimaryButton>
	} else if (profileType === "followedAuthor") {
		return <DangerButton onClick={() => onClick("unfollow")}>Unfollow</DangerButton>
	} else if (profileType === "notFollowedAuthor") {
		return <PrimaryButton onClick={() => onClick("follow")}>Follow</PrimaryButton>
	}
	return null // not sign in user, no action button needed
}
