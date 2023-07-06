import { type FC } from "react"
import { PollInput } from "./PollInput"
import { DangerButton, PrimalyOutlineButton } from "../styledHTMLElements/StyledButtons"

// todo add to env instead hard coded
const MAX_POLL_CHOICES = 6

export const PollChoices: FC<{
	choices: string[]
	pollInputChange: (newValue: string, index: number) => void
	removeInput: (index: number) => void
	addChooise: () => void
}> = ({ choices, pollInputChange, removeInput, addChooise }) => {
	return (
		<div className="">
			{choices.map((inputValue, index) => {
				return (
					<div key={index} className="flex w-full">
						<div className="w-full">
							<PollInput
								onUpdateInput={(newValue: string) =>
									pollInputChange(newValue, index)
								}
								initValue={inputValue}
								index={index + 1}
							/>
						</div>
						{index > 1 && (
							<DangerButton
								onClick={() => {
									removeInput(index)
								}}
								className="my-auto ml-2 h-10 w-10"
							>
								X
							</DangerButton>
						)}
					</div>
				)
			})}
			{choices.length < MAX_POLL_CHOICES && (
				<PrimalyOutlineButton onClick={() => addChooise()}>Add choise</PrimalyOutlineButton>
			)}
		</div>
	)
}
