import { type PollLength } from "~/components/homePage/types"

const POLL_MIN_HOURS = 1
const POLL_MIN_MINUTES = 1

export type PollLengthAction = { type: "days" | "hours" | "minutes"; value: number }

export const pollLengthReducer = (state: PollLength, action: PollLengthAction): PollLength => {
	switch (action.type) {
		case "days": {
			const days = action.value
			let { hours } = state
			if (!days && !hours) {
				hours = POLL_MIN_HOURS
			}
			return {
				...state,
				days,
				hours,
			}
		}
		case "hours": {
			const hours = action.value
			let { minutes } = state
			if (!state.days && !hours) {
				minutes = Math.max(minutes, POLL_MIN_MINUTES)
			}
			return {
				...state,
				hours,
				minutes,
			}
		}
		case "minutes": {
			let minutes = action.value
			if (!state.days && !state.hours && !minutes) {
				minutes = POLL_MIN_MINUTES
			}
			return {
				...state,
				minutes,
			}
		}
	}
}
