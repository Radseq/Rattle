import { type FC, useState } from "react"
import { PostQuotePopUp } from "./PostQuotePopUp"
import { type PostWithAuthor } from "~/components/post/types"
import { api } from "~/utils/api"
import { CONFIG } from "~/config"
import toast from "react-hot-toast"

export const PostQuote: FC<{
	quotedPost: PostWithAuthor
	onPostQuoted: () => Promise<void>
}> = ({ quotedPost, onPostQuoted }) => {
	const [quoteMessage, setQuoteMessage] = useState<string>()

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			await onPostQuoted()
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<PostQuotePopUp
			author={quotedPost.author}
			createdAt={quotedPost.post.createdAt}
			message={quotedPost.post.content}
			onPostQuote={() => {
				quotePost.mutate({
					content: quoteMessage ?? "",
					quotedPostId: quotedPost.post.id,
				})
			}}
			onMessageChange={(message) => setQuoteMessage(message)}
		/>
	)
}
