import { type FC, useState } from "react"
import { PrimalyButton } from "../styledHTMLElements/StyledButtons"
import { LoadingSpinner } from "../LoadingPage"
import Image from "next/image"
import { Icon } from "../Icon"
import type { PollLength, PostContent } from "./types"
import { PollContent } from "./PollContent"

// todo add to env instead hard coded
const MIN_POLL_LENGTH = 5
const MIN_HOUR = 1

export const HomeCreatePost: FC<{
	onCreatePost: (message: string) => void
	isCreating: boolean
	profileImageUrl: string
	placeholderMessage: string
}> = ({ onCreatePost, isCreating, profileImageUrl, placeholderMessage }) => {
	const [postContent, setPostContent] = useState<PostContent>()

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
					choise: choise ?? postContent.poll.choise,
					length: length ?? postContent.poll.length,
				},
			})
		}
	}

	const handleAddChooise = () => {
		if (postContent && postContent.poll) {
			const newChoise = [...postContent.poll.choise]
			newChoise.push("")
			updatePool(null, newChoise)
		}
	}

	const handlePollLength = (type: "days" | "hours" | "minutes", value: number) => {
		if (postContent && postContent.poll) {
			const pollLength = postContent.poll.length
			if (type === "hours") {
				let minutes = pollLength.minutes
				if (value === 0 && minutes < MIN_POLL_LENGTH && pollLength.days === 0) {
					minutes = MIN_POLL_LENGTH
				} else {
					minutes = value
				}
				updatePool({ ...pollLength, hours: value, minutes }, null)
			} else if (type === "days") {
				let hours = pollLength.hours
				if (value === 0 && hours === 0) {
					hours = MIN_HOUR
				}
				updatePool({ ...pollLength, days: value, hours }, null)
			} else {
				let minutes = value
				if (value === 0 && pollLength.hours === 0 && pollLength.days === 0) {
					minutes = MIN_POLL_LENGTH
				}
				updatePool({ ...pollLength, minutes }, null)
			}
		}
	}

	const handlePollInputChange = (newValue: string, index: number) => {
		if (postContent && postContent.poll) {
			updatePool(
				null,
				postContent.poll.choise.map((value, ind) => {
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
				postContent.poll.choise.filter((_, ind) => ind !== index)
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
						<PollContent
							poll={postContent.poll}
							onHandlePollInputChange={(newValue, index) =>
								handlePollInputChange(newValue, index)
							}
							onHandlePoolLength={(type, value) => handlePollLength(type, value)}
							onHandleRemoveInput={(index) => handleRemoveInput(index)}
							onPollClose={() =>
								setPostContent({
									...postContent,
									poll: undefined,
								})
							}
							onAddChooise={() => handleAddChooise()}
						/>
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
									choise: ["", ""],
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
