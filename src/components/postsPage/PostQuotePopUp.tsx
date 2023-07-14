import { type FC } from "react"
import { Icon } from "../Icon"
import { type PostWithAuthor } from "./types"
import { PostQuoteItem } from "./PostQuoteItem"
import { ProfileAvatarImageUrl } from "../profile/ProfileAvatarImageUrl"

export const PostQuotePopUp: FC<{
	post: PostWithAuthor
	profileImageUrl: string
	onCloseModal: () => void
	onPostQuote: () => void
	onMessageChange: (content: string) => void
}> = ({ post, profileImageUrl, onCloseModal, onPostQuote, onMessageChange }) => {
	return (
		<div>
			<div
				onClick={(e) => e.stopPropagation()}
				className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
			>
				<div className="relative my-6 mx-auto w-auto max-w-3xl">
					<div className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg outline-none focus:outline-none">
						<header>
							<button
								className="m-1 h-8 w-8"
								onClick={(e) => {
									e.stopPropagation()
									onCloseModal()
								}}
							>
								<Icon iconKind="cross" />
							</button>
						</header>
						<main className="px-4">
							<div className="flex">
								<ProfileAvatarImageUrl url={profileImageUrl} />
								<textarea
									className="border-none pl-1 text-xl
									outline-none focus:border-none active:border-none"
									placeholder="Add a comment!"
									onChange={(e) => onMessageChange(e.target.value)}
								/>
							</div>
							<PostQuoteItem postWithAuthor={post} />
						</main>
						<footer className="m-2 flex items-center justify-end rounded-b">
							<button
								className="mr-1 mb-1 rounded bg-blue-400 px-6 py-3 text-sm 
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
				</div>
			</div>
			<div className="fixed inset-0 z-40 bg-black opacity-25"></div>
		</div>
	)
}
