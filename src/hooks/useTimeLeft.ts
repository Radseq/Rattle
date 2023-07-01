import relativeTime from "dayjs/plugin/relativeTime"
import dayjs from "dayjs"

dayjs.extend(relativeTime)

export type TimeLeft = { days: number; hours: number; minutes: number }

const TOTAL_MINUTES_IN_HOUR = 60
const TOTAL_HOURS_IN_DAY = 24

export const useTimeLeft = (startDate: string | undefined, endDate: string | undefined) => {
	if (!startDate || !endDate) {
		return null
	}

	const endOfPoll = dayjs(endDate)
	const dateToday = dayjs(startDate)

	let minutes = endOfPoll.diff(dateToday, "minutes")
	let hours = Math.floor(minutes / TOTAL_MINUTES_IN_HOUR)
	const days = Math.floor(hours / TOTAL_HOURS_IN_DAY)
	hours = hours - days * TOTAL_HOURS_IN_DAY

	minutes = Math.floor((minutes / TOTAL_MINUTES_IN_HOUR - hours) * 100)

	if (days < 0) {
		return null
	}

	return { days, hours, minutes } as TimeLeft
}
