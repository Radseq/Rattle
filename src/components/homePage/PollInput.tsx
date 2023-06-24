import { type FC } from "react"
import { StyledInput, StyledLabel } from "../styledHTMLElements/FloatingStyles"
import { useRestrictedInput } from "~/hooks/useRestrictedInput"

const MAX_CHOISE_LENGTH = 25

export const PollInput: FC<{
	index: number
	initValue: string
	onUpdateInput: (value: string) => void
}> = ({ index, initValue, onUpdateInput }) => {
	const inputPoll = useRestrictedInput(MAX_CHOISE_LENGTH, initValue)
	const pollOptionId = `pollOption${index}`
	return (
		<div className="relative my-2">
			<StyledInput
				id={pollOptionId}
				placeholder=""
				value={initValue}
				onChange={(e) => {
					if (inputPoll.charsleft) {
						inputPoll.onChange(e)
						onUpdateInput(e.target.value)
					}
				}}
			/>
			<StyledLabel htmlFor={pollOptionId} side="left">
				{`Choice ${index}`}
			</StyledLabel>
			<StyledLabel
				side="right"
				htmlFor={pollOptionId}
			>{`${MAX_CHOISE_LENGTH}/${inputPoll.charsleft}`}</StyledLabel>
		</div>
	)
}
