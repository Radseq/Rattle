import { type FC } from "react"
import { Icon } from "../Icon"
import { Heart } from "../Icons/Heart"
import Link from "next/link"
import { type PostWithUser } from "./types"

export const PostFooter: FC<{
	isLikedByUser: boolean
	postWithUser: PostWithUser
}> = ({ isLikedByUser, postWithUser }) => {
	return (
		<footer className="mt-3 flex text-gray-500">
			<Link
				className="group mr-2 flex"
				href={`/post/${postWithUser.author.username}/status/${postWithUser.post.id}`}
			>
				<div className={"flex rounded-full p-1 group-hover:bg-blue-400"}>
					<Icon iconKind="chat" />
				</div>
				<span className={"self-center pl-1 text-xl group-hover:text-blue-400"}>
					{postWithUser.post.replaysCount}
				</span>
			</Link>

			<div
				className="group flex"
				onClick={(e) => {
					e.stopPropagation()
				}}
			>
				<Heart
					className={"h-9 w-9 rounded-full p-1 group-hover:bg-red-500"}
					fillColor={isLikedByUser ? "red" : ""}
				/>
				<span className={"self-center pl-1 text-xl group-hover:text-red-500"}>
					{postWithUser.post.likeCount}
				</span>
			</div>
		</footer>
	)
}
