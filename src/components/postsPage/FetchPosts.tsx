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

export const FetchPosts: FC<{
	userId: string
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, signInUser }) => {
	const posts = api.posts.getAllByAuthorId.useQuery(userId)

	const postsLikedByUser = api.posts.getPostsLikedByUser.useQuery(
		posts.data?.map((postAuthor) => {
			return postAuthor.post.id
		})
	)

	const router = useRouter()

	const type = usePostMenuItemsType(isUserFollowProfile, signInUser, userId)

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await posts.refetch()
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

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	if (posts.isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<ul className="">
			{posts.data?.map((postsWithUser) => (
				<PostItem
					key={postsWithUser.post.id}
					postWithUser={postsWithUser}
					onNavigateToPost={() => {
						handleNavigateToPost(postsWithUser.post.id, postsWithUser.author.username)
					}}
					menuItemsType={type}
					onOptionClick={handlePostOptionClick}
					postLiked={
						postsLikedByUser.data
							? postsLikedByUser.data.some(
									(postId) => postId === postsWithUser.post.id
							  )
							: false
					}
				/>
			))}
		</ul>
	)
}
