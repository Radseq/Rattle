import { type FC } from "react"
import { PoolInput } from "./PoolInput"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndIncrementFill } from "~/utils/helpers"

const PoolContent: FC<{ choise: string[] }> = ({ choise }) => {
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
					<StyledSelect id="days" className="w-20" defaultValue={0}>
						{createAndIncrementFill(8).map((num, index) => {
							return (
								<option key={index} value={num}>
									{num}
								</option>
							)
						})}
					</StyledSelect>
					<StyledLabel htmlFor="days" side="left">
						Days
					</StyledLabel>
				</div>
				<div className="relative mr-4">
					<StyledSelect id="hours" defaultValue={0} className="w-20">
						{createAndIncrementFill(24).map((num, index) => {
							return (
								<option key={index} value={num}>
									{num}
								</option>
							)
						})}
					</StyledSelect>
					<StyledLabel htmlFor="hours" side="left">
						Hours
					</StyledLabel>
				</div>
				<div className="relative">
					<StyledSelect id="minutes" defaultValue={0} className="w-20">
						{createAndIncrementFill(60).map((num, index) => {
							return (
								<option key={index} value={num}>
									{num}
								</option>
							)
						})}
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
