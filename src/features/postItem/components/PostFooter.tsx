import { type FC } from "react"
import { Icon } from "../../../components/Icon"
import { ListItem } from "../../../components/styledHTMLElements/StyledListItem"
import { HeartIcon } from "./HeartIcon"
import { ReplyCountIcon } from "./ReplyCountIcon"
import { SharedIcon } from "./SharedIcon"

export const PostFooter: FC<{
	isForwarded: boolean
	sharedCount: number
	isLiked: boolean
	likeCount: number
	username: string
	replyCount: number
	postId: string
	onForwardClick: () => void
	onLikeClick: () => void
	onQuoteClick: () => void
}> = ({
	isForwarded,
	sharedCount,
	isLiked,
	likeCount,
	username,
	replyCount,
	postId,
	onForwardClick,
	onLikeClick,
	onQuoteClick,
}) => {
	return (
		<footer className="mt-3 flex text-gray-500">
			<ReplyCountIcon count={replyCount} url={`/post/${username}/status/${postId}`} />
			<SharedIcon sharedCount={sharedCount}>
				<ul
					className="absolute top-8 left-0 z-10 w-44 flex-col rounded-lg 
								bg-white shadow-[0px_0px_3px_1px_#00000024] group-hover:flex"
				>
					<ListItem
						onClick={(e) => {
							e.stopPropagation()
							onForwardClick()
						}}
					>
						<Icon iconKind="postForward" />
						<span className="pl-1 font-bold text-black">
							{isForwarded ? "Delete Forward" : "Forward"}
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
			</SharedIcon>
			<HeartIcon
				filledRed={isLiked}
				likeCount={likeCount}
				onClick={(e) => {
					e.stopPropagation()
					onLikeClick()
				}}
			/>
		</footer>
	)
}
