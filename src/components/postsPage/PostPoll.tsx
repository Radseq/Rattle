import { type FC } from "react"
import { type Poll } from "./types"
import { percentageOfTotalValue } from "~/utils/helpers"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { type TimeLeft } from "~/hooks/useTimeLeft"
dayjs.extend(relativeTime)

const printTime = (word: "day" | "hour" | "minute", value: number) => {
	if (value < 1) {
		return ""
	}

	return `${value} ${word}${value > 1 ? "s" : ""}`
}

export const PostPoll: FC<{ poll: Poll; pollTimeLeft: TimeLeft | null; pollEndTime: string }> = ({
	poll,
	pollTimeLeft,
	pollEndTime,
}) => {
	const totalVotes = poll.userVotes.reduce((init, next) => init + next.voteCount, 0)

	return (
		<div className="w-full">
			{poll.userVotes.map((vote) => {
				return (
					<div key={vote.id} className="flex w-full">
						<div className="m-2 w-11/12">
							<div className="rounded-md bg-slate-400">
								<span className="p-1">{vote.voteCount}</span>
							</div>
						</div>
						<div className="m-auto w-1/12">
							<span>{percentageOfTotalValue(vote.voteCount, totalVotes)}%</span>
						</div>
					</div>
				)
			})}
			<div>
				<span>{totalVotes} votes</span>
				<span className="m-1">·</span>
				{pollTimeLeft ? (
					<span>
						{`${printTime("day", pollTimeLeft.days)}${
							pollTimeLeft.hours > 0 ? ", " : " "
						}
						${printTime("hour", pollTimeLeft.hours)}, 
						${printTime("minute", pollTimeLeft.minutes)} `}
						left
					</span>
				) : (
					<span>{dayjs(pollEndTime).fromNow()}</span>
				)}
			</div>
		</div>
	)
}
