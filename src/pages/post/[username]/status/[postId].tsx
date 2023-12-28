import type { GetServerSideProps, NextPage } from "next"
import { getPostById } from "~/server/api/posts"
import { getPostAuthorByUsername } from "~/server/api/profile"
import { useRef, useState } from "react"

import type { Poll, Post, UserPollVotes } from "~/features/postItem"
import {
	CreatePostReplyConnector,
	FetchPosts,
	OriginalPost,
	type RefetchPostHandle,
} from "~/features/postReplies"
import { type PostAuthor } from "~/features/profile"
import { Layout } from "~/features/layout"

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
	const [post, setPost] = useState<Post>(viewedPost)

	const fetchPostsRef = useRef<RefetchPostHandle>(null)

	const handleDeleteReply = () => {
		setPost((post) => {
			return { ...post, replyCount: post.replyCount + 1 }
		})
		fetchPostsRef.current?.Refetch()
	}

	const handlePostVote = (choiceId: number | null, oldChoiceId: number | null) => {
		if (!post.poll) {
			return
		}

		const userVotesCopy: UserPollVotes[] = post.poll.userVotes.map((userVotes) => {
			if (choiceId && choiceId === userVotes.id) {
				return { ...userVotes, voteCount: userVotes.voteCount + 1 }
			}
			if (oldChoiceId && oldChoiceId === userVotes.id) {
				return { ...userVotes, voteCount: userVotes.voteCount - 1 }
			}
			return { ...userVotes }
		})

		const pollCopy: Poll = {
			...post.poll,
			choiceVotedBySignInUser: post.poll.choiceVotedBySignInUser,
			endDate: post.poll.endDate,
			userVotes: userVotesCopy,
		}
		setPost((post) => {
			return { ...post, poll: pollCopy }
		})
	}

	return (
		<Layout>
			<section className="h-48 flex-col pt-2">
				<OriginalPost author={author} post={post} onOriginalPostVote={handlePostVote} />
				<CreatePostReplyConnector
					onCreateReply={handleDeleteReply}
					profileImageUrl={author.profileImageUrl}
					postId={viewedPost.id}
				/>
				<FetchPosts
					ref={fetchPostsRef}
					authorId={author.id}
					onDeleteReply={() =>
						setPost((post) => {
							return { ...post, replyCount: post.replyCount - 1 }
						})
					}
					postId={post.id}
				/>
			</section>
		</Layout>
	)
}

export default PostReplies
