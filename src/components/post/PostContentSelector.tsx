import { type FC } from "react"
import Link from "next/link"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { type PostWithAuthor } from "./types"
import { PostQuoteItem } from "../postsPage/PostQuoteItem"
import { PostPoll } from "../postsPage/PostPoll"

export const PostContentSelector: FC<{
	postWithAuthor: PostWithAuthor
	pollVote: (id: number) => void
}> = ({ postWithAuthor, pollVote }) => {
	const { post, author } = postWithAuthor
	const useTime = useTimeLeft(post.createdAt, post.poll?.endDate)
	if (post.quotedPost) {
		return (
			<div>
				<span>{post.content}</span>
				<Link
					onClick={(e) => e.stopPropagation()}
					href={`/post/${post.quotedPost.author.username}/status/${post.quotedPost.post.id}`}
				>
					<PostQuoteItem
						author={author}
						createdAt={post.createdAt}
						message={post.content}
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
