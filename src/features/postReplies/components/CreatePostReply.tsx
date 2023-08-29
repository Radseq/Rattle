import { ProfileAvatarImageUrl } from "~/features/profile"
import { LoadingPage, LoadingSpinner } from "../../../components/LoadingPage"
import { type FC, useState } from "react"
import { type KeyboardEvent } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { CONFIG } from "~/config"

const CreatePostReply: FC<{
	onCreatePost: (message: string) => void
	onKeyDown: (key: KeyboardEvent<HTMLInputElement>) => void
	value: string
	profileImageUrl: string
}> = ({ onCreatePost, onKeyDown, value, profileImageUrl }) => {
	return (
		<div className="flex rounded-lg p-2 hover:bg-gray-100 ">
			<ProfileAvatarImageUrl src={profileImageUrl} className="w-1/12 rounded-full pr-2" />
			<input
				className="w-full rounded-xl border-2 border-solid text-lg outline-none"
				placeholder="Reply & Hit Enter!"
				onChange={(e) => onCreatePost(e.target.value)}
				type="text"
				value={value}
				onKeyDown={(e) => onKeyDown(e)}
			></input>
		</div>
	)
}

export const CreatePostReplyConnector: FC<{
	onCreateReply: () => void
	profileImageUrl: string
	postId: string
}> = ({ onCreateReply, profileImageUrl, postId }) => {
	const [postContent, setPostContent] = useState<string>("")

	const { mutate, isLoading: isPosting } = api.posts.createReplyPost.useMutation({
		onSuccess: () => {
			onCreateReply()
			setPostContent("")
		},
		onError: () => {
			toast.error("Failed to add reply! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	if (isPosting) {
		return (
			<div className="flex w-full items-center justify-center">
				<LoadingSpinner size={30} />
			</div>
		)
	}

	return (
		<div>
			<CreatePostReply
				onCreatePost={(respondMessage) => setPostContent(respondMessage)}
				profileImageUrl={profileImageUrl}
				onKeyDown={(e) => {
					if (e.key === "Enter" && postContent) {
						mutate({ content: postContent, replyPostId: postId })
					}
				}}
				value={postContent}
			/>
		</div>
	)
}
