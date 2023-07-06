import { type FC } from "react"
import Image from "next/image"
import { type PostWithAuthor } from "./types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostTitle } from "./PostTitle"
dayjs.extend(relativeTime)

export const PostQuoteItem: FC<{ postWithAuthor: PostWithAuthor }> = ({ postWithAuthor }) => {
	return (
		<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
			<div className="flex">
				<Image
					className="h-8 w-8 rounded-full"
					src={postWithAuthor.author.profileImageUrl}
					alt={"avatar"}
					width={32}
					height={32}
				></Image>
				<PostTitle
					author={postWithAuthor.author}
					createdAt={postWithAuthor.post.createdAt}
				/>
			</div>
			<span className="block">{postWithAuthor.post.content}</span>
		</div>
	)
}
