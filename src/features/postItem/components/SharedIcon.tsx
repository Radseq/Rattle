import type { PropsWithChildren } from "react"
import { Icon } from "~/components/Icon"

type Props = PropsWithChildren & {
	sharedCount: number
}

export const SharedIcon = (props: Props) => {
	return (
		<div className="group relative mr-4 flex">
			<div className={"flex rounded-full p-1 group-hover:bg-green-300"}>
				<Icon iconKind="postForward" />
			</div>
			<div className="hidden group-hover:block">{props.children}</div>
			<span className={"self-center pl-1 text-xl group-hover:text-green-400"}>
				{props.sharedCount}
			</span>
		</div>
	)
}
