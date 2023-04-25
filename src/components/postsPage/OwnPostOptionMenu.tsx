import { type FC } from "react"
import { Icon } from "../Icon"

export const OwnPostOptionMenu: FC<{
	closeMenu: () => void
	onPostDeleteClick: () => void
}> = ({ closeMenu, onPostDeleteClick }) => {
	return (
		<ul
			className="absolute right-1 h-full w-64 flex-col rounded-lg 
				bg-white shadow-[0px_0px_3px_1px_#00000024]"
			onMouseLeave={closeMenu}
		>
			<li
				className="flex h-12 w-full rounded-lg p-2  hover:bg-gray-50"
				onClick={onPostDeleteClick}
			>
				<Icon iconKind="trash" />
				<button className="pl-1 font-bold text-red-500">Delete</button>
			</li>
		</ul>
	)
}
