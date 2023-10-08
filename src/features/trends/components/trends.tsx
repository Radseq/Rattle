import { Panel } from "~/components/Panel"
import { useGetTrends } from "../hooks"
import { type FC } from "react"
import Link from "next/link"

const TrendItem: FC<{ trend: { word: string; postsCount: number } }> = ({ trend }) => (
	<li className="px-4 py-2 hover:bg-gray-300">
		<Link href={""}>
			<article>
				<div>
					<h4 className="font-bold first-letter:uppercase">{trend.word}</h4>
				</div>
				<div>{trend.postsCount} posts</div>
			</article>
		</Link>
	</li>
)

const TrendPanel: FC<{
	trends: {
		word: string
		postsCount: number
	}[]
}> = ({ trends }) => (
	<Panel>
		<h1 className="p-2 text-2xl font-semibold">World Trends</h1>
		<ul>
			{trends.map((trend, ind) => {
				return <TrendItem key={ind} trend={trend} />
			})}
		</ul>
	</Panel>
)

export const Trends = () => {
	const trends = useGetTrends()
	if (!trends.length) {
		return null
	}

	return <TrendPanel trends={trends} />
}
