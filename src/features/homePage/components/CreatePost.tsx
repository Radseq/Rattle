import { type FC, type PropsWithChildren, useReducer, useState } from "react"
import { Icon } from "~/components/Icon"
import { CreatePoll } from "~/components/homePage/CreatePoll"
import { type PostContent } from "~/components/homePage/types"
import { ProfileAvatarImageUrl } from "~/components/profile/ProfileAvatarImageUrl"
import { PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"
import { pollChoicesReducer, pollLengthReducer } from "../hooks"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"

const INIT_POLL_LENGTH = {
	days: 1,
	hours: 0,
	minutes: 0,
}

const INIT_POLL_CHOICES = ["", ""]

const CreatePostFooter: FC<{ handleAddPollIClick: () => void; handleCreateClick: () => void }> = ({
	handleAddPollIClick,
	handleCreateClick,
}) => {
	return (
		<footer className="ml-16 flex">
			<div className="flex p-2" onClick={handleAddPollIClick}>
				<Icon iconKind="poll" />
			</div>
			<div className="w-full"></div>
			<div className="mr-2">
				<PrimaryButton onClick={handleCreateClick}>Post</PrimaryButton>
			</div>
		</footer>
	)
}

type CreatePostProps = {
	profileImageUrl: string
	onMessageChange: (msg: string) => void
	inputMessage: string
} & PropsWithChildren

const CreatePost: FC<CreatePostProps> = ({
	profileImageUrl,
	onMessageChange,
	inputMessage,
	children,
}) => {
	return (
		<div className="flex">
			<ProfileAvatarImageUrl src={profileImageUrl} />
			<div className="w-full pl-1">
				<input
					className="w-full rounded-xl border-2 border-solid p-1 text-lg outline-none"
					placeholder={inputMessage}
					onChange={(e) => onMessageChange(e.target.value)}
					type="text"
				></input>
				{children}
			</div>
		</div>
	)
}

export const ConnectorCreatePost: FC<{ profileImageUrl: string; refetch: () => void }> = ({
	profileImageUrl,
	refetch,
}) => {
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
			refetch()
		},
		onError: () => {
			toast.error("Failed to create post! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<div>
			<CreatePost
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
			</CreatePost>
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
		</div>
	)
}
