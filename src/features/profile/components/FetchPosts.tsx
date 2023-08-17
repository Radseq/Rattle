import { type FC, useState } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../../../components/LoadingPage"
import { type ClickCapture, PostItem } from "../../../components/post/PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { type PostWithAuthor } from "../../../components/post/types"
import { PostQuotePopUp } from "../../../components/postsPage/PostQuotePopUp"
import { PostFooter } from "../../../components/postsPage/PostFooter"
import { PostContentSelector } from "../../../components/post/PostContentSelector"
import { getPostProfileType } from "~/utils/helpers"

export const FetchPosts: FC<{
	authorId: string
	userId: string | undefined | null
}> = ({ authorId, userId }) => {
	const router = useRouter()

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()
	const getPosts = api.posts.getAllByAuthorId.useQuery(authorId)

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await getPosts.refetch()
		},
		onError: () => {
			toast.error("Failed to delete post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			setQuotePopUp(null)
			await getPosts.refetch()
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const likePost = api.profile.setPostLiked.useMutation({
		onSuccess: async () => {
			toast.success("Post Liked!")
			await getPosts.refetch()
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
			await getPosts.refetch()
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
			await getPosts.refetch()
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
			await getPosts.refetch()
		},
		onError: () => {
			toast.error("Failed to delete forward! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const pollVote = api.profile.votePostPoll.useMutation({
		onSuccess: async () => {
			toast.success("Voted!")
			await getPosts.refetch()
		},
		onError: () => {
			toast.error("Failed to vote! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	if (getPosts.isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

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

	const openDialog = quotePopUp != null && userId != null

	return (
		<div>
			<ul>
				{getPosts.data?.map(({ author, post, signInUser }) => (
					<PostItem
						key={post.id}
						postWithUser={{ author, post, signInUser }}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, { author, post, signInUser })
						}}
						menuItemsType={getPostProfileType(
							signInUser?.authorFollowed,
							author.id,
							userId
						)}
						footer={
							<PostFooter
								isForwarded={signInUser?.isForwarded ?? false}
								onForwardClick={() => {
									if (signInUser?.isForwarded) {
										removePostForward.mutate(post.id)
									} else {
										forwardPost.mutate(post.id)
									}
								}}
								onLikeClick={() => {
									if (signInUser?.isLiked) {
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
							postWithAuthor={{ author, post, signInUser }}
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
			<dialog open={openDialog}>
				{quotePopUp && userId && (
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
				)}
			</dialog>
		</div>
	)
}
