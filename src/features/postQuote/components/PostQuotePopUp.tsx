import { type FC } from "react"
import { type PostAuthor, ProfileAvatarImageUrl } from "~/features/profile"
import { PostQuoteItem } from "./PostQuoteItem"

export const PostQuotePopUp: FC<{
	author: PostAuthor
	createdAt: string
	message: string
	onPostQuote: () => void
	onMessageChange: (content: string) => void
}> = ({ author, createdAt, message, onPostQuote, onMessageChange }) => {
	return (
		<div>
			<div className="px-4">
				<div className="flex">
					<ProfileAvatarImageUrl src={author.profileImageUrl} />
					<textarea
						className="border-none pl-1 text-xl
									outline-none focus:border-none active:border-none"
						placeholder="Add a comment!"
						onChange={(e) => onMessageChange(e.target.value)}
					/>
				</div>
				<PostQuoteItem author={author} createdAt={createdAt} message={message} />
			</div>
			<footer className="m-2 flex items-center justify-end rounded-b">
				<button
					className="mb-1 mr-1 rounded bg-blue-400 px-6 py-3 text-sm 
								font-bold uppercase text-white shadow outline-none transition-all 
								duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-blue-600"
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onPostQuote()
					}}
				>
					Post
				</button>
			</footer>
		</div>
	)
}
