import type { Dispatch, FC } from "react"
import { createAndIncrementFill } from "~/utils/helpers"
import React from "react"
import { type PollLength } from "../types"
import { StyledLabel, StyledSelect } from "~/components/styledHTMLElements/FloatingStyles"
import { type PollLengthAction } from "../hooks"
import { CONFIG } from "~/config"

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
									state.days === 0 && state.hours === 0
										? CONFIG.MIN_POLL_LENGTH_IN_MINUTES
										: 0
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
