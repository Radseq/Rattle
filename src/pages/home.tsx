import { SignIn, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { LoadingPage } from "~/components/LoadingPage"

import { api } from "~/utils/api"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { FetchPosts } from "~/components/postsPage/FetchPosts"

const Home: NextPage = () => {
	const { user, isLoaded, isSignedIn } = useUser()

	if (!user) {
		return (
			<div>
				<SignIn
					appearance={{
						elements: {
							rootBox: "mx-auto",
						},
					}}
					redirectUrl={"/home"}
				/>
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
				<FetchPosts
					isUserFollowProfile={null}
					signInUser={{ isSignedIn, userId: user.id }}
					userId={user.id}
				/>
			</div>
		</Layout>
	)
}

export default Home
