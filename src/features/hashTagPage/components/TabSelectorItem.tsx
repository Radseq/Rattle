import type { FC, PropsWithChildren } from "react"

export const TabSelectorItem: FC<{ name: string; onClick: () => void } & PropsWithChildren> = ({
	name,
	onClick,
	children,
}) => {
	return (
		<div className="px-2 pt-2" onClick={() => onClick()}>
			<span className="flex justify-center px-4 text-gray-900">{name}</span>
			{children}
		</div>
	)
}
