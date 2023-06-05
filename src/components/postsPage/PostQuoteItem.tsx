import { FC } from "react"
import Image from "next/image"
import { PostWithAuthor } from "./types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export const PostQuoteItem: FC<{ postWithAuthor: PostWithAuthor }> = ({ postWithAuthor }) => {
	return (
		<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
			<div className="flex">
				<Image
					className="h-16 w-16 rounded-full"
					src={postWithAuthor.author.profileImageUrl}
					alt={"avatar"}
					width={128}
					height={128}
				></Image>
				<div className="w-10/12 pl-2">
					<div className="font-semibold">
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
