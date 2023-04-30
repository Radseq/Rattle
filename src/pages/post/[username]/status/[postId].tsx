import { getAuth } from "@clerk/nextjs/server"
import type { Post } from "@prisma/client"
import type { GetServerSideProps, NextPage } from "next"
import toast from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import { CreatePost } from "~/components/postsPage/CreatePost"
import type { PostWithUser } from "~/components/postsPage/types"
import type { Profile, SignInUser } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById, getPostReplas } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"
import { api } from "~/utils/api"
import { ParseZodErrorToString } from "~/utils/helpers"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.username as string
	const postId = props.params?.postId as string

	console.log("props.params: ", props.params)
	console.log("username: ", username, " postId: ", postId)

	const getPost = await getPostById(postId)

	const getProfile = await getProfileByUserName(username)

	const getPostReplays = await getPostReplas(postId)

	const [post, author, postReplays] = await Promise.all([getPost, getProfile, getPostReplays])

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
			postReplays,
		},
	}
}

const ReplayPost: NextPage<{
	post: Post
	author: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | null
	postReplays: PostWithUser[]
}> = ({ post, author, signInUser, isUserFollowProfile, postReplays }) => {
	const { mutate, isLoading: isPosting } = api.posts.createReplayPost.useMutation({
		onSuccess: async () => {
			window.location.reload()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: 10000 })
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
				<PostContent postCreateDate={post.createdAt.toString()} message={post.content} />
				<hr className="my-2" />
				{signInUser.isSignedIn && signInUser.userId !== post.authorId && (
					<CreatePost
						isCreating={isPosting}
						onCreatePost={(respondMessage) =>
							mutate({ content: respondMessage, replayPostId: post.id })
						}
						placeholderMessage="Replay & Hit Enter!"
						profileImageUrl={author.profileImageUrl}
					/>
				)}
			</div>
		</Layout>
	)
}

export default ReplayPost
