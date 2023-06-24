import { type FC } from "react"
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
			{createAndIncrementFill(length, minLength).map((value, index) => {
				return (
					<option key={index} value={value}>
						{value}
					</option>
				)
			})}
		</>
	)
}

export const PollContent: FC<{
	poll: Poll
	onPollClose: () => void
	onHandlePoolLength: (type: "days" | "hours" | "minutes", value: number) => void
	onHandlePollInputChange: (newValue: string, index: number) => void
	onHandleRemoveInput: (index: number) => void
	onAddChooise: () => void
}> = ({
	poll,
	onPollClose,
	onHandlePoolLength,
	onHandlePollInputChange,
	onHandleRemoveInput,
	onAddChooise,
}) => {
	// todo add to env instead hard coded
	const MAX_POLL_CHOISES = 6
	const MIN_POLL_LENGTH = 5

	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{poll.choise.map((inputValue, index) => {
				return (
					<div key={index} className="flex">
						<div className="w-full">
							<PollInput
								onUpdateInput={(newValue: string) =>
									onHandlePollInputChange(newValue, index)
								}
								initValue={inputValue}
								index={index + 1}
							/>
						</div>
						{index > 1 && (
							<DangerButton
								onClick={() => {
									onHandleRemoveInput(index)
								}}
								className="my-auto ml-2 h-10 w-10"
							>
								X
							</DangerButton>
						)}
					</div>
				)
			})}
			{poll.choise.length < MAX_POLL_CHOISES && (
				<PrimalyOutlineButton onClick={() => onAddChooise()}>
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
						onChange={(e) => onHandlePoolLength("days", Number(e.target.value))}
						value={poll.length.days}
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
						onChange={(e) => onHandlePoolLength("hours", Number(e.target.value))}
						value={poll.length.hours}
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
						onChange={(e) => onHandlePoolLength("minutes", Number(e.target.value))}
						value={poll.length.minutes}
						className="w-28"
					>
						<PollLengthOptions
							length={60}
							minLength={
								poll.length.days === 0 && poll.length.hours === 0
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
