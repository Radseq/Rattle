import { type FC } from "react"
import Link from "next/link"
import { type PostAuthor } from "../profilePage/types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const PostTitle: FC<{ author: PostAuthor; createdAt: string }> = ({ author, createdAt }) => {
	return (
		<div className="text-lg font-semibold">
			<span className="pr-1">{author.fullName}</span>
			<span>
				<Link
					onClick={(e) => e.stopPropagation()}
					href={`/${author.username}`}
				>{`@${author.username}`}</Link>
			</span>
			<span className="p-1 text-slate-400">·</span>
			<span className="font-normal text-slate-400">{dayjs(createdAt).fromNow()}</span>
		</div>
	)
}
