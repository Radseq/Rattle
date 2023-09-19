import { useAuth } from "@clerk/nextjs"
import router from "next/router"
import { type FC, useRef, useState } from "react"
import toast from "react-hot-toast"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { type PostWithAuthor } from "~/components/post/types"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { CONFIG } from "~/config"
import { api } from "~/utils/api"
import { getPostProfileType } from "~/utils/helpers"
import { useGetPosts } from "../hooks"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { LoadingPage } from "~/components/LoadingPage"

export const LatestPosts: FC<{ tag: string }> = ({ tag }) => {
	const ulRef = useRef<HTMLUListElement>(null)
	const user = useAuth()
	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()
	const { isLoading, posts, refetch } = useGetPosts(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop,
		tag
	)

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
				toast.error("Error while post click", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				break
		}
	}

	const removePostForward = api.posts.removePostForward.useMutation({
		onSuccess: async () => {
			toast.success("Delete Post Forward!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to delete forward! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

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

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await refetch()
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

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			setQuotePopUp(null)
			await refetch()
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
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
			{quotePopUp && user && (
				<Dialog
					open={quotePopUp != null && user != null}
					onClose={() => setQuotePopUp(null)}
				>
					<PostQuotePopUp
						author={quotePopUp.author}
						createdAt={quotePopUp.post.createdAt}
						message={quotePopUp.post.content}
						onCloseModal={() => setQuotePopUp(null)}
						onPostQuote={() => {
							quotePost.mutate({
								content: quoteMessage ?? "",
								quotedPostId: quotePopUp.post.id,
							})
						}}
						onMessageChange={(message) => setQuoteMessage(message)}
					/>
				</Dialog>
			)}

			<ul ref={ulRef}>
				{posts?.map(({ author, post, signInUser }) => (
					<PostItem
						key={post.id}
						postWithUser={{ author, post, signInUser }}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, { author, post, signInUser })
						}}
						menuItemsType={getPostProfileType(
							signInUser?.authorFollowed ?? false,
							user.userId,
							author.id
						)}
						footer={
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
						}
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
					</PostItem>
				))}
			</ul>
		</>
	)
}
