import { type FC } from "react"
import { type PostProfileType } from "~/components/post/types"
import { DangerButton, PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"

export const ActionButtonSelector: FC<{
	profileType: PostProfileType
	onClick: (actionType: "follow" | "unfollow") => void
}> = ({ profileType, onClick }) => {
	if (profileType === "followedAuthor") {
		return <DangerButton onClick={() => onClick("unfollow")}>Unfollow</DangerButton>
	} else if (profileType === "notFollowedAuthor") {
		return <PrimaryButton onClick={() => onClick("follow")}>Follow</PrimaryButton>
	}
	return null
}
