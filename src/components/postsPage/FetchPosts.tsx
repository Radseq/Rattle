import { type FC } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"
import { useRouter } from "next/router"
import toast from "react-hot-toast"

export const FetchPosts: FC<{ userId: string }> = ({ userId }) => {
	const { data, isLoading } = api.posts.getAllByAuthorId.useQuery(userId)
	const router = useRouter()
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
				/>
			))}
		</ul>
	)
}
