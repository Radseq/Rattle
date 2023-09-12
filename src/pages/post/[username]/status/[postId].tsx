import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { getPostById } from "~/server/api/posts"
import { getPostAuthorByUsername } from "~/server/api/profile"
import { api } from "~/utils/api"
import { CONFIG } from "~/config"
import { useRouter } from "next/router"
import { LoadingPage } from "~/components/LoadingPage"
import { useRef, useState } from "react"
import { PostQuotePopUp } from "~/components/postsPage/PostQuotePopUp"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { PostPoll } from "~/components/postsPage/PostPoll"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PostFooter } from "~/components/postsPage/PostFooter"
import { Icon } from "~/components/Icon"

import type { Post, PostWithAuthor } from "~/components/post/types"
import { type ClickCapture, PostItem } from "~/components/post/PostItem"
import { CreatePostReplyConnector, PostSummary, useGetPostReplies } from "~/features/postReplies"
import { PostContentSelector } from "~/components/post/PostContentSelector"
import { type PostAuthor } from "~/features/profile"
import { getPostProfileType } from "~/utils/helpers"
import { useAuth } from "@clerk/nextjs"
import { Dialog } from "~/components/dialog/Dialog"
import PostMessageRenderer from "~/features/postMessage/components/PostMessageRenderer"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.username as string
	const postId = props.params?.postId as string

	const [viewedPost, author] = await Promise.all([
		getPostById(postId),
		getPostAuthorByUsername(username),
	])

	if (!author || !viewedPost) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	return {
		props: {
			viewedPost,
			author,
		},
	}
}

const PostReplies: NextPage<{
	viewedPost: Post
	author: PostAuthor
}> = ({ viewedPost, author }) => {
	const router = useRouter()

	const user = useAuth()

	const [post, setPost] = useState<Post>(viewedPost)
	const [quotePopUp, setQuotePopUp] = useState<PostWithAuthor | null>(null)
	const [quoteMessage, setQuoteMessage] = useState<string>()

	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, postReplies, refetch } = useGetPostReplies(
		post.id,
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	const quotePost = api.posts.createQuotedPost.useMutation({
		onSuccess: () => {
			toast.success("Add quoted post")
			setPost((post) => {
				return { ...post, quotedCount: post.quotedCount + 1 }
			})
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
			setPost((post) => {
				return { ...post, replyCount: post.replyCount - 1 }
			})
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

	const handleCreateReply = () => {
		setPost((post) => {
			return { ...post, replyCount: post.replyCount + 1 }
		})
		const runner = async () => await refetch()
		runner().catch(() => {
			return
		})
	}

	return (
		<Layout>
			<section className="h-48 flex-col pt-2">
				<article>
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
								<PostMessageRenderer message={post.content} />
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
								<PostMessageRenderer message={post.content} />
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
				</article>

				<CreatePostReplyConnector
					onCreateReply={handleCreateReply}
					profileImageUrl={author.profileImageUrl}
					postId={viewedPost.id}
				/>

				{postReplies && (
					<ul className="">
						{postReplies.map((reply) => (
							<PostItem
								key={reply.post.id}
								postWithUser={reply}
								onClickCapture={(clickCapture) => {
									handlePostClick(clickCapture, reply)
								}}
								menuItemsType={getPostProfileType(
									reply.signInUser?.authorFollowed,
									author.id,
									user.userId
								)}
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
									post={reply.post}
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
			</section>
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
		</Layout>
	)
}

export default PostReplies
