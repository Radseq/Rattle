import { type FC, useRef, useState } from "react"
import { useGetHomePosts } from "../hooks"
import { PostItemForm } from "~/components/post/PostItemForm"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type PostWithAuthor } from "~/components/post/types"
import { getPostProfileType } from "~/utils/helpers"
import { LoadingPage } from "~/components/LoadingPage"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuote } from "~/features/postQuote"
import { usePostItemActions } from "../hooks/usePostItemActions"

export const FetchPosts: FC<{
	signInUserId: string
}> = ({ signInUserId }) => {
	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, posts, refetch } = useGetHomePosts(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	const { forwardPost, handlePostClick, likePost, pollVote, removePostForward, unlikePost } =
		usePostItemActions(async () => {
			await refetch()
		})

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
					<PostItemForm
						key={post.id}
						createdPostTime={post.createdAt}
						postAuthor={author}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, post.id, author.username)
						}}
						menuItemsType={getPostProfileType(
							signInUser?.authorFollowed ?? false,
							signInUserId,
							author.id
						)}
					>
						<PostContentSelector
							post={post}
							pollVote={(choiceId) =>
								pollVote.mutate({
									postId: post.id,
									choiceId,
								})
							}
						/>
						<PostFooter
							isForwarded={signInUser?.isForwarded ?? false}
							onForwardClick={() => {
								if (signInUser?.isForwarded ?? false) {
									removePostForward.mutate(post.id)
								} else {
									forwardPost.mutate(post.id)
								}
							}}
							onLikeClick={() => {
								if (signInUser?.isLiked ?? false) {
									unlikePost.mutate(post.id)
								} else {
									likePost.mutate(post.id)
								}
							}}
							onQuoteClick={() => {
								setQuotePopUp({ author, post, signInUser })
							}}
							sharedCount={post.quotedCount + post.forwardsCount}
							isLiked={signInUser?.isLiked ?? false}
							likeCount={post.likeCount}
							username={author.username}
							replyCount={post.replyCount}
							postId={post.id}
						/>
					</PostItemForm>
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
