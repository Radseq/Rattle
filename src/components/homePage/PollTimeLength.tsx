import type { Dispatch, FC } from "react"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"
import React from "react"
import { type PollLength } from "./types"
import { type PollLengthAction } from "~/reducers/pollLengthReducer"

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

// todo add to env instead hard coded
const MIN_POLL_LENGTH = 5

// export const PollLength: FC<{}> = () => {
export const PollTimeLength: FC<{ state: PollLength; dispatch: Dispatch<PollLengthAction> }> = ({
	state,
	dispatch,
}) => {
	return (
		<div>
			<div className="m-2 flex h-full">
				<div>
					<span className="m-auto w-36">Poll length</span>
				</div>
				<div className=" flex w-full justify-between">
					<div className="relative w-24">
						<StyledSelect
							id="days"
							className="w-full"
							onChange={(e) =>
								dispatch({ type: "days", value: Number(e.target.value) })
							}
							value={state.days}
						>
							<PollLengthOptions length={8} />
						</StyledSelect>
						<StyledLabel htmlFor="days" side="left">
							Days
						</StyledLabel>
					</div>
					<div className="relative w-24">
						<StyledSelect
							id="hours"
							onChange={(e) =>
								dispatch({ type: "hours", value: Number(e.target.value) })
							}
							value={state.hours}
							className="w-full"
						>
							<PollLengthOptions length={24} />
						</StyledSelect>
						<StyledLabel htmlFor="hours" side="left">
							Hours
						</StyledLabel>
					</div>
					<div className="relative w-24">
						<StyledSelect
							id="minutes"
							onChange={(e) =>
								dispatch({ type: "minutes", value: Number(e.target.value) })
							}
							value={state.minutes}
							className="w-full"
						>
							<PollLengthOptions
								length={60}
								minLength={
									state.days === 0 && state.hours === 0 ? MIN_POLL_LENGTH : 0
								}
							/>
						</StyledSelect>
						<StyledLabel htmlFor="minutes" side="left">
							Minutes
						</StyledLabel>
					</div>
				</div>
			</div>
		</div>
	)
}
