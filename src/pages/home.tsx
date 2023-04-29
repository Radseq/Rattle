import { SignIn, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { LoadingPage } from "~/components/LoadingPage"

import { api } from "~/utils/api"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { ParseZodErrorToString } from "~/utils/helpers"
import toast from "react-hot-toast"

const Home: NextPage = () => {
	const { user, isLoaded } = useUser()

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
	const posts = api.posts.getAllByAuthorId.useQuery(user.id)

	if (!isLoaded) {
		return <LoadingPage />
	}

	const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
		onSuccess: async () => {
			posts.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: 10000 })
		},
	})

	return (
		<Layout>
			<div className="pt-2">
				<CreatePost
					onCreatePost={(message) => {
						mutate({ content: message })
					}}
					profileImageUrl={user.profileImageUrl}
					isCreating={isPosting}
					placeholderMessage="Write your message & hit enter"
				/>
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts userId={user.id} />
			</div>
		</Layout>
	)
}

export default Home
