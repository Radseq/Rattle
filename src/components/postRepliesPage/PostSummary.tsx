import dayjs from "dayjs"
import type { FC } from "react"
import { useNumberFormatter } from "~/hooks/useNumberFormatter"

export const PostSummary: FC<{ postCreateDate: Date }> = ({ postCreateDate }) => {
	// todo pass viewCount
	const viewCount = useNumberFormatter(58400)

	return (
		<div className="mt-4 text-gray-500">
			<span>{dayjs(postCreateDate).toString()}</span>
			<span className="m-1">·</span>
			<span className="font-bold text-black">{viewCount}</span>
			<span className="ml-1">Views</span>
		</div>
	)
}
