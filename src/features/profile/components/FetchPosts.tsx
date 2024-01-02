import { type FC, useRef, useState } from "react"
import { LoadingPage } from "../../../components/LoadingPage"
import { type PostWithAuthor } from "../../postItem/types"
import { PostQuote } from "~/features/postQuote"
import { Dialog } from "~/components/dialog/Dialog"
import { PostItem } from "~/features/postItem"
import { useGetPostsByAuthor } from "../hooks/useGetPostsByAuthor"

export const FetchPosts: FC<{
	authorId: string
	userId: string | undefined | null
}> = ({ authorId, userId }) => {
	const ulRef = useRef<HTMLUListElement>(null)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)

	const { isLoading, posts, refetch } = useGetPostsByAuthor(
		authorId,
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

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
						signInUserId={userId ?? ""}
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
