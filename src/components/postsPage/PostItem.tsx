import { type FC, useState } from "react"
import type { PostOptionMenuType, PostWithUser } from "./types"
import Image from "next/image"
import Link from "next/link"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { OwnPostOptionMenu } from "./OwnPostOptionMenu"

dayjs.extend(relativeTime)

export const PostItem: FC<{
	postWithUser: PostWithUser
	menuType: PostOptionMenuType
	refetchPosts: CallableFunction
}> = ({ postWithUser, refetchPosts, menuType }) => {
	const [showMenu, setShowMenu] = useState(false)
	return (
		<li className="flex rounded-lg py-2 hover:bg-gray-100 ">
			<Image
				className="w-1/12 rounded-full"
				src={postWithUser.author.profileImageUrl}
				alt={"avatar"}
				width={128}
				height={128}
			></Image>
			<div className="w-10/12 pl-2">
				<div className="font-semibold">
					<Link
						href={`/${postWithUser.author.username}`}
					>{`@${postWithUser.author.username}`}</Link>
					<span className="p-1 text-slate-400">·</span>
					<span className="font-normal text-slate-400">
						{dayjs(postWithUser.post.createdAt).fromNow()}
					</span>
				</div>
				<span>{postWithUser.post.content}</span>
			</div>
			{menuType !== "view" && (
				<div
					className="relative flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200"
					onMouseEnter={() => setShowMenu(true)}
				>
					<Image
						width={15}
						height={15}
						src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/dots-horizontal.svg"
						alt={"icon"}
					></Image>
					{menuType === "own" && showMenu && (
						<OwnPostOptionMenu
							postId={postWithUser.post.id}
							closeMenu={() => setShowMenu(false)}
							refetchPosts={() => refetchPosts}
						/>
					)}
				</div>
			)}
		</li>
	)
}
