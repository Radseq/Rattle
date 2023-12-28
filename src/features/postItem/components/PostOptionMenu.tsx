import type { FC } from "react"
import { Icon } from "../../../components/Icon"
import { ListItem } from "../../../components/styledHTMLElements/StyledListItem"
import { type PostProfileType } from "../types"

export const PostOptionMenu: FC<{
	onMenuItemClick: (action: "delete") => void
	menuItemsType: PostProfileType
}> = ({ onMenuItemClick, menuItemsType }) => {
	return (
		<ul
			className="absolute right-1 h-full w-64 flex-col rounded-lg 
			bg-white shadow-[0px_0px_3px_1px_#00000024]"
		>
			<li></li>
			{menuItemsType === "own" && (
				<ListItem
					onClick={(e) => {
						e.stopPropagation()
						onMenuItemClick("delete")
					}}
				>
					<Icon iconKind={"trash"} />
					<span className="pl-1 font-bold text-red-500">Delete</span>
				</ListItem>
			)}
		</ul>
	)
}
