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

const PoolContent: FC<{ choise: string[] }> = ({ choise }) => {
	const minPoolMinutes = 0
	const [poolLength, setPoolLength] = useState<PoolLength>({ days: 1, hours: 0, minutes: 0 })
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
					<StyledSelect id="days" className="w-20" defaultValue={poolLength.days}>
						<PoolLengthOptions length={8} />
					</StyledSelect>
					<StyledLabel htmlFor="days" side="left">
						Days
					</StyledLabel>
				</div>
				<div className="relative mr-4">
					<StyledSelect id="hours" defaultValue={poolLength.hours} className="w-20">
						<PoolLengthOptions length={24} />
					</StyledSelect>
					<StyledLabel htmlFor="hours" side="left">
						Hours
					</StyledLabel>
				</div>
				<div className="relative">
					<StyledSelect id="minutes" defaultValue={poolLength.minutes} className="w-20">
						<PoolLengthOptions length={8} minLength={minPoolMinutes} />
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
