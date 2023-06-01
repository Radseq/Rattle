import type { LiHTMLAttributes } from "react"

type ListItemProps = LiHTMLAttributes<HTMLLIElement>

export const ListItem = (props: ListItemProps) => {
	return (
		<li {...props} className="flex h-12 w-full cursor-pointer rounded-lg p-2  hover:bg-gray-50">
			{props.children}
		</li>
	)
}
