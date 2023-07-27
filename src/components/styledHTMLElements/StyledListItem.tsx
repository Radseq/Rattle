import type { LiHTMLAttributes } from "react"

type ListItemProps = LiHTMLAttributes<HTMLLIElement>

export const ListItem = (props: ListItemProps) => {
	return (
		<li {...props} className="flex cursor-pointer rounded-lg p-3  hover:bg-gray-50">
			{props.children}
		</li>
	)
}
