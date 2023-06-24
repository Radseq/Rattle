import { type FC } from "react"
import { StyledInput, StyledLabel } from "../styledHTMLElements/FloatingStyles"
import { useRestrictedInput } from "~/hooks/useRestrictedInput"

const MAX_CHOISE_LENGTH = 25

export const PollInput: FC<{ index: number }> = ({ index }) => {
	const inputPoll = useRestrictedInput(MAX_CHOISE_LENGTH, "")
	const pollOptionId = `pollOption${index}`
	return (
		<div className="relative my-2">
			<StyledInput
				id={pollOptionId}
				placeholder=""
				value={inputPoll.value}
				onChange={inputPoll.onChange}
			/>
			<StyledLabel htmlFor={pollOptionId} side="left">
				{`Choice ${index}`}
			</StyledLabel>
			{inputPoll.charsLeft && (
				<StyledLabel
					side="right"
					htmlFor={pollOptionId}
				>{`${MAX_CHOISE_LENGTH}/${inputPoll.charsLeft}`}</StyledLabel>
			)}
		</div>
	)
}
