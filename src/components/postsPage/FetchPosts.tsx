import { type FC, useEffect, useState } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { type ClickCapture, PostItem } from "./PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { CONFIG } from "~/config"
import { type PollVote, type PostWithAuthor } from "./types"
import { PostQuotePopUp } from "./PostQuotePopUp"
import { type User } from "@clerk/nextjs/dist/api"
import { PostFooter } from "./PostFooter"

export const FetchPosts: FC<{
	userId: string
	user: User | undefined
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, user }) => {
	const router = useRouter()
	const type = usePostMenuItemsType(isUserFollowProfile, user, userId)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()
	const [posts, setPosts] = useState<PostWithAuthor[]>()

	const forwardedPostIdsByUser = api.profile.getPostIdsForwardedByUser.useQuery()
	const getPosts = api.posts.getAllByAuthorId.useQuery(userId)

	useEffect(() => {
		if (getPosts.data) {
			if (forwardedPostIdsByUser.data) {
				const posts = getPosts.data.map((post) => {
					post.post.isForwardedPostBySignInUser = forwardedPostIdsByUser.data.some(
						(postId) => postId === post.post.id
					)
					return post
				})
				setPosts(posts)
			} else {
				setPosts(getPosts.data)
			}
		}
	}, [getPosts.data, forwardedPostIdsByUser.data])

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
		onSuccess: (_, postId) => {
			toast.success("Post Liked!")
			if (posts) {
				const copyPosts = posts.map((post) => {
					if (post.post.id === postId) {
						post.post.likeCount += 1
						post.post.isLikedBySignInUser = true
					}
					return post
				})
				setPosts(copyPosts)
			}
		},
		onError: () => {
			toast.error("Failed to like post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const unlikePost = api.profile.setPostUnliked.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Unliked!")
			if (posts) {
				const copyPosts = posts.map((postWithAuthor) => {
					if (postWithAuthor.post.id === postId) {
						postWithAuthor.post.likeCount -= 1
						postWithAuthor.post.isLikedBySignInUser = false
					}
					return postWithAuthor
				})
				setPosts(copyPosts)
			}
		},
		onError: () => {
			toast.error("Failed to unlike post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const forwardPost = api.posts.forwardPost.useMutation({
		onSuccess: (resPostWithAuthor) => {
			toast.success("Post Forwarded!")
			if (posts) {
				const modifiedPost = posts.map((postWithAuthor) => {
					if (postWithAuthor.post.id === resPostWithAuthor.post.id) {
						return resPostWithAuthor
					}
					return postWithAuthor
				})
				modifiedPost.push(resPostWithAuthor)

				setPosts(modifiedPost)
			}
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
		onSuccess: (result: PollVote, { postId }) => {
			toast.success("Voted!")
			if (!posts) {
				return
			}

			const copyPost = posts.map((postWithAuthor) => {
				if (postWithAuthor.post.id === postId && postWithAuthor.post.poll) {
					const poll = { ...postWithAuthor.post.poll }
					if (result.newChoiceId && !result.oldChoiceId) {
						poll.choiceVotedBySignInUser = result.newChoiceId
						poll.userVotes = [...postWithAuthor.post.poll.userVotes].map((userVote) => {
							if (userVote.id === result.newChoiceId) {
								userVote.voteCount += 1
							}
							return userVote
						})
					} else if (result.newChoiceId && result.oldChoiceId) {
						poll.choiceVotedBySignInUser = result.newChoiceId
						poll.userVotes = [...postWithAuthor.post.poll.userVotes].map((userVote) => {
							if (userVote.id === result.newChoiceId) {
								userVote.voteCount += 1
							} else if (userVote.id === result.oldChoiceId) {
								userVote.voteCount -= 1
							}
							return userVote
						})
					} else {
						poll.choiceVotedBySignInUser = undefined
						poll.userVotes = [...postWithAuthor.post.poll.userVotes].map((userVote) => {
							if (userVote.id === result.oldChoiceId) {
								userVote.voteCount -= 1
							}
							return userVote
						})
					}
					postWithAuthor.post.poll = poll
				}
				return postWithAuthor
			})
			setPosts(copyPost)
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
			case "vote":
				if (clickCapture.choiceId) {
					pollVote.mutate({ postId: post.id, choiceId: clickCapture.choiceId })
				}
				break
			default:
				toast.error("Error while post click", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				break
		}
	}

	const openDialog = quotePopUp ? true : false && user ? true : false

	return (
		<div>
			<ul>
				{posts?.map((postsWithUser) => (
					<PostItem
						key={postsWithUser.post.id}
						postWithUser={postsWithUser}
						onClickCapture={(clickCapture) => {
							handlePostClick(clickCapture, postsWithUser)
						}}
						menuItemsType={type}
						footer={
							<PostFooter
								isForwarded={postsWithUser.post.isForwardedPostBySignInUser}
								onForwardClick={() => {
									if (postsWithUser.post.isForwardedPostBySignInUser) {
										removePostForward.mutate(postsWithUser.post.id)
									} else {
										forwardPost.mutate(postsWithUser.post.id)
									}
								}}
								onLikeClick={() => {
									if (postsWithUser.post.isLikedBySignInUser) {
										unlikePost.mutate(postsWithUser.post.id)
									} else {
										likePost.mutate(postsWithUser.post.id)
									}
								}}
								onQuoteClick={() => {
									setQuotePopUp(postsWithUser)
								}}
								sharedCount={
									postsWithUser.post.quotedCount +
									postsWithUser.post.forwardsCount
								}
								isLiked={postsWithUser.post.isLikedBySignInUser}
								likeCount={postsWithUser.post.likeCount}
								username={postsWithUser.author.username}
								replyCount={postsWithUser.post.replyCount}
								postId={postsWithUser.post.id}
							/>
						}
					/>
				))}
			</ul>
			<dialog open={openDialog}>
				{quotePopUp && user && (
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
