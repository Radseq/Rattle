import { type FC, useState } from "react"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"
import { type Poll } from "./types"
import { PollInput } from "./PollInput"
import { DangerOutlineButton } from "../styledHTMLElements/StyledButtons"

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
	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{postPoll.choise.map((_, index) => {
				return <PollInput key={index} index={index + 1} />
			})}
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
