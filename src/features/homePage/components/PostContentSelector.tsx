import { type FC } from "react"
import { type HomePost } from "../types"
import Link from "next/link"
import { PostQuoteItem } from "~/components/postsPage/PostQuoteItem"
import { PostPoll } from "~/components/postsPage/PostPoll"
import { useTimeLeft } from "~/hooks/useTimeLeft"

export const PostContentSelector: FC<{ homePost: HomePost; pollVote: (id: number) => void }> = ({
	homePost,
	pollVote,
}) => {
	const { post, author } = homePost
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
			<PostPoll
				pollTimeLeft={useTime}
				poll={post.poll}
				pollEndTime={post.poll.endDate}
				onClickVote={pollVote}
			/>
		)
	}
	return <span>{post.content}</span>
}
