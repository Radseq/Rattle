import type { Dispatch, FC } from "react"
import { PollChoices } from "./PollChoices"
import { PollTimeLength } from "./PollTimeLength"
import { DangerOutlineButton } from "../../../components/styledHTMLElements/StyledButtons"
import { type PollLength } from "../types"
import { type PollLengthAction } from "../hooks/pollLengthReducer"
import { type PollChoicesAction } from "../hooks/pollChoicesReducer"

export const CreatePoll: FC<{
	pollLengthDispatch: Dispatch<PollLengthAction>
	pollChoicesDispatch: Dispatch<PollChoicesAction>
	onRemovePoll: () => void
	pollLength: PollLength
	choices: string[]
}> = ({ pollLengthDispatch, pollChoicesDispatch, onRemovePoll, pollLength, choices }) => {
	return (
		<div className="mr-3 box-border w-full rounded-md border p-2">
			<PollChoices choices={choices} dispatch={pollChoicesDispatch} />
			<PollTimeLength dispatch={pollLengthDispatch} state={pollLength} />
			<hr className="my-4" />
			<DangerOutlineButton onClick={onRemovePoll}>Remove Poll</DangerOutlineButton>
		</div>
	)
}
