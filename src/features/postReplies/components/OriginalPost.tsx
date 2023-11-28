import { type FC } from "react"
import { Icon } from "~/components/Icon"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PostPoll } from "~/components/postsPage/PostPoll"
import PostMessageRenderer from "~/features/postMessage/components/PostMessageRenderer"
import { PostSummary } from "./PostSummary"
import { type PostAuthor } from "~/features/profile"
import { type Post } from "~/components/post/types"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { CONFIG } from "~/config"
import { useTimeLeft } from "~/hooks/useTimeLeft"

export const OriginalPost: FC<{
	author: PostAuthor
	post: Post
	onOriginalPostVote: (choiceId: number | null, oldChoiceId: number | null) => void
}> = ({ author, post, onOriginalPostVote }) => {
	const useTime = useTimeLeft(post.createdAt, post.poll?.endDate)

	const pollVote = api.profile.votePostPoll.useMutation({
		onSuccess: (data) => {
			toast.success("Voted!")
			if (data.newChoiceId) {
				onOriginalPostVote(data.newChoiceId, data.oldChoiceId)
			}
		},
		onError: () => {
			toast.error("Failed to vote! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
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
				<span className="text-gray-500">{`Response${post.replyCount > 1 ? "s" : ""}`}</span>
				<span className="p-2 font-bold">{post.quotedCount}</span>
				<span className="text-gray-500">{`Quote${post.quotedCount > 1 ? "s" : ""}`}</span>
			</footer>
			<hr className="my-2" />
		</article>
	)
}
