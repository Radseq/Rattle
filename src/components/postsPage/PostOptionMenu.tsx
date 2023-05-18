import type { FC } from "react"
import { Icon } from "../Icon"
import { type PostMenuItemsType } from "./types"
import { ListItem } from "../styledHTMLElements/StyledListItem"

export const PostOptionMenu: FC<{
	postId: string
	onMenuItemClick: (action: string, postId: string) => void
	menuItemsType: PostMenuItemsType
}> = ({ onMenuItemClick, postId, menuItemsType }) => {
	return (
		<ul
			className="absolute right-1 h-full w-64 flex-col rounded-lg 
			bg-white shadow-[0px_0px_3px_1px_#00000024]"
		>
			<li></li>
			{menuItemsType === "own" && (
				<ListItem
					onClick={(e) => {
						e.stopPropagation();
						onMenuItemClick("delete", postId)
					}}
				>
					<Icon iconKind={"trash"} />
					<span className="mt-0.5 pl-1 font-bold text-red-500">Delete</span>
				</ListItem>
			)}
		</ul>
	)
}
