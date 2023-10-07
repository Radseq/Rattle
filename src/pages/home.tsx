import { type GetServerSideProps, type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import { useState } from "react"
import { type UserToFollow, WhoToFollow } from "~/features/whoToFollow"
import { whoToFollow } from "~/server/features/whoToFollow"
import { type PostWithAuthor } from "~/components/post/types"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { ConnectorCreatePost } from "~/features/homePage"
import { FetchPosts } from "~/features/homePage/components/FetchPosts"
import { Dialog } from "~/components/dialog/Dialog"
import { Trends } from "~/features/trends"

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
	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()
	const [refetch, setRefetch] = useState(false)

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

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: () => {
			setQuotePopUp(null)
			setRefetch(true)
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<Layout
			rightPanel={
				<div>
					<WhoToFollow
						users={usersToFollow}
						onFollowClick={(id) => addUserToFollow.mutate(id)}
					>
						<h1 className="p-2 text-2xl font-semibold">Who to follow</h1>
					</WhoToFollow>
					<Trends />
				</div>
			}
		>
			<section className="pt-2">
				<ConnectorCreatePost
					profileImageUrl={user.profileImageUrl}
					refetch={() => setRefetch(true)}
				/>
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts
					postQuote={(post) => setQuotePopUp(post)}
					signInUserId={user.id}
					forceRefetch={refetch}
					refetchComplete={() => {
						setRefetch(false)
					}}
				/>
				{quotePopUp && user && (
					<Dialog
						open={quotePopUp != null && user != null}
						onClose={() => setQuotePopUp(null)}
					>
						<PostQuotePopUp
							author={quotePopUp.author}
							createdAt={quotePopUp.post.createdAt}
							message={quotePopUp.post.content}
							onCloseModal={() => setQuotePopUp(null)}
							onPostQuote={() => {
								quotePost.mutate({
									content: quoteMessage ?? "",
									quotedPostId: quotePopUp.post.id,
								})
							}}
							onMessageChange={(message) => setQuoteMessage(message)}
						/>
					</Dialog>
				)}
			</section>
		</Layout>
	)
}

export default Home
