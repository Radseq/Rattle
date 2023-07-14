import { type FC } from "react"
import type { PostMenuItemsType, PostWithAuthor } from "./types"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostOptionMenu } from "./PostOptionMenu"
import { Icon } from "../Icon"
import { PostFooter } from "./PostFooter"
import { PostQuoteItem } from "./PostQuoteItem"
import { PostPoll } from "./PostPoll"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { PostTitle } from "./PostTitle"
import { ProfileAvatarImageUrl } from "../profile/ProfileAvatarImageUrl"

dayjs.extend(relativeTime)

export type ClickCapture = {
	action:
		| "deletePost"
		| "quote"
		| "forward"
		| "deleteForward"
		| "like"
		| "unlike"
		| "navigation"
		| "vote"
	choiceId?: number
}

export const PostItem: FC<{
	postWithUser: PostWithAuthor
	menuItemsType: PostMenuItemsType
	onClickCapture: (clickCapture: ClickCapture) => void
}> = ({ postWithUser, menuItemsType, onClickCapture }) => {
	const useTime = useTimeLeft(postWithUser.post.createdAt, postWithUser.post.poll?.endDate)
	const { post, author } = postWithUser
	return (
		<li
			className="cursor-pointer rounded-lg py-2 hover:bg-gray-100"
			onClick={() => {
				onClickCapture({
					action: "navigation",
				})
			}}
		>
			<main className="flex">
				<ProfileAvatarImageUrl url={author.profileImageUrl} />
				<div className="w-full pl-2">
					<PostTitle author={author} createdAt={post.createdAt} />
					<span>{post.content}</span>
					{post.poll && (
						<PostPoll
							pollTimeLeft={useTime}
							poll={post.poll}
							pollEndTime={post.poll.endDate}
							onClickVote={(id) =>
								onClickCapture({
									action: "vote",
									choiceId: id,
								})
							}
						/>
					)}
					{post.quotedPost && (
						<Link
							onClick={(e) => e.stopPropagation()}
							href={`/post/${post.quotedPost.author.username}/status/${post.quotedPost.post.id}`}
						>
							<PostQuoteItem postWithAuthor={post.quotedPost} />
						</Link>
					)}
					<PostFooter
						isLikedByUser={post.isLikedBySignInUser}
						postWithUser={postWithUser}
						isForwardedByUser={post.isForwardedPostBySignInUser}
						forwardAction={(action) =>
							onClickCapture({
								action,
							})
						}
						likeAction={(action) =>
							onClickCapture({
								action,
							})
						}
						onQuoteClick={() =>
							onClickCapture({
								action: "quote",
							})
						}
					/>
				</div>
				{menuItemsType !== "view" && (
					<div className="group relative flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
						<Icon iconKind="optionDots" />
						<div className="hidden group-hover:block">
							<PostOptionMenu
								menuItemsType={menuItemsType}
								onMenuItemClick={(_) =>
									onClickCapture({
										action: "deletePost",
									})
								}
							/>
						</div>
					</div>
				)}
			</main>
		</li>
	)
}
