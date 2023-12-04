import { type FC } from "react"
import { Icon } from "~/components/Icon"
import { PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"

export const CreatePostFooter: FC<{
	handleAddPollIClick: () => void
	handleCreateClick: () => void
}> = ({ handleAddPollIClick, handleCreateClick }) => {
	return (
		<footer className="ml-16 flex">
			<div className="flex p-2" onClick={handleAddPollIClick}>
				<Icon iconKind="poll" />
			</div>
			<div className="w-full"></div>
			<div className="mr-2">
				<PrimaryButton onClick={handleCreateClick}>Post</PrimaryButton>
			</div>
		</footer>
	)
}
