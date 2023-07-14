import { type FC } from "react"
import { type PostWithAuthor } from "./types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { PostTitle } from "./PostTitle"
import { ProfileAvatarImageUrl } from "../profile/ProfileAvatarImageUrl"
dayjs.extend(relativeTime)

export const PostQuoteItem: FC<{ postWithAuthor: PostWithAuthor }> = ({ postWithAuthor }) => {
	const { post, author } = postWithAuthor
	return (
		<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
			<div className="flex">
				<ProfileAvatarImageUrl
					className="h-8 w-8 rounded-full"
					size={32}
					src={author.profileImageUrl}
				/>
				<PostTitle author={author} createdAt={post.createdAt} />
			</div>
			<span className="block">{post.content}</span>
		</div>
	)
}
