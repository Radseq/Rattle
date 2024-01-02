import { type FC } from "react"
import { StyledInput, StyledLabel } from "~/components/styledHTMLElements/FloatingStyles"
import { useRestrictedInput } from "~/hooks/useRestrictedInput"

const MAX_CHOICE_LENGTH = 25

export const PollInput: FC<{
	index: number
	initValue: string
	onUpdateInput: (value: string) => void
}> = ({ index, initValue, onUpdateInput }) => {
	const inputPoll = useRestrictedInput(MAX_CHOICE_LENGTH, initValue)
	const pollOptionId = `pollOption${index}`
	return (
		<div className="relative my-2">
			<StyledInput
				id={pollOptionId}
				placeholder=""
				value={inputPoll.value}
				onChange={(e) => {
					inputPoll.onChange(e)
					if (inputPoll.charsLeft) {
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
			>{`${MAX_CHOICE_LENGTH}/${inputPoll.charsLeft}`}</StyledLabel>
		</div>
	)
}
