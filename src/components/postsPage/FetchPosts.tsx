import { FC } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"

export const FetchPosts: FC<{ userId: string }> = ({ userId }) => {
	const { data, isLoading } = api.posts.getAllByAuthorId.useQuery(userId)

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<ul className="pl-2">
			{data?.map((postsWithUser) => (
				<PostItem key={postsWithUser.post.id} postWithUser={postsWithUser} />
			))}
		</ul>
	)
}
