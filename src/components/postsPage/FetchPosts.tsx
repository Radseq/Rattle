import { type FC } from "react"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { PostItem } from "./PostItem"
import { useUser } from "@clerk/nextjs"
import { usePostOptionMenuType } from "~/hooks/usePostOptionMenuType"
import { type SignInUser } from "../profilePage/types"

export const FetchPosts: FC<{
	userId: string
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ userId, isUserFollowProfile, signInUser }) => {
	const { data, isLoading, refetch } = api.posts.getAllByAuthorId.useQuery(userId)

	const { user } = useUser()

	const type = usePostOptionMenuType(isUserFollowProfile, signInUser, userId === user?.id)

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
					menuType={type}
					refetchPosts={refetch}
				/>
			))}
		</ul>
	)
}
