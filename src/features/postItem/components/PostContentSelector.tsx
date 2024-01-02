import { type FC } from "react"
import Link from "next/link"
import { useTimeLeft } from "~/hooks/useTimeLeft"
import { PostPoll } from "./PostPoll"
import PostMessageRenderer from "~/features/postMessage/components/PostMessageRenderer"
import { type Post } from "../types"
import { PostQuoteItem } from "~/features/postQuote"

export const PostContentSelector: FC<{
	post: Post
	pollVote: (id: number) => void
}> = ({ post, pollVote }) => {
	const useTime = useTimeLeft(post.createdAt.toString(), post.poll?.endDate)
	if (post.quotedPost) {
		return (
			<div>
				<PostMessageRenderer message={post.content} />
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
				<PostMessageRenderer message={post.content} />
				<PostPoll
					pollTimeLeft={useTime}
					poll={post.poll}
					pollEndTime={post.poll.endDate}
					onClickVote={pollVote}
				/>
			</div>
		)
	}
	return <PostMessageRenderer message={post.content} />
}
