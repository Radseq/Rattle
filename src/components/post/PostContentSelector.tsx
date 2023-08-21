import { type FC } from "react"
import Link from "next/link"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { type Post } from "./types"
import { PostQuoteItem } from "../postsPage/PostQuoteItem"
import { PostPoll } from "../postsPage/PostPoll"

export const PostContentSelector: FC<{
	post: Post
	pollVote: (id: number) => void
}> = ({ post, pollVote }) => {
	const useTime = useTimeLeft(post.createdAt.toString(), post.poll?.endDate)
	if (post.quotedPost) {
		return (
			<div>
				<span>{post.content}</span>
				<Link
					onClick={(e) => e.stopPropagation()}
					href={`/post/${post.quotedPost.author.username}/status/${post.quotedPost.post.id}`}
				>
					<PostQuoteItem
						author={post.quotedPost.author}
						createdAt={post.quotedPost.post.createdAt}
						message={post.quotedPost.post.content}
					/>
				</Link>
			</div>
		)
	} else if (post.poll) {
		return (
			<div>
				{post.content}
				<PostPoll
					pollTimeLeft={useTime}
					poll={post.poll}
					pollEndTime={post.poll.endDate}
					onClickVote={pollVote}
				/>
			</div>
		)
	}
	return <span>{post.content}</span>
}
