import { type FC } from "react"
import { Icon } from "../Icon"
import Image from "next/image"
import { type PostWithUser } from "./types"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const PostQuotePopUp: FC<{
	post: PostWithUser
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
								<Image
									className="h-16 w-16 rounded-full"
									src={profileImageUrl}
									alt={"avatar"}
									width={128}
									height={128}
								></Image>
								<textarea
									className="border-none pl-1 text-xl
									outline-none focus:border-none active:border-none"
									placeholder="Add a comment!"
									onChange={(e) => onMessageChange(e.target.value)}
								/>
							</div>
							<div className="m-1 rounded-lg border-2 border-b-gray-300 p-2">
								<div className="flex">
									<Image
										className="h-16 w-16 rounded-full"
										src={post.author.profileImageUrl}
										alt={"avatar"}
										width={128}
										height={128}
									></Image>
									<div className="w-10/12 pl-2">
										<div className="font-semibold">
											<span>{`@${post.author.username}`}</span>
											<span className="p-1 text-slate-400">·</span>
											<span className="font-normal text-slate-400">
												{dayjs(post.post.createdAt).fromNow()}
											</span>
										</div>
										<span>{post.post.content}</span>
									</div>
								</div>
							</div>
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
