import { type FC } from "react"
import { getPostProfileType } from "~/utils/helpers"
import { usePostItemActions } from "../hooks/usePostItemActions"
import { PostContentSelector } from "./PostContentSelector"
import { PostFooter } from "./PostFooter"
import { type ClickCapture, PostItemForm } from "./PostItemForm"
import { type PostWithAuthor } from "../types"

export const PostItem: FC<{
	signInUserId: string
	postWithAuthor: PostWithAuthor
	setQuotePopUp: (quoteData: PostWithAuthor) => void
	refetch: () => Promise<void>
}> = ({ signInUserId, postWithAuthor, setQuotePopUp, refetch }) => {
	const { author, post, signInUser } = postWithAuthor
	const { forwardPost, handlePostClick, likePost, pollVote, removePostForward, unlikePost } =
		usePostItemActions(async () => {
			await refetch()
		})

	return (
		<PostItemForm
			key={post.id}
			createdPostTime={post.createdAt}
			postAuthor={author}
			onClickCapture={(clickCapture: ClickCapture) => {
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
	)
}
