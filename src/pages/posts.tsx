import { useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { type FC } from "react"
import { Layout } from "~/components/Layout"
import { LoadingPage } from "~/components/LoadingPage"
import { PostItem } from "~/components/postsPage/PostItem"

import { api } from "~/utils/api"

const FetchPosts: FC<{ userId: string }> = ({ userId }) => {
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

const Posts: NextPage = () => {
	const { user, isLoaded } = useUser()

	if (!user) {
		return <div>Please login again</div>
	}

	//fetch asap
	api.posts.getAllByAuthorId.useQuery(user.id)

	if (!isLoaded) {
		return <LoadingPage />
	}

	return (
		<Layout>
			<div className="pt-2">
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts userId={user.id} />
			</div>
		</Layout>
	)
}

export default Posts
