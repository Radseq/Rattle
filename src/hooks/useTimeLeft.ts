export type TimeLeft = { days: number; hours: number; minutes: number }

const createOngoingTimer = (timeLeft: number): TimeLeft => ({
	days: Math.ceil(timeLeft / (1000 * 3600 * 24)),
	hours: Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
	minutes: Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60)),
	//seconds: Math.floor((timeLeft % (1000 * 60)) / 1000),
})

const calculateTimeLeft = (targetTimestamp: number, currentTimestamp = Date.now()): number =>
	targetTimestamp - currentTimestamp

export const useTimeLeft = (startDate: string | undefined, endDate: string | undefined) => {
	if (!startDate || !endDate) {
		return null
	}

	const timeLeft = calculateTimeLeft(Date.parse(endDate))

	return createOngoingTimer(timeLeft)
}
