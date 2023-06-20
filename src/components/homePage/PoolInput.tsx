import { type FC } from "react"
import { StyledInput, StyledLabel } from "../styledHTMLElements/FloatingStyles"
import { useRestrictedInput } from "~/hooks/useRestrictedInput"

const MAX_CHOISE_LENGTH = 25

export const PoolInput: FC<{ index: number }> = ({ index }) => {
	const inputPool = useRestrictedInput(MAX_CHOISE_LENGTH, "")
	const poolOptionId = `poolOption${index}`
	return (
		<div className="relative my-2">
			<StyledInput id={poolOptionId} placeholder="" {...inputPool} />
			<StyledLabel htmlFor={poolOptionId} side="left">
				{`Choice ${index}`}
			</StyledLabel>
			{inputPool.charsLeft && (
				<StyledLabel
					side="right"
					htmlFor={poolOptionId}
				>{`${MAX_CHOISE_LENGTH}/${inputPool.charsLeft}`}</StyledLabel>
			)}
		</div>
	)
}
