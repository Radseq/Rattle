import { type FC } from "react"
import type { PostMenuItemsType, PostWithAuthor } from "./types"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostOptionMenu } from "./PostOptionMenu"
import { Icon } from "../Icon"
import { PostFooter } from "./PostFooter"

dayjs.extend(relativeTime)

export const PostItem: FC<{
	postWithUser: PostWithAuthor
	menuItemsType: PostMenuItemsType
	onOptionClick: (action: string, postId: string) => void
	onNavigateToPost: () => void
	forwardAction: (action: "forward" | "deleteForward", postId: string) => void
	likeAction: (action: "like" | "unlike", postId: string) => void
	onQuoteClick: (quotedPost: PostWithAuthor) => void
}> = ({
	postWithUser,
	onOptionClick,
	menuItemsType,
	onNavigateToPost,
	forwardAction,
	likeAction,
	onQuoteClick,
}) => {
	return (
		<li
			className="cursor-pointer rounded-lg py-2 hover:bg-gray-100"
			onClick={() => {
				onNavigateToPost()
			}}
		>
			<main className="flex">
				<Image
					className="h-16 w-16 rounded-full"
					src={postWithUser.author.profileImageUrl}
					alt={"avatar"}
					width={128}
					height={128}
				></Image>
				<div className="w-10/12 pl-2">
					<div className="font-semibold">
						<span className="pr-1">{postWithUser.author.fullName}</span>
						<span>
							<Link
								onClick={(e) => e.stopPropagation()}
								href={`/${postWithUser.author.username}`}
							>{`@${postWithUser.author.username}`}</Link>
						</span>
						<span className="p-1 text-slate-400">·</span>
						<span className="font-normal text-slate-400">
							{dayjs(postWithUser.post.createdAt).fromNow()}
						</span>
					</div>
					<span>{postWithUser.post.content}</span>
					<PostFooter
						isLikedByUser={postWithUser.post.isLikedBySignInUser}
						postWithUser={postWithUser}
						isForwardedByUser={postWithUser.post.isForwardedPostBySignInUser}
						forwardAction={forwardAction}
						likeAction={likeAction}
						onQuoteClick={() => onQuoteClick(postWithUser)}
					/>
				</div>
				{menuItemsType !== "view" && (
					<div className="group relative flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
						<Icon iconKind="optionDots" />
						<div className="hidden group-hover:block">
							<PostOptionMenu
								postId={postWithUser.post.id}
								menuItemsType={menuItemsType}
								onMenuItemClick={(action, postId) => {
									onOptionClick(action, postId)
								}}
							/>
						</div>
					</div>
				)}
			</main>
		</li>
	)
}
