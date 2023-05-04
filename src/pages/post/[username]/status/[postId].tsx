import { getAuth } from "@clerk/nextjs/server"
import type { Post } from "@prisma/client"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import { CreatePost } from "~/components/postsPage/CreatePost"
import { PostItem } from "~/components/postsPage/PostItem"
import type { PostWithUser } from "~/components/postsPage/types"
import type { Profile, SignInUser } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById, getPostReplays } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"
import { CONFIG } from "~/config"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.username as string
	const postId = props.params?.postId as string

	const [post, author, postReplays] = await Promise.all([
		getPostById(postId),
		getProfileByUserName(username),
		getPostReplays(postId),
	])

	if (!author || !post) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	const { user, userId } = getAuth(props.req)

	const isUserFollowProfile = user ? await isFolloweed(user.id, author.id) : false

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
			postWithAutorsReplays: postReplays.replays,
			replaysCount: postReplays.replaysCount,
		},
	}
}

const ReplayPost: NextPage<{
	post: Post
	author: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
	postWithAutorsReplays: PostWithUser[]
	replaysCount: number
}> = ({ post, author, signInUser, isUserFollowProfile, postWithAutorsReplays, replaysCount }) => {
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
					<span className="pr-1 font-bold">{replaysCount}</span>
					<span className="text-gray-500">
						{`Response${replaysCount > 1 ? "s" : ""}`}
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
				{postWithAutorsReplays && postWithAutorsReplays.length > 0 && (
					<ul className="">
						{postWithAutorsReplays?.map((postWithAutorsReplays) => (
							<PostItem
								key={postWithAutorsReplays.post.id}
								postWithUser={postWithAutorsReplays}
							/>
						))}
					</ul>
				)}
			</div>
		</Layout>
	)
}

export default ReplayPost
