import { type FC } from "react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostTitle } from "../../../components/postsPage/PostTitle"
import { type PostAuthor, ProfileAvatarImageUrl } from "~/features/profile"
import PostMessageRenderer from "~/features/postMessage/components/PostMessageRenderer"
dayjs.extend(relativeTime)

export const PostQuoteItem: FC<{ author: PostAuthor; createdAt: string; message: string }> = ({
	author,
	createdAt,
	message,
}) => {
	return (
		<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
			<div className="flex">
				<ProfileAvatarImageUrl
					className="h-8 w-8 rounded-full"
					size={32}
					src={author.profileImageUrl}
				/>
				<PostTitle
					fullName={author.fullName}
					username={author.username}
					createdAt={createdAt}
				/>
			</div>
			<PostMessageRenderer message={message} />
		</div>
	)
}
