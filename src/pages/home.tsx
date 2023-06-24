import { type GetServerSideProps, type NextPage } from "next"
import { Layout } from "~/components/Layout"

import { api } from "~/utils/api"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { ParseZodErrorToString } from "~/utils/helpers"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import { HomeCreatePost } from "~/components/homePage/HomeCreatePost"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const { userId } = getAuth(props.req)

	if (!userId) {
		return {
			redirect: {
				destination: "/signIn",
				permanent: false,
			},
		}
	}

	const user = await clerkClient.users.getUser(userId)

	return {
		props: {
			user: JSON.parse(JSON.stringify(user)) as User,
		},
	}
}

const Home: NextPage<{ user: User }> = ({ user }) => {
	//fetch asap
	const posts = api.posts.getAllByAuthorId.useQuery(user.id)

	const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
		onSuccess: async () => {
			await posts.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	return (
		<Layout>
			<div className="pt-2">
				<HomeCreatePost
					isCreating={isPosting}
					placeholderMessage="What is happening?!"
					profileImageUrl={user.profileImageUrl}
					onCreatePost={(msg: string) => mutate({ content: msg })}
				/>

				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts isUserFollowProfile={null} user={user} userId={user.id} />
			</div>
		</Layout>
	)
}

export default Home
