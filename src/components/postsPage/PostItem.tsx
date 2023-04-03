import { FC } from "react"
import { PostWithUser } from "./types"
import Image from "next/image"
import Link from "next/link"

export const PostItem: FC<{ postWithUser: PostWithUser }> = ({ postWithUser }) => {
	return (
		<li className="flex rounded-lg p-2 hover:bg-gray-100 ">
			<img
				className="w-1/12 rounded-full pr-2"
				src={postWithUser.author.profileImageUrl}
				alt={"avatar"}
			></img>
			<div className="w-10/12">
				<div className="font-semibold">
					<Link
						href={`/${postWithUser.author.username}`}
					>{`@${postWithUser.author.username}`}</Link>
				</div>
				<span className="text-md">{postWithUser.post.content}</span>
			</div>
			<div className="flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
				<Image
					width={15}
					height={15}
					src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/dots-horizontal.svg"
					alt={"icon"}
				></Image>
			</div>
		</li>
	)
}
