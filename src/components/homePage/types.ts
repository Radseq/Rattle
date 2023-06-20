export type PoolLength = {
	days: number
	hours: number
	minutes: number
}

export type Pool = {
	choise: string[]
	length: PoolLength
}

export type PostContent = {
	message: string
	pool?: Pool
}
