import { getAuth } from "@clerk/nextjs/server"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { PostItem } from "~/components/postsPage/PostItem"
import type { Post, PostWithUser } from "~/components/postsPage/types"
import type { Profile, SignInUser } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById, getPostIdsForwardedByUser } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"
import { CONFIG } from "~/config"
import { useRouter } from "next/router"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
import { LoadingPage } from "~/components/LoadingPage"
import { useEffect, useState } from "react"

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

	const signInUser: SignInUser = {
		userId: userId ? userId : null,
		isSignedIn: !!userId,
	}

	return {
		props: {
			post: { ...post, createdAt: post.createdAt.toString() },
			author,
			signInUser,
			isUserFollowProfile: isUserFollowProfile ? isUserFollowProfile : null,
			postIdsForwardedByUser,
		},
	}
}

// todo signInUser, isUserFollowProfile, postsLikedByUser as one object?

const ReplayPost: NextPage<{
	post: Post
	author: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
	postIdsForwardedByUser: string[]
}> = ({ post, author, signInUser, isUserFollowProfile, postIdsForwardedByUser }) => {
	const [replays, setReplays] = useState<PostWithUser[]>()
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

	const router = useRouter()

	const type = usePostMenuItemsType(isUserFollowProfile, signInUser, author.id)

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
		onSuccess: (postId: string) => {
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
		onSuccess: (postId: string) => {
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
		onSuccess: (postId: string) => {
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
		onSuccess: (postId: string) => {
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
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete forward! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

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
				<PostContent postCreateDate={post.createdAt} message={post.content} />
				<hr className="my-2" />
				<footer className="ml-2">
					<span className="pr-1 font-bold">{post.replaysCount}</span>
					<span className="text-gray-500">
						{`Response${post.replaysCount > 1 ? "s" : ""}`}
					</span>
				</footer>
				<hr className="my-2" />
				{signInUser.isSignedIn && signInUser.userId !== post.authorId && (
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
								isForwardedByUser={replay.post.isForwardedPostBySignInUser}
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
							/>
						))}
					</ul>
				)}
			</div>
		</Layout>
	)
}

export default ReplayPost
