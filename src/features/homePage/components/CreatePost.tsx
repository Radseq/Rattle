import { type FC, useReducer, useState } from "react"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { type PostContent } from "../types"
import { CreatePoll } from "./CreatePoll"
import { CreatePostForm } from "./CreatePostForm"
import { CreatePostFooter } from "./CreatePostFooter"
import { useCreatePost } from "./CreatePostProvide"
import { pollLengthReducer } from "../hooks/pollLengthReducer"
import { pollChoicesReducer } from "../hooks/pollChoicesReducer"

const INIT_POLL_LENGTH = {
	days: 1,
	hours: 0,
	minutes: 0,
}

const INIT_POLL_CHOICES = ["", ""]

export const CreatePost: FC<{ profileImageUrl: string }> = ({ profileImageUrl }) => {
	const { setIsCreatedPost } = useCreatePost()

	const [postContent, setPostContent] = useState<PostContent>({
		message: "",
	})

	const [pollLengthState, pollLengthDispatch] = useReducer(pollLengthReducer, INIT_POLL_LENGTH)
	const [pollChoicesState, pollChoicesDispatch] = useReducer(
		pollChoicesReducer,
		INIT_POLL_CHOICES
	)

	const handleRemovePoll = () => {
		setPostContent({
			...postContent,
			poll: undefined,
		})
	}

	const handlePollIconClick = () => {
		if (postContent.poll) {
			handleRemovePoll()
		} else {
			setPostContent({
				...postContent,
				message: postContent.message ?? "",
				poll: {
					choices: INIT_POLL_CHOICES,
					length: pollLengthState,
				},
			})
		}
	}

	const { mutate } = api.posts.createPost.useMutation({
		onSuccess: () => {
			setIsCreatedPost(true)
		},
		onError: () => {
			toast.error("Failed to create post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<article>
			<CreatePostForm
				profileImageUrl={profileImageUrl}
				onMessageChange={(msg) => setPostContent({ ...postContent, message: msg })}
				inputMessage={postContent.poll ? "Ask a question!" : "What is happening?!"}
			>
				{postContent.poll && (
					<CreatePoll
						onRemovePoll={handleRemovePoll}
						pollChoicesDispatch={pollChoicesDispatch}
						pollLengthDispatch={pollLengthDispatch}
						pollLength={pollLengthState}
						choices={pollChoicesState}
					/>
				)}
			</CreatePostForm>
			<CreatePostFooter
				handleAddPollIClick={handlePollIconClick}
				handleCreateClick={() =>
					mutate({
						message: postContent.message,
						poll: postContent.poll && {
							choices: [...pollChoicesState].filter((choice) => {
								if (choice) {
									return choice
								}
							}),
							length: pollLengthState,
						},
					})
				}
			/>
		</article>
	)
}
