import { useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { Layout } from "~/components/Layout"

import { api } from "~/utils/api"

const Posts: NextPage = () => {
	const { user } = useUser()

	if (!user) {
		return <div>"Please login again"</div>
	}

	const { data } = api.post.getByAuthorId.useQuery(user.id)

	return (
		<Layout>
			<div>
				{data?.map(({ post, author }) => (
					<div key={post.id}>{post.content}</div>
				))}
			</div>
		</Layout>
	)
}

export default Posts
