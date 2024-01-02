import Link from "next/link"
import { type FC } from "react"
import { Icon } from "~/components/Icon";

export const ReplyCountIcon: FC<{ count: number; url: string }> = ({ count, url }) => {
	return (
		<Link className="group mr-4 flex" href={url}>
			<div className={"flex rounded-full p-1 group-hover:bg-blue-400"}>
				<Icon iconKind="chat" />
			</div>
			<span className={"self-center pl-1 text-xl group-hover:text-blue-400"}>{count}</span>
		</Link>
	)
}
