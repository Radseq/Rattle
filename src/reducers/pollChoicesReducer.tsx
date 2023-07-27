export type PollChoicesAction = { type: "add" | "remove" | "change"; index: number; value: string }

export const pollChoicesReducer = (state: string[], action: PollChoicesAction): string[] => {
	switch (action.type) {
		case "add": {
			const newChoise = [...state]
			newChoise.push("")
			return newChoise
		}
		case "remove": {
			return state.filter((_, ind) => ind !== action.index)
		}
		case "change": {
			return state.map((value, ind) => {
				if (ind === action.index) {
					return action.value
				}
				return value
			})
		}
	}
}
