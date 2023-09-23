import type { NextPage } from "next"
import { useRouter } from "next/router"
import { type FC, useState } from "react"

import { Layout } from "~/components/Layout"
import { LatestPosts, Peoples, TabSelectorItem } from "~/features/hashTagPage"

const TOP_TAB_INDEX = 0
const LATEST_POSTS_TAB_INDEX = 1
const PEOPLES_TAB_INDEX = 2

const HashTag: NextPage = () => {
	const router = useRouter()

	const hashTag = (router.query.hashTag as string) || ""
	const [selectedTab, setSelectedTab] = useState(0)
	return (
		<Layout>
			<div>
				<header className="flex justify-between font-bold text-gray-500">
					<TabSelectorItem onClick={() => setSelectedTab(0)} name="Top">
						{selectedTab === 0 && <SelectedTabMark />}
					</TabSelectorItem>
					<TabSelectorItem onClick={() => setSelectedTab(1)} name="Latest">
						{selectedTab === 1 && <SelectedTabMark />}
					</TabSelectorItem>
					<TabSelectorItem onClick={() => setSelectedTab(2)} name="People">
						{selectedTab === 2 && <SelectedTabMark />}
					</TabSelectorItem>
				</header>
				<hr className="mb-2" />
				{hashTag && <TabContentSelector hashTag={hashTag} selectedTab={selectedTab} />}
			</div>
		</Layout>
	)
}

const TabContentSelector: FC<{ selectedTab: number; hashTag: string }> = ({
	selectedTab,
	hashTag,
}) => {
	switch (selectedTab) {
		case TOP_TAB_INDEX:
			return (
				<div>
					<Peoples tag={hashTag} />
					<LatestPosts tag={hashTag} />
				</div>
			)
		case LATEST_POSTS_TAB_INDEX:
			return <LatestPosts tag={hashTag} />
		case PEOPLES_TAB_INDEX:
			return <Peoples tag={hashTag} />
		default:
			return null
	}
}

const SelectedTabMark = () => {
	return <div className="rounded-lg border-b-4 border-blue-600"></div>
}

export default HashTag
