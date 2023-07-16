import { type FC } from "react"
import { Icon } from "../Icon"
import { type PostWithAuthor } from "./types"
import { ListItem } from "../styledHTMLElements/StyledListItem"
import { HeartIcon } from "../post/HeartIcon"
import { ReplyCountIcon } from "../post/ReplyCountIcon"
import { SharedIcon } from "../post/SharedIcon"

export const PostFooter: FC<{
	isForwardedByUser: boolean
	postWithUser: PostWithAuthor
	onForwardClick: () => void
	onLikeClick: () => void
	onQuoteClick: () => void
}> = ({ isForwardedByUser, postWithUser, onForwardClick, onLikeClick, onQuoteClick }) => {
	const { post, author } = postWithUser

	return (
		<footer className="mt-3 flex text-gray-500">
			<ReplyCountIcon
				count={post.replyCount}
				url={`/post/${author.username}/status/${post.id}`}
			/>
			<SharedIcon sharedCount={post.forwardsCount + post.quotedCount}>
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
			</SharedIcon>
			<HeartIcon
				filledRed={post.isLikedBySignInUser}
				likeCount={post.likeCount}
				onClick={(e) => {
					e.stopPropagation()
					onLikeClick()
				}}
			/>
		</footer>
	)
}
