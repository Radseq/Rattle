import { type GetServerSideProps, type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import { useRef, useState } from "react"
import { type UserToFollow, WhoToFollow } from "~/features/whoToFollow"
import { whoToFollow } from "~/server/features/whoToFollow"
import { type PostWithAuthor } from "~/components/post/types"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { LoadingPage } from "~/components/LoadingPage"
import { useGetHomePosts } from "~/features/homePage/hooks"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { useRouter } from "next/router"
import { ConnectorCreatePost } from "~/features/homePage"
import { getPostProfileType } from "~/utils/helpers"

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
	const router = useRouter()

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()

	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, posts, refetch } = useGetHomePosts(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

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

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to delete post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			setQuotePopUp(null)
			await refetch()
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const likePost = api.profile.setPostLiked.useMutation({
		onSuccess: async () => {
			toast.success("Post Liked!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to like post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const unlikePost = api.profile.setPostUnliked.useMutation({
		onSuccess: async () => {
			toast.success("Post Unliked!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to unlike post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const forwardPost = api.posts.forwardPost.useMutation({
		onSuccess: async () => {
			toast.success("Post Forwarded!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to forward post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const removePostForward = api.posts.removePostForward.useMutation({
		onSuccess: async () => {
			toast.success("Delete Post Forward!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to delete forward! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const pollVote = api.profile.votePostPoll.useMutation({
		onSuccess: async () => {
			toast.success("Voted!")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to vote! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	const handlePostClick = (clickCapture: ClickCapture, postsWithUser: PostWithAuthor) => {
		const { post } = postsWithUser

		switch (clickCapture.action) {
			case "navigation":
				handleNavigateToPost(post.id, postsWithUser.author.username)
				break
			case "deletePost":
				deletePost.mutate(post.id)
				break
			default:
				toast.error("Error while post click", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				break
		}
	}

	const openDialog = quotePopUp != null && user != null

	return (
		<Layout
			rightPanel={
				<WhoToFollow
					users={usersToFollow}
					onFollowClick={(id) => addUserToFollow.mutate(id)}
				>
					<h1 className="p-2 text-2xl font-semibold">Who to follow</h1>
				</WhoToFollow>
			}
		>
			<div className="pt-2">
				<ConnectorCreatePost
					profileImageUrl={user.profileImageUrl}
					refetch={() =>
						void (async () => {
							await refetch()
						})
					}
				/>
				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<div>
					<ul ref={ulRef}>
						{posts?.map(({ author, post, signInUser }) => (
							<PostItem
								key={post.id}
								postWithUser={{ author, post, signInUser }}
								onClickCapture={(clickCapture) => {
									handlePostClick(clickCapture, { author, post, signInUser })
								}}
								menuItemsType={getPostProfileType(
									signInUser?.authorFollowed ?? false,
									user.id,
									author.id
								)}
								footer={
									<PostFooter
										isForwarded={signInUser?.isForwarded ?? false}
										onForwardClick={() => {
											if (signInUser?.isForwarded ?? false) {
												removePostForward.mutate(post.id)
											} else {
												forwardPost.mutate(post.id)
											}
										}}
										onLikeClick={() => {
											if (signInUser?.isLiked ?? false) {
												unlikePost.mutate(post.id)
											} else {
												likePost.mutate(post.id)
											}
										}}
										onQuoteClick={() => {
											setQuotePopUp({ author, post, signInUser })
										}}
										sharedCount={post.quotedCount + post.forwardsCount}
										isLiked={signInUser?.isLiked ?? false}
										likeCount={post.likeCount}
										username={author.username}
										replyCount={post.replyCount}
										postId={post.id}
									/>
								}
							>
								<PostContentSelector
									post={post}
									pollVote={(choiceId) =>
										pollVote.mutate({
											postId: post.id,
											choiceId,
										})
									}
								/>
							</PostItem>
						))}
					</ul>
					<dialog open={openDialog}>
						{quotePopUp && user && (
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
						)}
					</dialog>
				</div>
			</div>
		</Layout>
	)
}

export default Home
