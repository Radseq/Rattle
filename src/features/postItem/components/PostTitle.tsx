import { type FC } from "react"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const PostTitle: FC<{ fullName: string; username: string; createdAt: string }> = ({
	fullName,
	username,
	createdAt,
}) => {
	return (
		<div className="text-lg font-semibold">
			<span className="pr-1">{fullName}</span>
			<span>
				<Link
					onClick={(e) => e.stopPropagation()}
					href={`/${username}`}
				>{`@${username}`}</Link>
			</span>
			<span className="p-1 text-slate-400">·</span>
			<span className="font-normal text-slate-400">{dayjs(createdAt).fromNow()}</span>
		</div>
	)
}
