import { SignIn, useUser } from "@clerk/nextjs"
import { type GetServerSidePropsContext, type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { LoadingPage } from "~/components/LoadingPage"

import { api } from "~/utils/api"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { ParseZodErrorToString } from "~/utils/helpers"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { getAuth } from "@clerk/nextjs/server"

export const getServerSideProps = (props: GetServerSidePropsContext) => {
	const { userId } = getAuth(props.req)

	if (!userId) {
		return {
			redirect: {
				destination: "/signIn",
				permanent: false,
			},
		}
	}

	return {
		props: {
			userId,
		},
	}
}

const Home: NextPage<{ userId: string }> = ({ userId }) => {
	const { user, isLoaded, isSignedIn } = useUser()

	//fetch asap
	const posts = api.posts.getAllByAuthorId.useQuery(userId)

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

	if (!isLoaded || !user) {
		return <LoadingPage />
	}

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
