import { type FC, useEffect, useState } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { type SignInUser } from "../profilePage/types"
import { ParseZodErrorToString } from "~/utils/helpers"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { CONFIG } from "~/config"
import { type PostWithUser } from "./types"
import { PostQuotePopUp } from "./PostQuotePopUp"

export const FetchPosts: FC<{
	userId: string
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, signInUser }) => {
	const router = useRouter()
	const type = usePostMenuItemsType(isUserFollowProfile, signInUser, userId)

	const [quotePopUp, setQuotePopUp] = useState(false)
	const [posts, setPosts] = useState<PostWithUser[]>()

	const forwardedPostIdsByUser = api.posts.getPostIdsForwardedByUser.useQuery()
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

	const likePost = api.posts.setPostLiked.useMutation({
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

	const unlikePost = api.posts.setPostUnliked.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Unliked!")
			if (posts) {
				const copyPosts = posts.map((post) => {
					if (post.post.id === postId) {
						post.post.likeCount -= 1
						post.post.isLikedBySignInUser = false
					}
					return post
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
				const copyPosts = posts.map((post) => {
					if (post.post.id === postId) {
						post.post.forwardsCount += 1
						post.post.isForwardedPostBySignInUser = true
					}
					return post
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

	if (getPosts.isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	const handlePostOptionClick = (action: string, postId: string) => {
		switch (action) {
			case "delete":
				deletePost.mutate(postId)
				break

			default:
				break
		}
	}

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	return (
		<div>
			<ul className="">
				{posts?.map((postsWithUser) => (
					<PostItem
						key={postsWithUser.post.id}
						postWithUser={postsWithUser}
						onNavigateToPost={() => {
							handleNavigateToPost(
								postsWithUser.post.id,
								postsWithUser.author.username
							)
						}}
						menuItemsType={type}
						onOptionClick={handlePostOptionClick}
						forwardAction={(forward, postId) => {
							if (forward === "deleteForward") {
								removePostForward.mutate(postId)
							} else {
								forwardPost.mutate(postId)
							}
						}}
						likeAction={(action, postId) => {
							if (action === "like") {
								likePost.mutate(postId)
							} else {
								unlikePost.mutate(postId)
							}
						}}
						onQuoteClick={() => setQuotePopUp(true)}
					/>
				))}
			</ul>
			{quotePopUp && <PostQuotePopUp onCloseModal={() => setQuotePopUp(false)} />}
		</div>
	)
}
