import type { Dispatch, SetStateAction } from "react"

export type PollLength = {
	days: number
	hours: number
	minutes: number
}

export type Poll = {
	choices: string[]
	length: PollLength
}

export type PostContent = {
	message: string
	poll?: Poll
}

export type CreatedPost = {
	isCreatedPost: boolean
	setIsCreatedPost: Dispatch<SetStateAction<boolean>>
}
