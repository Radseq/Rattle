import { type FC, useReducer, useState } from "react"
import { DangerOutlineButton, PrimalyButton } from "../styledHTMLElements/StyledButtons"
import { LoadingSpinner } from "../LoadingPage"
import Image from "next/image"
import { Icon } from "../Icon"
import type { PollLength, PostContent } from "./types"
import { PollChoices } from "./PollChoices"
import { pollLengthReducer } from "~/reducers/pollLengthReducer"
import { PollLen } from "./PollLength"

const INIT_POLL_LENGTH = {
	days: 1,
	hours: 0,
	minutes: 0,
}

export const HomeCreatePost: FC<{
	onCreatePost: (postContent: PostContent) => void
	isCreating: boolean
	profileImageUrl: string
	placeholderMessage: string
}> = ({ onCreatePost, isCreating, profileImageUrl, placeholderMessage }) => {
	const [postContent, setPostContent] = useState<PostContent>({
		message: "",
	})

	const [state, dispatch] = useReducer(pollLengthReducer, INIT_POLL_LENGTH)

	if (isCreating) {
		return (
			<div className="flex justify-center">
				<LoadingSpinner size={50} />
			</div>
		)
	}

	const updatePool = (length: PollLength | null, choise: string[] | null) => {
		if (postContent.poll) {
			setPostContent({
				...postContent,
				poll: {
					choices: choise ?? postContent.poll.choices,
					length: length ?? postContent.poll.length,
				},
			})
		}
	}

	const handleAddChoice = () => {
		if (postContent.poll) {
			const newChoise = [...postContent.poll.choices]
			newChoise.push("")
			updatePool(null, newChoise)
		}
	}

	const handlePollInputChange = (newValue: string, index: number) => {
		if (postContent.poll) {
			updatePool(
				null,
				postContent.poll.choices.map((value, ind) => {
					if (ind === index) {
						return newValue
					}
					return value
				})
			)
		}
	}

	const handleRemoveInput = (index: number) => {
		if (postContent.poll) {
			updatePool(
				null,
				postContent.poll.choices.filter((_, ind) => ind !== index)
			)
		}
	}

	const handleCreatePost = () => {
		if (postContent.poll) {
			const notNullchoices = [...postContent.poll.choices].filter((choice) => {
				if (choice) {
					return choice
				}
			})
			updatePool(state, notNullchoices)
		}

		onCreatePost(postContent)
	}

	const handleRemovePoll = () => {
		setPostContent({
			...postContent,
			poll: undefined,
		})
	}

	return (
		<div className="flex">
			<Image
				className="h-16 w-16 rounded-full"
				src={profileImageUrl}
				alt={"avatar"}
				width={128}
				height={128}
			></Image>
			<div className="w-full pl-1">
				<header className="flex ">
					<input
						className="w-full rounded-xl border-2 border-solid p-1 text-lg outline-none"
						placeholder={postContent?.poll ? "Ask a question!" : placeholderMessage}
						onChange={(e) =>
							setPostContent({ ...postContent, message: e.target.value })
						}
						type="text"
					></input>
				</header>
				<main className="my-2 flex w-full pl-1">
					{postContent.poll && (
						<div className="mr-3 box-border w-full rounded-md border p-2">
							<PollChoices
								choices={postContent.poll.choices}
								addChooise={() => handleAddChoice()}
								pollInputChange={(newValue, index) =>
									handlePollInputChange(newValue, index)
								}
								removeInput={(index) => handleRemoveInput(index)}
							/>
							<PollLen dispatch={dispatch} state={state} />
							<hr className="my-4" />
							<DangerOutlineButton onClick={() => handleRemovePoll}>
								Remove Poll
							</DangerOutlineButton>
						</div>
					)}
				</main>
				<footer className="flex">
					<div
						className="flex p-2"
						onClick={() => {
							if (postContent.poll) {
								handleRemovePoll()
							} else {
								setPostContent({
									...postContent,
									message: postContent.message ?? "",
									poll: {
										choices: ["", ""],
										length: INIT_POLL_LENGTH,
									},
								})
							}
						}}
					>
						<Icon iconKind="poll" />
					</div>
					<div className="w-full"></div>
					<div className="mr-2">
						<PrimalyButton onClick={() => handleCreatePost()}>Post</PrimalyButton>
					</div>
				</footer>
			</div>
		</div>
	)
}
