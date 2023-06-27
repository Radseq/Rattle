import { type FC, useRef, useState } from "react"
import { DangerOutlineButton, PrimalyButton } from "../styledHTMLElements/StyledButtons"
import { LoadingSpinner } from "../LoadingPage"
import Image from "next/image"
import { Icon } from "../Icon"
import type { PollLength, PostContent } from "./types"
import { PollChoices } from "./PollChoices"
import { PollLengthComp } from "./PollLength"

export const HomeCreatePost: FC<{
	onCreatePost: (message: string) => void
	isCreating: boolean
	profileImageUrl: string
	placeholderMessage: string
}> = ({ onCreatePost, isCreating, profileImageUrl, placeholderMessage }) => {
	const [postContent, setPostContent] = useState<PostContent>()

	const pollLength = useRef(null)

	if (isCreating) {
		return (
			<div className="flex justify-center">
				<LoadingSpinner size={50} />
			</div>
		)
	}

	const updatePool = (length: PollLength | null, choise: string[] | null) => {
		if (postContent && postContent.poll) {
			setPostContent({
				...postContent,
				poll: {
					choices: choise ?? postContent.poll.choices,
					length: length ?? postContent.poll.length,
				},
			})
		}
	}

	const handleAddChooise = () => {
		if (postContent && postContent.poll) {
			const newChoise = [...postContent.poll.choices]
			newChoise.push("")
			updatePool(null, newChoise)
		}
	}

	const handlePollInputChange = (newValue: string, index: number) => {
		if (postContent && postContent.poll) {
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
		if (postContent && postContent.poll) {
			updatePool(
				null,
				postContent.poll.choices.filter((_, ind) => ind !== index)
			)
		}
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
					{postContent?.poll && (
						<div className="mr-3 box-border w-full rounded-md border p-2">
							<PollChoices
								choices={postContent.poll.choices}
								addChooise={() => handleAddChooise()}
								pollInputChange={(newValue, index) =>
									handlePollInputChange(newValue, index)
								}
								removeInput={(index) => handleRemoveInput(index)}
							/>
							<PollLengthComp days={1} hours={0} minutes={0} ref={pollLength} />
							<hr className="my-4" />
							<DangerOutlineButton
								onClick={() =>
									setPostContent({
										...postContent,
										poll: undefined,
									})
								}
							>
								Remove Poll
							</DangerOutlineButton>
						</div>
					)}
				</main>
				<footer className="flex">
					<div
						className="flex p-2"
						onClick={() => {
							setPostContent({
								...postContent,
								message: postContent?.message ?? "",
								poll: {
									choices: ["", ""],
									length: {
										days: 1,
										hours: 0,
										minutes: 0,
									},
								},
							})
						}}
					>
						<Icon iconKind="poll" />
					</div>
					<div className="w-full"></div>
					<div className="mr-2">
						<PrimalyButton onClick={() => onCreatePost(postContent?.message ?? "")}>
							Post
						</PrimalyButton>
					</div>
				</footer>
			</div>
		</div>
	)
}
