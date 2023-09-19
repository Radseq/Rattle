import type { NextPage } from "next"
import { useRouter } from "next/router"
import { useState } from "react"

import { Layout } from "~/components/Layout"
import { LatestPosts, Peoples, TabSelectorItem } from "~/features/hashTagPage"

const HashTag: NextPage = () => {
	const router = useRouter()

	const hashTag = (router.query.hashTag as string) || ""
	const [selectedTab, setSelectedTab] = useState(0)
	return (
		<Layout>
			<section>
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
				{selectedTab === 0 && hashTag && (
					<div>
						<Peoples tag={hashTag} />
						<LatestPosts tag={hashTag} />
					</div>
				)}
			</section>
		</Layout>
	)
}

const SelectedTabMark = () => {
	return <div className="rounded-lg border-b-4 border-blue-600"></div>
}

export default HashTag
