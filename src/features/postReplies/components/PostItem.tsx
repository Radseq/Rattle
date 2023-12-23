import { type FC } from "react"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { PostItemForm } from "~/components/post/PostItemForm"
import { type PostWithAuthor } from "~/components/post/types"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { usePostItemActions } from "../hooks/usePostItemActions"
import { getPostProfileType } from "~/utils/helpers"

export const PostItem: FC<{
	signInUserId: string
	postWithAuthor: PostWithAuthor
	setQuotePopUp: (quoteData: PostWithAuthor) => void
	refetch: () => Promise<void>
	onDeleteReply: () => void
}> = ({ signInUserId, postWithAuthor, setQuotePopUp, refetch, onDeleteReply }) => {
	const { author, post, signInUser } = postWithAuthor

	const { forwardPost, handlePostClick, likePost, pollVote, removePostForward, unlikePost } =
		usePostItemActions(async () => {
			await refetch()
		}, onDeleteReply)

	return (
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
					setQuotePopUp(postWithAuthor)
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
