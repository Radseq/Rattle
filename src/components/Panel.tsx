import type { FC, PropsWithChildren } from "react"

export const Panel: FC<PropsWithChildren> = (props) => {
	return <div className="my-2 rounded-xl border bg-gray-200 p-4">{props.children}</div>
}
