import { type FC, useRef, useState } from "react"
import { LoadingPage } from "~/components/LoadingPage"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuote } from "~/features/postQuote"
import { PostItem, type PostWithAuthor } from "~/features/postItem"
import { useGetHomePosts } from "../hooks/useGetHomePosts"

export const FetchPosts: FC<{
	signInUserId: string
}> = ({ signInUserId }) => {
	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, posts, refetch } = useGetHomePosts(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<>
			<ul ref={ulRef}>
				{posts?.map(({ author, post, signInUser }) => (
					<PostItem
						key={post.id}
						signInUserId={signInUserId}
						postWithAuthor={{ author, post, signInUser }}
						setQuotePopUp={(quoteData) => setQuotePopUp(quoteData)}
						refetch={async () => {
							await refetch()
						}}
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
}
