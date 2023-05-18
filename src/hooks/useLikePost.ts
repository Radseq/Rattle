import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"

export const useLikePost = () => {
	const unlikePost = api.posts.unlikePost.useMutation({
		onSuccess: () => {
			toast.success("Post Unliked!")
			window.location.reload()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to unlike post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const likePost = api.posts.setPostLiked.useMutation({
		onSuccess: () => {
			toast.success("Post Liked!")
			window.location.reload()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to like post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	return {
		unlikePost,
		likePost,
	}
}
