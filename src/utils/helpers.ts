import { type User } from "@clerk/nextjs/dist/api"
import dayjs from "dayjs"
import { type PostWithAuthor } from "~/components/postsPage/types"
import { type PostAuthor } from "~/components/profilePage/types"
import relativeTime from "dayjs/plugin/relativeTime"
dayjs.extend(relativeTime)

export const getFullName = (frstName: string | null, lastName: string | null) => {
	let fullName = frstName
	if (fullName && lastName) {
		fullName += " " + lastName
	}
	return fullName
}

export const filterClarkClientToAuthor = (user: User) => {
	return {
		id: user.id,
		username: user.username ?? "",
		profileImageUrl: user.profileImageUrl,
		fullName: getFullName(user.firstName, user.lastName),
	} as PostAuthor
}

export const createAndIncrementFill = (arrayLength: number, minValue = 0) => {
	const result: number[] = []
	for (let index = minValue; index < arrayLength; index++) {
		result.push(index)
	}
	return result
}

export const percentageOfTotalValue = (value: number, total: number) => {
	if (!total || !value) {
		return 0
	}
	return (value * 100) / total
}

export type TimeAddToDate = { days: number; hours: number; minutes: number }
const LAST_MINUTE_OF_HOUR = 59
const TOTAL_MINUTES_IN_HOUR = 60

export const addTimeToDate = (initDate: Date, timeToAdd: TimeAddToDate) => {
	if (!timeToAdd) {
		return null
	}

	const toPollEnd = initDate
	toPollEnd.setDate(toPollEnd.getDate() + timeToAdd.days)

	if (toPollEnd.getMinutes() + timeToAdd.minutes > LAST_MINUTE_OF_HOUR) {
		const diff = toPollEnd.getMinutes() + timeToAdd.minutes - TOTAL_MINUTES_IN_HOUR
		toPollEnd.setHours(toPollEnd.getHours() + 1)
		toPollEnd.setMinutes(diff)
	} else {
		toPollEnd.setMinutes(toPollEnd.getMinutes() + timeToAdd.minutes)
	}
	toPollEnd.setHours(toPollEnd.getHours() + timeToAdd.hours)
	return toPollEnd
}
