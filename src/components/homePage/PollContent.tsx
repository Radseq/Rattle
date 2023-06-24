import { type FC, useState } from "react"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"
import { type PollLength } from "./types"
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

type PollLengthExt = PollLength & {
	minPollLength: number
}
// todo add to env instead hard coded
const MIN_POLL_LENGTH = 5
const MIN_HOUR = 1

const PollContent: FC<{ choise: string[] }> = ({ choise }) => {
	const [pollLength, setPollLength] = useState<PollLengthExt>({
		days: 1,
		hours: 0,
		minutes: 0,
		minPollLength: 0,
	})
	// todo  do hook instead function?
	const handlePollLength = (type: "days" | "hours" | "minutes", value: number) => {
		if (type === "hours") {
			let minutes = pollLength.minutes
			let minPollLength = pollLength.minPollLength
			if (value === 0 && minutes < MIN_POLL_LENGTH && pollLength.days === 0) {
				minutes = pollLength.minPollLength
				minPollLength = MIN_POLL_LENGTH
			} else {
				minPollLength = 0
				minutes = pollLength.minutes
			}
			setPollLength({ ...pollLength, hours: value, minutes: minutes, minPollLength })
		} else if (type === "days") {
			let hours = pollLength.hours
			if (value === 0 && hours === 0) {
				hours = MIN_HOUR
			}
			setPollLength({ ...pollLength, days: value, hours: hours })
		} else {
			let minutes = value
			if (value === 0 && pollLength.hours === 0 && pollLength.days === 0) {
				minutes = pollLength.minPollLength
			}
			setPollLength({ ...pollLength, minutes })
		}
	}

	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{choise.map((_, index) => {
				return <PollInput key={index} index={index + 1} />
			})}
			<hr className="my-4" />
			<div className="flex">
				<div className="m-2">
					<span>Poll length</span>
				</div>
				<div className="relative mr-4">
					<StyledSelect
						id="days"
						className="w-20"
						onChange={(e) => handlePollLength("days", Number(e.target.value))}
						value={pollLength.days}
					>
						<PollLengthOptions length={8} />
					</StyledSelect>
					<StyledLabel htmlFor="days" side="left">
						Days
					</StyledLabel>
				</div>
				<div className="relative mr-4">
					<StyledSelect
						id="hours"
						onChange={(e) => handlePollLength("hours", Number(e.target.value))}
						value={pollLength.hours}
						className="w-20"
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
						value={pollLength.minutes}
						className="w-20"
					>
						<PollLengthOptions length={60} minLength={pollLength.minPollLength} />
					</StyledSelect>
					<StyledLabel htmlFor="minutes" side="left">
						Minutes
					</StyledLabel>
				</div>
			</div>
		</div>
	)
}

export default PollContent
