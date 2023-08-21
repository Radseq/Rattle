import { type FC } from "react"
import { StyledInput, StyledLabel } from "~/components/styledHTMLElements/FloatingStyles"
import { CONFIG } from "~/config"
import { useRestrictedInput } from "~/hooks/useRestrictedInput"

export const PollInput: FC<{
	index: number
	initValue: string
	onUpdateInput: (value: string) => void
}> = ({ index, initValue, onUpdateInput }) => {
	const inputPoll = useRestrictedInput(CONFIG.MAX_CHOICE_INPUT_LENGTH, initValue)
	const pollOptionId = `pollOption${index}`
	return (
		<div className="relative my-2">
			<StyledInput
				id={pollOptionId}
				placeholder=""
				value={inputPoll.value}
				onChange={(e) => {
					inputPoll.onChange(e)
					if (inputPoll.charsleft) {
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
			>{`${CONFIG.MAX_CHOICE_INPUT_LENGTH}/${inputPoll.charsleft}`}</StyledLabel>
		</div>
	)
}
