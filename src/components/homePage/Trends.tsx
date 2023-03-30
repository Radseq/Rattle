import { FC } from "react"
import { Trend } from "./types"
import Image from "next/image"

const TrendItem: FC<{ trend: Trend }> = ({ trend }) => {
	return (
		<li className="flex justify-between rounded-lg p-2 hover:bg-gray-100 ">
			<div className="">
				<div className="text-slate-500">{trend.categoryRegional && "Most popular in " + trend.categoryName}</div>
				<div className="text-md font-semibold">{trend.name}</div>
				{trend.tweetCount && <div className="text-slate-500">Rattles: {trend.tweetCount}</div>}
			</div>
			<div className="flex h-12 w-12 justify-center rounded-full hover:bg-gray-200">
				<Image
					width={15}
					height={15}
					src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/dots-horizontal.svg"
					alt={"icon"}
				></Image>
			</div>
		</li>
	)
}

export const Trends: FC<{ items: Trend[] }> = ({ items }) => {
	return (
		<div className="pt-2">
			<h1 className="p-2 text-2xl font-semibold">Most popular for you</h1>
			<ul>
				{items.map((trendItem) => (
					<TrendItem trend={trendItem} key={trendItem.name} />
				))}
			</ul>
		</div>
	)
}
