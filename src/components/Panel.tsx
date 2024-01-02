import type { FC, PropsWithChildren } from "react"

export const Panel: FC<PropsWithChildren> = (props) => {
	return (
		<div className="my-2 w-full rounded-xl border bg-gray-200 md:p-2 lg:p-4">
			{props.children}
		</div>
	)
}
