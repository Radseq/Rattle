import { type GetServerSideProps, type NextPage } from "next"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { clerkClient, getAuth, type User } from "@clerk/nextjs/server"
import { type UserToFollow, WhoToFollow } from "~/features/whoToFollow"
import { whoToFollow } from "~/server/features/whoToFollow"
import { CreatePost, CreatePostProvider } from "~/features/homePage"
import { FetchPosts } from "~/features/homePage/components/FetchPosts"
import { Layout } from "~/features/layout"

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

	const usersToFollow = (await whoToFollow(userId)) as UserToFollow[]

	return {
		props: {
			user: JSON.parse(JSON.stringify(user)) as User,
			usersToFollow,
		},
	}
}

const Home: NextPage<{ user: User; usersToFollow: UserToFollow[] }> = ({ user, usersToFollow }) => {
	const addUserToFollow = api.follow.addUserToFollow.useMutation({
		onSuccess: (result) => {
			toast.success(`${result.addedUserName} is now followed`)
		},
		onError: () => {
			toast.error("Failed to follow! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<CreatePostProvider>
			<Layout
				rightPanel={
					<WhoToFollow
						users={usersToFollow}
						onFollowClick={(id) => addUserToFollow.mutate(id)}
					>
						<h1 className="px-2 pb-2 text-2xl font-semibold">Who to follow</h1>
					</WhoToFollow>
				}
			>
				<section className="pt-2">
					<CreatePost profileImageUrl={user.imageUrl} />
					<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
					<FetchPosts signInUserId={user.id} />
				</section>
			</Layout>
		</CreatePostProvider>
	)
}

export default Home
