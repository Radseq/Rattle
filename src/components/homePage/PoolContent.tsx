import { type FC } from "react"
import { PoolInput } from "./PoolInput"
import { StyledLabel, StyledSelect } from "../styledHTMLElements/FloatingStyles"
import { createAndincrementFill } from "~/utils/helpers"

const PoolContent: FC<{ choise: string[] }> = ({ choise }) => {
	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			{choise.map((_, index) => {
				return <PoolInput key={index} index={index + 1} />
			})}
			<hr className="my-4" />
			<div className="m-2">
				<span>Pool length</span>
			</div>
			<div className="">
				<div className="flex">
					<div className="relative mr-4">
						<StyledSelect id="days" className="w-20">
							{createAndincrementFill(8).map((num, index) => {
								return (
									<option key={index} selected={index === 0} value={num}>
										{num}
									</option>
								)
							})}
						</StyledSelect>
						<StyledLabel htmlFor="days" side="left">
							Days
						</StyledLabel>
					</div>

					<div className="relative">
						<StyledSelect id="hours" className="w-20">
							{createAndincrementFill(24).map((num, index) => {
								return (
									<option key={index} selected={index === 0} value={num}>
										{num}
									</option>
								)
							})}
						</StyledSelect>
						<StyledLabel htmlFor="hours" side="left">
							Hours
						</StyledLabel>
					</div>
				</div>
			</div>
		</div>
	)
}

export default PoolContent
