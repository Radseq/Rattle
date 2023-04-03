import { useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { PostItem } from "~/components/postsPage/PostItem"

import { api, RouterOutputs } from "~/utils/api"

const Posts: NextPage = () => {
	const { user } = useUser()

	if (!user) {
		return <div>"Please login again"</div>
	}

	const { data } = api.posts.getAllByAuthorId.useQuery(user.id)

	return (
		<Layout>
			<div className="pt-2">
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<ul className="pl-2">
					{data?.map((postsWithUser) => (
						<PostItem postWithUser={postsWithUser} />
					))}
				</ul>
			</div>
		</Layout>
	)
}

export default Posts
