import { type FC } from "react"
import { Icon } from "../Icon"
import { Heart } from "../Icons/Heart"
import Link from "next/link"
import { type PostWithAuthor } from "./types"
import { ListItem } from "../styledHTMLElements/StyledListItem"

export const PostFooter: FC<{
	isLikedByUser: boolean
	isForwardedByUser: boolean
	postWithUser: PostWithAuthor
	forwardAction: (action: "forward" | "deleteForward", postId: string) => void
	likeAction: (action: "like" | "unlike", postId: string) => void
	onQuoteClick: () => void
}> = ({
	isLikedByUser,
	isForwardedByUser,
	postWithUser,
	forwardAction,
	likeAction,
	onQuoteClick,
}) => {
	return (
		<footer className="mt-3 flex text-gray-500">
			<Link
				className="group mr-4 flex"
				href={`/post/${postWithUser.author.username}/status/${postWithUser.post.id}`}
			>
				<div className={"flex rounded-full p-1 group-hover:bg-blue-400"}>
					<Icon iconKind="chat" />
				</div>
				<span className={"self-center pl-1 text-xl group-hover:text-blue-400"}>
					{postWithUser.post.replaysCount}
				</span>
			</Link>
			<div className="group relative mr-4 flex">
				<div className={"flex rounded-full p-1 group-hover:bg-green-300"}>
					<Icon iconKind="postForward" />
				</div>
				<div className="hidden group-hover:block">
					<ul
						className="absolute top-8 left-0 z-10 w-44 flex-col rounded-lg 
							bg-white shadow-[0px_0px_3px_1px_#00000024] group-hover:flex"
					>
						<ListItem
							onClick={(e) => {
								e.stopPropagation()
								if (isForwardedByUser) {
									forwardAction("deleteForward", postWithUser.post.id)
								} else {
									forwardAction("forward", postWithUser.post.id)
								}
							}}
						>
							<Icon iconKind="postForward" />
							<span className="pl-1 font-bold text-black">
								{isForwardedByUser ? "Delete Forward" : "Forward"}
							</span>
						</ListItem>
						<ListItem
							onClick={(e) => {
								e.stopPropagation()
								onQuoteClick()
							}}
						>
							<Icon iconKind="quote" />
							<span className="pl-1 font-bold text-black">Quote</span>
						</ListItem>
					</ul>
				</div>
				<span className={"self-center pl-1 text-xl group-hover:text-green-400"}>
					{postWithUser.post.forwardsCount}
				</span>
			</div>
			<div
				className="group flex"
				onClick={(e) => {
					e.stopPropagation()
					if (isLikedByUser) {
						likeAction("unlike", postWithUser.post.id)
					} else {
						likeAction("like", postWithUser.post.id)
					}
				}}
			>
				<Heart
					className={`h-9 w-9 rounded-full p-1 ${
						isLikedByUser ? "group-hover:bg-gray-500" : "group-hover:bg-red-500"
					}`}
					fillColor={isLikedByUser ? "red" : ""}
				/>
				<span className={"self-center pl-1 text-xl group-hover:text-red-500"}>
					{postWithUser.post.likeCount}
				</span>
			</div>
		</footer>
	)
}
