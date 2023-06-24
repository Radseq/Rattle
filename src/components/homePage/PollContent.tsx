import { type FC, useState } from "react"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"
import { type Poll } from "./types"
import {
	DangerButton,
	DangerOutlineButton,
	PrimalyOutlineButton,
} from "../styledHTMLElements/StyledButtons"
import { PollInput } from "./PollInput"

const PollLengthOptions: FC<{ length: number; minLength?: number }> = ({
	length,
	minLength = 0,
}) => {
	return (
		<>
			{createAndIncrementFill(length, minLength).map((num, index) => {
				return (
					<option key={index} value={num}>
						{num}
					</option>
				)
			})}
		</>
	)
}

// todo add to env instead hard coded
const MIN_POLL_LENGTH = 5
const MIN_HOUR = 1
const MAX_POLL_CHOISES = 6

const PollContent: FC<{ onPollClose: () => void }> = ({ onPollClose }) => {
	const [postPoll, setPostPoll] = useState<Poll>({
		choise: ["", ""],
		length: {
			days: 1,
			hours: 0,
			minutes: 0,
		},
	})

	const handlePollLength = (type: "days" | "hours" | "minutes", value: number) => {
		const pollLength = postPoll.length
		if (type === "hours") {
			let minutes = pollLength.minutes
			if (value === 0 && minutes < MIN_POLL_LENGTH && pollLength.days === 0) {
				minutes = MIN_POLL_LENGTH
			} else {
				minutes = value
			}
			setPostPoll({
				...postPoll,
				length: { ...pollLength, hours: value, minutes },
			})
		} else if (type === "days") {
			let hours = pollLength.hours
			if (value === 0 && hours === 0) {
				hours = MIN_HOUR
			}
			setPostPoll({ ...postPoll, length: { ...pollLength, days: value, hours } })
		} else {
			let minutes = value
			if (value === 0 && pollLength.hours === 0 && pollLength.days === 0) {
				minutes = MIN_POLL_LENGTH
			}
			setPostPoll({ ...postPoll, length: { ...pollLength, minutes } })
		}
	}

	const handlePollInputChange = (newValue: string, index: number) => {
		setPostPoll({
			...postPoll,
			choise: postPoll.choise.map((value, ind) => {
				if (ind === index) {
					return newValue
				}
				return value
			}),
		})
	}

	const handleRemoveInput = (index: number) => {
		setPostPoll({
			...postPoll,
			choise: postPoll.choise.filter((_, ind) => ind !== index),
		})
	}

	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{postPoll.choise.map((inputValue, index) => {
				return (
					<div key={index} className="flex">
						<div className="w-full">
							<PollInput
								onUpdateInput={(newValue: string) =>
									handlePollInputChange(newValue, index)
								}
								initValue={inputValue}
								index={index + 1}
							/>
						</div>
						{index > 1 && (
							<DangerButton
								onClick={(e) => {
									handleRemoveInput(index)
									e.preventDefault()
								}}
								className="my-auto ml-2 h-10 w-10"
							>
								X
							</DangerButton>
						)}
					</div>
				)
			})}
			{postPoll.choise.length < MAX_POLL_CHOISES && (
				<PrimalyOutlineButton
					onClick={(e) => {
						const newChoise = [...postPoll.choise]
						newChoise.push("")
						setPostPoll({ ...postPoll, choise: newChoise })
						e.preventDefault()
					}}
				>
					Add choise
				</PrimalyOutlineButton>
			)}
			<hr className="my-4" />
			<div className="flex justify-between">
				<div className="m-2">
					<span>Poll length</span>
				</div>
				<div className="relative">
					<StyledSelect
						id="days"
						className="w-28"
						onChange={(e) => handlePollLength("days", Number(e.target.value))}
						value={postPoll.length.days}
					>
						<PollLengthOptions length={8} />
					</StyledSelect>
					<StyledLabel htmlFor="days" side="left">
						Days
					</StyledLabel>
				</div>
				<div className="relative">
					<StyledSelect
						id="hours"
						onChange={(e) => handlePollLength("hours", Number(e.target.value))}
						value={postPoll.length.hours}
						className="w-28"
					>
						<PollLengthOptions length={24} />
					</StyledSelect>
					<StyledLabel htmlFor="hours" side="left">
						Hours
					</StyledLabel>
				</div>
				<div className="relative">
					<StyledSelect
						id="minutes"
						onChange={(e) => handlePollLength("minutes", Number(e.target.value))}
						value={postPoll.length.minutes}
						className="w-28"
					>
						<PollLengthOptions
							length={60}
							minLength={
								postPoll.length.days === 0 && postPoll.length.hours === 0
									? MIN_POLL_LENGTH
									: 0
							}
						/>
					</StyledSelect>
					<StyledLabel htmlFor="minutes" side="left">
						Minutes
					</StyledLabel>
				</div>
				<DangerOutlineButton onClick={onPollClose}>Remove Poll</DangerOutlineButton>
			</div>
		</div>
	)
}

export default PollContent
