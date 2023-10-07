import { Panel } from "~/components/Panel"
import { useGetTrends } from "../hooks"
import { type FC } from "react"

const TrendPanel: FC<{
	trends: {
		word: string
		postsCount: number
	}[]
}> = ({ trends }) => {
	return (
		<Panel>
			<h1>World Trends</h1>
		</Panel>
	)
}

export const Trends = () => {
	const trends = useGetTrends()
	if (!trends) {
		return null
	}

	return <TrendPanel trends={trends } />
}
