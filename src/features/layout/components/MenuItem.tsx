import type { FC, ReactNode } from "react"

export const MenuItem: FC<{ children: ReactNode; onClick?: () => void }> = ({
	children,
	onClick,
}) => (
	<li
		onClick={onClick}
		className="flex rounded-lg border-none p-2 text-lg  hover:bg-gray-300 xl:m-2"
	>
		{children}
	</li>
)
