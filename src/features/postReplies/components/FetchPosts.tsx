import { forwardRef, useImperativeHandle, useRef, useState } from "react"
import { useGetPostReplies } from "../hooks"
import { useAuth } from "@clerk/nextjs"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { getPostProfileType } from "~/utils/helpers"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { api } from "~/utils/api"
import { LoadingPage } from "~/components/LoadingPage"
import { type PostWithAuthor } from "~/components/post/types"
import { useRouter } from "next/router"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuote } from "~/features/postQuote"

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

	const user = useAuth()
	const router = useRouter()
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

	const likePost = api.profile.setPostLiked.useMutation({
		onSuccess: async () => {
			toast.success("Post Liked!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to like post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const unlikePost = api.profile.setPostUnliked.useMutation({
		onSuccess: async () => {
			toast.success("Post Unliked!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to unlike post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const forwardPost = api.posts.forwardPost.useMutation({
		onSuccess: async () => {
			toast.success("Post Forwarded!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to forward post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const removePostForward = api.posts.removePostForward.useMutation({
		onSuccess: async () => {
			toast.success("Delete Post Forward!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to remove forwarded post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	const handlePostClick = (clickCapture: ClickCapture, postsWithUser: PostWithAuthor) => {
		const { post } = postsWithUser
		switch (clickCapture.action) {
			case "navigation":
				handleNavigateToPost(post.id, postsWithUser.author.username)
				break
			case "deletePost":
				deletePost.mutate(post.id)
				break
			default:
				break
		}
	}

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await refetch()
			onDeleteReply()
		},
		onError: () => {
			toast.error("Failed to delete post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const pollVote = api.profile.votePostPoll.useMutation({
		onSuccess: async () => {
			toast.success("Voted!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to vote! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

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
						createdPostTime={reply.post.createdAt}
						postAuthor={reply.author}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, reply)
						}}
						menuItemsType={getPostProfileType(
							reply.signInUser?.authorFollowed,
							authorId,
							user.userId
						)}
					>
						<PostContentSelector
							post={reply.post}
							pollVote={(choiceId) =>
								pollVote.mutate({
									postId: reply.post.id,
									choiceId,
								})
							}
						/>
						<PostFooter
							isForwarded={reply.signInUser?.isForwarded ?? false}
							onForwardClick={() => {
								if (reply.signInUser?.isForwarded ?? false) {
									removePostForward.mutate(reply.post.id)
								} else {
									forwardPost.mutate(reply.post.id)
								}
							}}
							onLikeClick={() => {
								if (reply.signInUser?.isLiked ?? false) {
									unlikePost.mutate(reply.post.id)
								} else {
									likePost.mutate(reply.post.id)
								}
							}}
							onQuoteClick={() => {
								setQuotePopUp(reply)
							}}
							sharedCount={reply.post.quotedCount + reply.post.forwardsCount}
							isLiked={reply.signInUser?.isLiked ?? false}
							likeCount={reply.post.likeCount}
							username={reply.author.username}
							replyCount={reply.post.replyCount}
							postId={reply.post.id}
						/>
					</PostItem>
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
