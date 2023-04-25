import { type FC } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"
import { type SignInUser } from "../profilePage/types"
import toast from "react-hot-toast"
import { ParseZodErrorToString } from "~/utils/helpers"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"

export const FetchPosts: FC<{
	userId: string
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, signInUser }) => {
	const { data, isLoading, refetch } = api.posts.getAllByAuthorId.useQuery(userId)

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
			toast.error(error, { duration: 10000 })
		},
	})

	const handlePostOptionClick = (type: string, postId: string) => {
		switch (type) {
			case "delete":
				deletePost.mutate(postId)
				break

			default:
				break
		}
	}

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<ul className="">
			{data?.map((postsWithUser) => (
				<PostItem
					key={postsWithUser.post.id}
					postWithUser={postsWithUser}
					menuItemsType={type}
					onOptionClick={handlePostOptionClick}
				/>
			))}
		</ul>
	)
}
