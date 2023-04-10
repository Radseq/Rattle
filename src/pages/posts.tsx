import { SignInButton, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { LoadingPage } from "~/components/LoadingPage"

import { api } from "~/utils/api"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { FetchPosts } from "~/components/postsPage/FetchPosts"

const Posts: NextPage = () => {
	const { user, isLoaded } = useUser()

	if (!user) {
		// todo temp solution
		return (
			<div>
				Please login again
				<span className="m-2 bg-red-700 p-2">
					<SignInButton />
				</span>
			</div>
		)
	}

	//fetch asap
	api.posts.getAllByAuthorId.useQuery(user.id)

	if (!isLoaded) {
		return <LoadingPage />
	}

	return (
		<Layout>
			<div className="pt-2">
				<CreatePost />
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts userId={user.id} />
			</div>
		</Layout>
	)
}

export default Posts
