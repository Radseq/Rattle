import { type FC } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"
import { type SignInUser } from "../profilePage/types"
import { ParseZodErrorToString } from "~/utils/helpers"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { CONFIG } from "~/config"
import { PostFooter } from "./PostFooter"
import { useLikePost } from "~/hooks/useLikePost"

export const FetchPosts: FC<{
	userId: string
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, signInUser }) => {
	const { data, isLoading, refetch } = api.posts.getAllByAuthorId.useQuery(userId)

	const postsLiked = api.posts.getPostsLikedByUser.useQuery(
		data?.map((postAuthor) => {
			return postAuthor.post.id
		})
	)

	const router = useRouter()

	const type = usePostMenuItemsType(isUserFollowProfile, signInUser, userId)

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const handlePostOptionClick = (action: string, postId: string) => {
		switch (action) {
			case "delete":
				deletePost.mutate(postId)
				break

			default:
				break
		}
	}

	const likePostHook = useLikePost()

	if (isLoading) {
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

	return (
		<ul className="">
			{data?.map((postsWithUser) => (
				<PostItem
					key={postsWithUser.post.id}
					postWithUser={postsWithUser}
					onNavigateToPost={() => {
						handleNavigateToPost(postsWithUser.post.id, postsWithUser.author.username)
					}}
					menuItemsType={type}
					onOptionClick={handlePostOptionClick}
					postFooter={
						<PostFooter
							onLike={(action: "like" | "unlike") => {
								if (action === "like") {
									likePostHook.likePost.mutate(postsWithUser.post.id)
								} else {
									likePostHook.unlikePost.mutate(postsWithUser.post.id)
								}
							}}
							isLikedByUser={
								postsLiked.data?.some(
									(postId) => postId == postsWithUser.post.id
								) ?? false
							}
							postWithUser={postsWithUser}
						/>
					}
				/>
			))}
		</ul>
	)
}
