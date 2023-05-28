import { getAuth } from "@clerk/nextjs/server"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { PostItem } from "~/components/postsPage/PostItem"
import type { Post } from "~/components/postsPage/types"
import type { Profile, SignInUser } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"
import { CONFIG } from "~/config"
import { useRouter } from "next/router"
import { usePostMenuItemsType } from "~/hooks/usePostMenuItemsType"
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
		},
	}
}

// todo signInUser, isUserFollowProfile, postsLikedByUser as one object?

const ReplayPost: NextPage<{
	post: Post
	author: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
}> = ({ post, author, signInUser, isUserFollowProfile }) => {
	const { mutate, isLoading: isPosting } = api.posts.createReplayPost.useMutation({
		onSuccess: () => {
			window.location.reload()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const postReplays = api.posts.getPostReplays.useQuery(post.id)

	const postsLikedByUser = api.posts.getPostsLikedByUser.useQuery(
		postReplays.data?.map((postAuthor) => {
			return postAuthor.post.id
		})
	)

	const router = useRouter()

	const type = usePostMenuItemsType(isUserFollowProfile, signInUser, author.id)

	const handleNavigateToPost = (postId: string, authorUsername: string) => {
		// preventing navigate when user selecting text e.g post content text
		if (!window.getSelection()?.toString()) {
			router
				.push(`/post/${authorUsername}/status/${postId}`)
				.catch(() => toast.error("Error while navigation to post"))
		}
	}

	const deletePost = api.posts.deletePost.useMutation({
		onSuccess: () => {
			toast.success("Post Deleted!")
			window.location.reload()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to delete post! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

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
				{postReplays.data && postReplays.data.length > 0 && (
					<ul className="">
						{postReplays.data.map((replay) => (
							<PostItem
								key={replay.post.id}
								postWithUser={replay}
								onNavigateToPost={() => {
									handleNavigateToPost(replay.post.id, author.username)
								}}
								menuItemsType={type}
								onOptionClick={handlePostOptionClick}
								postLiked={
									postsLikedByUser.data
										? postsLikedByUser.data.some(
												(postId) => postId === replay.post.id
										  )
										: false
								}
							/>
						))}
					</ul>
				)}
			</div>
		</Layout>
	)
}

export default ReplayPost
