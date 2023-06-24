export type PollLength = {
	days: number
	hours: number
	minutes: number
}

export type Poll = {
	choise: string[]
	length: PollLength
}

export type PostContent = {
	message: string
	poll?: Poll
}
