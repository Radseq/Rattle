import { type FC, useState } from "react"
import type { PostMenuItemsType, PostWithUser } from "./types"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostOptionMenu } from "./PostOptionMenu"
import { Icon } from "../Icon"

dayjs.extend(relativeTime)

export const PostItem: FC<{
	postWithUser: PostWithUser
	menuItemsType: PostMenuItemsType
	onOptionClick: (action: string, postId: string) => void
	onNavigateToPost: () => void
}> = ({ postWithUser, onOptionClick, menuItemsType, onNavigateToPost }) => {
	const [showMenu, setShowMenu] = useState(false)

	return (
		<li
			className="flex cursor-pointer rounded-lg py-2 hover:bg-gray-100"
			onMouseUp={() => onNavigateToPost()}
		>
			<Image
				className="w-1/12 rounded-full"
				src={postWithUser.author.profileImageUrl}
				alt={"avatar"}
				width={128}
				height={128}
			></Image>
			<div className="w-10/12 pl-2">
				<div className="font-semibold">
					<span>
						<Link
							href={`/${postWithUser.author.username}`}
						>{`@${postWithUser.author.username}`}</Link>
					</span>
					<span className="p-1 text-slate-400">·</span>
					<span className="font-normal text-slate-400">
						{dayjs(postWithUser.post.createdAt).fromNow()}
					</span>
				</div>
				<span>{postWithUser.post.content}</span>
			</div>
			{menuItemsType !== "view" && (
				<div
					className="relative flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200"
					onMouseEnter={() => setShowMenu(true)}
				>
					<Icon iconKind="optionDots" />
					{showMenu && (
						<PostOptionMenu
							closeMenu={() => setShowMenu(false)}
							postId={postWithUser.post.id}
							menuItemsType={menuItemsType}
							onMenuItemClick={(action, postId) => {
								onOptionClick(action, postId)
								setShowMenu(false)
							}}
						/>
					)}
				</div>
			)}
		</li>
	)
}
