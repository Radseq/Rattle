import { type FC, useEffect, useState } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { type ClickCapture, PostItem } from "./PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { canOpenPostQuoteDialog, ParseZodErrorToString } from "~/utils/helpers"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { CONFIG } from "~/config"
import { type PollVote, type PostWithAuthor } from "./types"
import { PostQuotePopUp } from "./PostQuotePopUp"
import { type User } from "@clerk/nextjs/dist/api"

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
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			setQuotePopUp(null)
			await getPosts.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to create replay! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
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
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to like post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
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
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to unlike post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const forwardPost = api.posts.forwardPost.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Forwarded!")
			if (posts) {
				const copyPosts = posts.map((postWithAuthor) => {
					if (postWithAuthor.post.id === postId) {
						postWithAuthor.post.forwardsCount += 1
						postWithAuthor.post.isForwardedPostBySignInUser = true
					}
					return postWithAuthor
				})
				setPosts(copyPosts)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to forward post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const removePostForward = api.posts.removePostForward.useMutation({
		onSuccess: async () => {
			toast.success("Delete Post Forward!")
			await getPosts.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete forward! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
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
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ?? "Failed to vote! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
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
			case "forward":
				forwardPost.mutate(post.id)
				break
			case "deleteForward":
				removePostForward.mutate(post.id)
				break
			case "like":
				likePost.mutate(post.id)
				break
			case "unlike":
				unlikePost.mutate(post.id)
				break
			case "quote":
				setQuotePopUp(postsWithUser)
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
					/>
				))}
			</ul>
			<dialog open={canOpenPostQuoteDialog(quotePopUp, user)}>
				{quotePopUp && user && (
					<PostQuotePopUp
						profileImageUrl={user.profileImageUrl}
						onCloseModal={() => setQuotePopUp(null)}
						post={quotePopUp}
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
