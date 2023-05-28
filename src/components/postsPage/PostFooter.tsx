import { type FC, useState } from "react"
import { Icon } from "../Icon"
import { Heart } from "../Icons/Heart"
import Link from "next/link"
import { type PostWithUser } from "./types"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { ParseZodErrorToString } from "~/utils/helpers"
import { CONFIG } from "~/config"

export const PostFooter: FC<{
	isLikedByUser: boolean
	postWithUser: PostWithUser
}> = ({ isLikedByUser, postWithUser }) => {
	const [isPostLiked, setPostLiked] = useState<boolean>(isLikedByUser)
	const [postLikedCount, setPostLikedCount] = useState<number>(postWithUser.post.replaysCount)

	const likePost = api.posts.setPostLiked.useMutation({
		onSuccess: () => {
			toast.success("Post Liked!")
			setPostLiked(true)
			setPostLikedCount(postLikedCount + 1)
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to like post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const unlikePost = api.posts.setPostUnliked.useMutation({
		onSuccess: () => {
			toast.success("Post Unliked!")
			setPostLiked(false)
			setPostLikedCount(postLikedCount - 1)
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to unlike post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

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
					if (isPostLiked) {
						unlikePost.mutate(postWithUser.post.id)
					} else {
						likePost.mutate(postWithUser.post.id)
					}
				}}
			>
				<Heart
					className={`h-9 w-9 rounded-full p-1 ${
						isPostLiked ? "group-hover:bg-gray-500" : "group-hover:bg-red-500"
					}`}
					fillColor={isPostLiked ? "red" : ""}
				/>
				<span className={"self-center pl-1 text-xl group-hover:text-red-500"}>
					{postLikedCount}
				</span>
			</div>
		</footer>
	)
}
