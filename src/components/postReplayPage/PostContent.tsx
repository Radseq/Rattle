import type { FC } from "react"
import { useNumberFormatter } from "~/hooks/useNumberFormatter"

export const PostContent: FC<{ postCreateDate: string; message: string }> = ({
	postCreateDate,
	message,
}) => {
	const viewCount = useNumberFormatter(58400)

	return (
		<div className="mt-2 ml-2">
			<span className="">{message}</span>
			<div className="mt-4 text-gray-500">
				<span>{postCreateDate}</span>
				<span className="m-1">·</span>
				<span className="font-bold text-black">{viewCount}</span>
				<span className="ml-1">Views</span>
			</div>
		</div>
	)
}
