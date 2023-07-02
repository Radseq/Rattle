import { clerkClient, getAuth } from "@clerk/nextjs/server"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { PostItem } from "~/components/postsPage/PostItem"
import type { Post, PostWithAuthor } from "~/components/postsPage/types"
import type { Profile } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById, getPostIdsForwardedByUser } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { canOpenPostQuoteDialog, ParseZodErrorToString } from "~/utils/helpers"
import { CONFIG } from "~/config"
import { useRouter } from "next/router"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { LoadingPage } from "~/components/LoadingPage"
import { useEffect, useState } from "react"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { type User } from "@clerk/nextjs/dist/api"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { PostPoll } from "~/components/postsPage/PostPoll"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.username as string
	const postId = props.params?.postId as string

	const { userId } = getAuth(props.req)

	const [post, author] = await Promise.all([getPostById(postId), getProfileByUserName(username)])

	if (!author || !post) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	const isUserFollowProfile = userId ? await isFolloweed(userId, author.id) : false
	const postIdsForwardedByUser = userId ? await getPostIdsForwardedByUser(userId) : []

	const user = userId ? await clerkClient.users.getUser(userId) : undefined

	return {
		props: {
			post,
			author,
			user: JSON.parse(JSON.stringify(user)) as User,
			isUserFollowProfile: isUserFollowProfile ? isUserFollowProfile : null,
			postIdsForwardedByUser,
		},
	}
}

// todo signInUser, isUserFollowProfile, postsLikedByUser as one object?
const ReplayPost: NextPage<{
	post: Post
	author: Profile
	user: User | undefined
	isUserFollowProfile: boolean | null
	postIdsForwardedByUser: string[]
}> = ({ post, author, user, isUserFollowProfile, postIdsForwardedByUser }) => {
	const router = useRouter()
	const type = usePostMenuItemsType(isUserFollowProfile, user, author.id)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()
	const [replays, setReplays] = useState<PostWithAuthor[]>()

	const postReplays = api.posts.getPostReplays.useQuery(post.id)

	useEffect(() => {
		if (postReplays.data) {
			const replays = postReplays.data.map((post) => {
				post.post.isForwardedPostBySignInUser = postIdsForwardedByUser.some(
					(postId) => postId === post.post.id
				)
				return post
			})
			setReplays(replays)
		}
	}, [postReplays.data, postIdsForwardedByUser])

	const { mutate, isLoading: isPosting } = api.posts.createReplayPost.useMutation({
		onSuccess: async () => {
			await postReplays.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to create replay! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: async () => {
			setQuotePopUp(null)
			await postReplays.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to create replay! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted!")
			await postReplays.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const likePost = api.posts.setPostLiked.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Liked!")
			if (replays) {
				const copyReplays = replays.map((replay) => {
					if (replay.post.id === postId) {
						replay.post.likeCount += 1
						replay.post.isLikedBySignInUser = true
					}
					return replay
				})
				setReplays(copyReplays)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to like post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const unlikePost = api.posts.setPostUnliked.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Unliked!")
			if (replays) {
				const copyReplays = replays.map((replay) => {
					if (replay.post.id === postId) {
						replay.post.likeCount -= 1
						replay.post.isLikedBySignInUser = false
					}
					return replay
				})
				setReplays(copyReplays)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to unlike post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const forwardPost = api.posts.forwardPost.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Post Forwarded!")
			if (replays) {
				const copyReplays = replays.map((replay) => {
					if (replay.post.id === postId) {
						replay.post.forwardsCount += 1
						replay.post.isForwardedPostBySignInUser = true
					}
					return replay
				})
				setReplays(copyReplays)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to forward post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const removePostForward = api.posts.removePostForward.useMutation({
		onSuccess: (_, postId) => {
			toast.success("Delete Post Forward!")
			if (replays) {
				const copyReplays = replays.map((replay) => {
					if (replay.post.id === postId) {
						replay.post.forwardsCount -= 1
						replay.post.isForwardedPostBySignInUser = false
					}
					return replay
				})
				setReplays(copyReplays)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ?? "Failed to vote! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const pollVote = api.profile.votePostPoll.useMutation({
		onSuccess: (_, { postId, choiceId }) => {
			toast.success("Voted!")
			if (replays) {
				const copyReplays = replays.map((replay) => {
					if (replay.post.id === postId && replay.post.poll) {
						replay.post.poll = {
							...replay.post.poll,
							choiceVotedBySignInUser: choiceId,
						}
					}
					return replay
				})
				setReplays(copyReplays)
			}
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ?? "Failed to vote! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const useTime = useTimeLeft(post.createdAt, post.poll?.endDate)

	if (postReplays.isLoading) {
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

	const handlePostOptionClick = (action: string, postId: string) => {
		switch (action) {
			case "delete":
				deletePost.mutate(postId)
				break

			default:
				break
		}
	}

	return (
		<Layout>
			<div className="h-48 flex-col pt-2">
				<ProfileSimple
					fullName={author.fullName}
					profileImageUrl={author.profileImageUrl}
					username={author.username}
				/>
				<div className="mt-2 ml-2">
					{post.poll ? (
						<div>
							<span className="">{post.content}</span>
							<PostPoll
								pollTimeLeft={useTime}
								poll={post.poll}
								pollEndTime={post.poll.endDate}
								onClickVote={(id) =>
									pollVote.mutate({ postId: post.id, choiceId: id })
								}
							/>
						</div>
					) : (
						<PostContent postCreateDate={post.createdAt} message={post.content} />
					)}
				</div>
				<hr className="my-2" />
				<footer className="ml-2">
					<span className="pr-1 font-bold">{post.replaysCount}</span>
					<span className="text-gray-500">
						{`Response${post.replaysCount > 1 ? "s" : ""}`}
					</span>
					<span className="p-2 font-bold">{post.quotedCount}</span>
					<span className="text-gray-500">
						{`Quote${post.quotedCount > 1 ? "s" : ""}`}
					</span>
				</footer>
				<hr className="my-2" />
				{user?.id !== post.authorId && (
					<div>
						<CreatePost
							isCreating={isPosting}
							onCreatePost={(respondMessage) =>
								mutate({ content: respondMessage, replayPostId: post.id })
							}
							placeholderMessage="Replay & Hit Enter!"
							profileImageUrl={author.profileImageUrl}
						/>
						<hr className="my-2" />
					</div>
				)}
				{replays && replays.length > 0 && (
					<ul className="">
						{replays.map((replay) => (
							<PostItem
								key={replay.post.id}
								postWithUser={replay}
								onNavigateToPost={() => {
									handleNavigateToPost(replay.post.id, author.username)
								}}
								menuItemsType={type}
								onOptionClick={handlePostOptionClick}
								forwardAction={(forward, postId) => {
									if (forward === "deleteForward") {
										removePostForward.mutate(postId)
									} else {
										forwardPost.mutate(postId)
									}
								}}
								likeAction={(action, postId) => {
									if (action === "like") {
										likePost.mutate(postId)
									} else {
										unlikePost.mutate(postId)
									}
								}}
								onQuoteClick={() => setQuotePopUp(replay)}
								onVotePoll={(postId, choiceId) =>
									pollVote.mutate({ postId, choiceId })
								}
							/>
						))}
					</ul>
				)}
			</div>
			<dialog open={canOpenPostQuoteDialog(quotePopUp, user)}>
				{quotePopUp && user && (
					<PostQuotePopUp
						profileImageUrl={user.profileImageUrl}
						onCloseModal={() => setQuotePopUp(null)}
						post={quotePopUp}
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
		</Layout>
	)
}

export default ReplayPost
