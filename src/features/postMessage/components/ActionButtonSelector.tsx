import { type FC } from "react"
import { LoadingSpinner } from "~/components/LoadingPage"
import { type PostProfileType } from "~/components/post/types"
import { DangerButton, PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"

export const ActionButtonSelector: FC<{
	profileType: PostProfileType
	onClick: (actionType: "follow" | "unfollow") => void
	isLoading: boolean
}> = ({ profileType, onClick, isLoading }) => {
	if (isLoading) {
		return <LoadingSpinner size={30} />
	} else if (profileType === "followedAuthor") {
		return <DangerButton onClick={() => onClick("unfollow")}>Unfollow</DangerButton>
	} else if (profileType === "notFollowedAuthor") {
		return <PrimaryButton onClick={() => onClick("follow")}>Follow</PrimaryButton>
	}
	return null
}
