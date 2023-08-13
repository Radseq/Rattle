import { LoadingSpinner } from "../../../components/LoadingPage"
import { type FC, useState } from "react"
import { ProfileAvatarImageUrl } from "../../../components/profile/ProfileAvatarImageUrl"

export const CreatePostReply: FC<{
	onCreatePost: (message: string) => void
	isCreating: boolean
	profileImageUrl: string
	placeholderMessage: string
}> = ({ onCreatePost, isCreating, profileImageUrl, placeholderMessage }) => {
	const [postContent, setPostContent] = useState<string>()

	return (
		<div className="flex rounded-lg p-2 hover:bg-gray-100 ">
			<ProfileAvatarImageUrl src={profileImageUrl} className="w-1/12 rounded-full pr-2" />
			<input
				className="w-full rounded-xl border-2 border-solid text-lg outline-none"
				placeholder={placeholderMessage}
				onChange={(e) => setPostContent(e.target.value)}
				type="text"
				value={postContent}
				onKeyDown={(e) => {
					if (e.key === "Enter" && postContent) {
						onCreatePost(postContent)
						setPostContent("")
					}
				}}
				disabled={isCreating}
			></input>
			{isCreating && (
				<div>
					<LoadingSpinner size={50} />
				</div>
			)}
		</div>
	)
}
