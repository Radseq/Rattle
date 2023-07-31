import { FC } from "react"
import { Icon } from "~/components/Icon"
import { ListItem } from "~/components/styledHTMLElements/StyledListItem"

export const OverlayTagItem: FC<{ tag: string }> = ({ tag }) => {
	return (
		<ListItem>
			<span className="w-56 inline-block align-middle leading-10">{`#${tag}`}</span>
			<div className="flex h-10 w-10 justify-center rounded-full hover:bg-gray-200">
				<Icon iconKind="trash" />
			</div>
		</ListItem>
	)
}
