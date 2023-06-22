import { type FC, useState } from "react"
import { PoolInput } from "./PoolInput"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"
import { type PoolLength } from "./types"

const PoolLengthOptions: FC<{ length: number; minLength?: number }> = ({
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

type PoolLengthExt = PoolLength & {
	minPoolLength: number
}
// todo add to env instead hard coded
const MIN_POOL_LENGTH = 5
const MIN_HOUR = 1

const PoolContent: FC<{ choise: string[] }> = ({ choise }) => {
	const [poolLength, setPoolLength] = useState<PoolLengthExt>({
		days: 1,
		hours: 0,
		minutes: 0,
		minPoolLength: 0,
	})
	// todo  do hook instead function?
	const handlePoolLength = (type: "days" | "hours" | "minutes", value: number) => {
		if (type === "hours") {
			let minutes = poolLength.minutes
			let minPoolLength = poolLength.minPoolLength
			if (value === 0 && minutes < MIN_POOL_LENGTH && poolLength.days === 0) {
				minutes = poolLength.minPoolLength
				minPoolLength = MIN_POOL_LENGTH
			} else {
				minPoolLength = 0
				minutes = poolLength.minutes
			}
			setPoolLength({ ...poolLength, hours: value, minutes: minutes, minPoolLength })
		} else if (type === "days") {
			let hours = poolLength.hours
			if (value === 0 && hours === 0) {
				hours = MIN_HOUR
			}
			setPoolLength({ ...poolLength, days: value, hours: hours })
		} else {
			let minutes = value
			if (value === 0 && poolLength.hours === 0 && poolLength.days === 0) {
				minutes = poolLength.minPoolLength
			}
			setPoolLength({ ...poolLength, minutes })
		}
	}

	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{choise.map((_, index) => {
				return <PoolInput key={index} index={index + 1} />
			})}
			<hr className="my-4" />
			<div className="flex">
				<div className="m-2">
					<span>Pool length</span>
				</div>
				<div className="relative mr-4">
					<StyledSelect
						id="days"
						className="w-20"
						onChange={(e) => handlePoolLength("days", Number(e.target.value))}
						value={poolLength.days}
					>
						<PoolLengthOptions length={8} />
					</StyledSelect>
					<StyledLabel htmlFor="days" side="left">
						Days
					</StyledLabel>
				</div>
				<div className="relative mr-4">
					<StyledSelect
						id="hours"
						onChange={(e) => handlePoolLength("hours", Number(e.target.value))}
						value={poolLength.hours}
						className="w-20"
					>
						<PoolLengthOptions length={24} />
					</StyledSelect>
					<StyledLabel htmlFor="hours" side="left">
						Hours
					</StyledLabel>
				</div>
				<div className="relative">
					<StyledSelect
						id="minutes"
						onChange={(e) => handlePoolLength("minutes", Number(e.target.value))}
						value={poolLength.minutes}
						className="w-20"
					>
						<PoolLengthOptions length={60} minLength={poolLength.minPoolLength} />
					</StyledSelect>
					<StyledLabel htmlFor="minutes" side="left">
						Minutes
					</StyledLabel>
				</div>
			</div>
		</div>
	)
}

export default PoolContent
