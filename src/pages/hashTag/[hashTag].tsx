import type { GetServerSideProps, NextPage } from "next"
import Link from "next/link"
import { useState } from "react"

import { Layout } from "~/components/Layout"
import { TabSelectorItem, TopTab } from "~/features/hashTagPage"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const hashTag = props.params?.hashTag as string
	console.log(props.params)

	return {
		props: { hashTag },
	}
}

const HashTag: NextPage<{
	hashTag: string
}> = ({ hashTag }) => {
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
				{selectedTab === 0 && <TopTab />}
			</section>
		</Layout>
	)
}

const SelectedTabMark = () => {
	return <div className="rounded-lg border-b-4 border-blue-600"></div>
}

export default HashTag
