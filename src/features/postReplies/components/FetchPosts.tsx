import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { LoadingPage } from "~/components/LoadingPage"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuote } from "~/features/postQuote"
import { PostItem } from "./PostItem"
import { type PostWithAuthor } from "~/features/postItem"
import { useGetPostReplies } from "../hooks/useGetPostReplies"

export type RefetchPostHandle = {
	Refetch: () => void
}

type Props = {
	postId: string
	authorId: string
	onDeleteReply: () => void
}

export const FetchPosts = forwardRef<RefetchPostHandle, Props>((props, ref) => {
	const { authorId, onDeleteReply, postId } = props

	const ulRef = useRef<HTMLUListElement>(null)
	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)

	const { isLoading, postReplies, refetch } = useGetPostReplies(
		postId,
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	useImperativeHandle(ref, () => ({
		async Refetch() {
			await refetch()
		},
	}))

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<>
			<ul className="">
				{postReplies?.map((reply) => (
					<PostItem
						key={reply.post.id}
						signInUserId={authorId}
						postWithAuthor={reply}
						setQuotePopUp={(quoteData) => setQuotePopUp(quoteData)}
						refetch={async () => {
							await refetch()
						}}
						onDeleteReply={onDeleteReply}
					/>
				))}
			</ul>
			{quotePopUp && (
				<Dialog open={true} onClose={() => setQuotePopUp(null)}>
					<PostQuote
						onPostQuoted={async () => {
							setQuotePopUp(null)
							await refetch()
						}}
						quotedPost={quotePopUp}
					/>
				</Dialog>
			)}
		</>
	)
})
