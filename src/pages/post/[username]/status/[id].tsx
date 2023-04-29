import { getAuth } from "@clerk/nextjs/server"
import type { Post } from "@prisma/client"
import type { GetServerSideProps, NextPage } from "next"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"
import type { PostWithUser } from "~/components/postsPage/types"
import type { Profile, SignInUser } from "~/components/profilePage/types"
import { isFolloweed } from "~/server/api/follow"
import { getPostById, getPostReplas } from "~/server/api/posts"
import { getProfileByUserName } from "~/server/api/profile"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.profile as string
	const postId = props.params?.postId as string

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
			post,
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
			</div>
		</Layout>
	)
}

export default ReplayPost
