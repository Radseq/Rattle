import { clerkClient, getAuth } from "@clerk/nextjs/server"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { isFollowed } from "~/server/api/follow"
import { getPostById } from "~/server/api/posts"
import { getPostIdsForwardedByUser, getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { CONFIG } from "~/config"
import { useRouter } from "next/router"
import { getPostMenuItemsType } from "~/hooks/getPostMenuItemsType"
import { LoadingPage } from "~/components/LoadingPage"
import { useRef, useState } from "react"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { type User } from "@clerk/nextjs/dist/api"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { PostPoll } from "~/components/postsPage/PostPoll"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { Icon } from "~/components/Icon"

import type { Post, PostWithAuthor } from "~/components/post/types"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { CreatePostReply, PostSummary, useGetPostReplies } from "~/features/postReplies"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type Profile } from "~/features/profile"

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

	const isUserFollowProfile = userId ? await isFollowed(userId, author.id) : false
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
const PostReplies: NextPage<{
	post: Post
	author: Profile
	user: User | undefined
	isUserFollowProfile: boolean | null
}> = ({ post, author, user, isUserFollowProfile }) => {
	const router = useRouter()
	const type = getPostMenuItemsType(isUserFollowProfile, user?.id, author.id)

	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()

	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, postReplies, refetch } = useGetPostReplies(
		post.id,
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	const { mutate, isLoading: isPosting } = api.posts.createReplyPost.useMutation({
		onSuccess: async () => {
			toast.success("Add replay")
			await refetch()
		},
		onError: () => {
			toast.error("Failed to add reply! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: () => {
			toast.success("Add quoted post")
		},
		onError: () => {
			toast.error("Failed to quote post! Please try again later", {
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
			toast.error("Failed to remove forwarded post! Please try again later", {
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

	const useTime = useTimeLeft(post.createdAt, post.poll?.endDate)

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
				break
		}
	}

	const openDialog = quotePopUp != null && user != null

	return (
		<Layout>
			<div className="h-48 flex-col pt-2">
				<ProfileSimple
					fullName={author.fullName}
					profileImageUrl={author.profileImageUrl}
					username={author.username}
				>
					<div className="flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
						<Icon iconKind="optionDots" />
					</div>
				</ProfileSimple>
				<div className="mt-2 ml-2">
					{post.poll ? (
						<div>
							<span className="">{post.content}</span>
							<PostPoll
								pollTimeLeft={useTime}
								poll={post.poll}
								pollEndTime={post.poll.endDate}
								onClickVote={(choiceId) =>
									pollVote.mutate({ postId: post.id, choiceId })
								}
							/>
						</div>
					) : (
						<div>
							<span>{post.content}</span>
							<PostSummary postCreateDate={post.createdAt} />
						</div>
					)}
				</div>
				<hr className="my-2" />
				<footer className="ml-2">
					<span className="pr-1 font-bold">{post.replyCount}</span>
					<span className="text-gray-500">
						{`Response${post.replyCount > 1 ? "s" : ""}`}
					</span>
					<span className="p-2 font-bold">{post.quotedCount}</span>
					<span className="text-gray-500">
						{`Quote${post.quotedCount > 1 ? "s" : ""}`}
					</span>
				</footer>
				<hr className="my-2" />

				<div>
					<CreatePostReply
						isCreating={isPosting}
						onCreatePost={(respondMessage) =>
							mutate({ content: respondMessage, replyPostId: post.id })
						}
						placeholderMessage="Reply & Hit Enter!"
						profileImageUrl={author.profileImageUrl}
					/>
					<hr className="my-2" />
				</div>

				{postReplies && (
					<ul className="">
						{postReplies.map((reply) => (
							<PostItem
								key={reply.post.id}
								postWithUser={reply}
								onClickCapture={(clickCapture) => {
									handlePostClick(clickCapture, reply)
								}}
								menuItemsType={type}
								footer={
									<PostFooter
										isForwarded={reply.signInUser?.isForwarded ?? false}
										onForwardClick={() => {
											if (reply.signInUser?.isForwarded ?? false) {
												removePostForward.mutate(reply.post.id)
											} else {
												forwardPost.mutate(reply.post.id)
											}
										}}
										onLikeClick={() => {
											if (reply.signInUser?.isLiked ?? false) {
												unlikePost.mutate(reply.post.id)
											} else {
												likePost.mutate(reply.post.id)
											}
										}}
										onQuoteClick={() => {
											setQuotePopUp(reply)
										}}
										sharedCount={
											reply.post.quotedCount + reply.post.forwardsCount
										}
										isLiked={reply.signInUser?.isLiked ?? false}
										likeCount={reply.post.likeCount}
										username={reply.author.username}
										replyCount={reply.post.replyCount}
										postId={reply.post.id}
									/>
								}
							>
								<PostContentSelector
									postWithAuthor={reply}
									pollVote={(choiceId) =>
										pollVote.mutate({
											postId: reply.post.id,
											choiceId,
										})
									}
								/>
							</PostItem>
						))}
					</ul>
				)}
			</div>
			<dialog open={openDialog}>
				{quotePopUp && user && (
					<PostQuotePopUp
						onCloseModal={() => setQuotePopUp(null)}
						onPostQuote={() => {
							quotePost.mutate({
								content: quoteMessage ?? "",
								quotedPostId: quotePopUp.post.id,
							})
						}}
						onMessageChange={(message) => setQuoteMessage(message)}
						author={quotePopUp.author}
						createdAt={quotePopUp.post.createdAt}
						message={quotePopUp.post.content}
					/>
				)}
			</dialog>
		</Layout>
	)
}

export default PostReplies
