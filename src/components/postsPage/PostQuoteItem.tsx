import { type FC } from "react"
import Image from "next/image"
import { type PostWithAuthor } from "./types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export const PostQuoteItem: FC<{ postWithAuthor: PostWithAuthor }> = ({ postWithAuthor }) => {
	return (
		<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
			<div className="flex">
				<div className="">
					<div className="flex text-lg font-semibold">
						<Image
							className="h-8 w-8 rounded-full"
							src={postWithAuthor.author.profileImageUrl}
							alt={"avatar"}
							width={32}
							height={32}
						></Image>
						<span className="pr-1">{postWithAuthor.author.fullName}</span>
						<span>{`@${postWithAuthor.author.username}`}</span>
						<span className="p-1 text-slate-400">·</span>
						<span className="font-normal text-slate-400">
							{dayjs(postWithAuthor.post.createdAt).fromNow()}
						</span>
					</div>
					<span>{postWithAuthor.post.content}</span>
				</div>
			</div>
		</div>
	)
}
