import type { Dispatch, FC } from "react"
import { PollInput } from "./PollInput"
import { DangerButton, PrimaryOutlineButton } from "~/components/styledHTMLElements/StyledButtons"
import { type PollChoicesAction } from "../hooks"

// todo add to env instead hard coded
const MAX_POLL_CHOICES = 6

export const PollChoices: FC<{
	choices: string[]
	dispatch: Dispatch<PollChoicesAction>
}> = ({ choices, dispatch }) => {
	return (
		<div className="">
			{choices.map((inputValue, index) => {
				return (
					<div key={index} className="flex w-full">
						<div className="w-full">
							<PollInput
								onUpdateInput={(newValue: string) =>
									dispatch({ type: "change", index, value: newValue })
								}
								initValue={inputValue}
								index={index + 1}
							/>
						</div>
						{index > 1 && (
							<DangerButton
								onClick={() => {
									dispatch({ type: "remove", index, value: "" })
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
				<PrimaryOutlineButton
					onClick={() => dispatch({ type: "add", index: 0, value: "" })}
				>
					Add choice
				</PrimaryOutlineButton>
			)}
		</div>
	)
}
