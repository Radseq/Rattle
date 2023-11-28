import { type FC, useEffect, useRef, useState } from "react"
import { useGetHomePosts } from "../hooks"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type PostWithAuthor } from "~/components/post/types"
import { getPostProfileType } from "~/utils/helpers"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { api } from "~/utils/api"
import { LoadingPage } from "~/components/LoadingPage"
import { useRouter } from "next/router"
import { Dialog } from "~/components/dialog/Dialog"
import { PostQuote } from "~/features/postQuote"

export const FetchPosts: FC<{
	signInUserId: string
	forceRefetch: boolean
	refetchComplete: () => void
}> = ({ signInUserId, forceRefetch, refetchComplete }) => {
	const ulRef = useRef<HTMLUListElement>(null)
	const router = useRouter()

	const { isLoading, posts, refetch } = useGetHomePosts(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)

	useEffect(() => {
		const asyncRefetch = async () => {
			if (forceRefetch) {
				await refetch()
				refetchComplete()
			}
		}

		asyncRefetch().catch(() => refetchComplete())
	}, [forceRefetch, refetchComplete, refetch])

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
						createdPostTime={post.createdAt}
						postAuthor={author}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, { author, post, signInUser })
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
}
