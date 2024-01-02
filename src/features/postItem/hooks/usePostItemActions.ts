import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { api } from "~/utils/api"
import { type ClickCapture } from "../components/PostItemForm"

export const usePostItemActions = (refetch: () => Promise<void>) => {
	const router = useRouter()

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	const handlePostClick = (clickCapture: ClickCapture, postId: string, username: string) => {
		switch (clickCapture.action) {
			case "navigation":
				handleNavigateToPost(postId, username)
				break
			case "deletePost":
				deletePost.mutate(postId)
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

	return {
		handlePostClick,
		pollVote,
		removePostForward,
		forwardPost,
		unlikePost,
		likePost,
	}
}
