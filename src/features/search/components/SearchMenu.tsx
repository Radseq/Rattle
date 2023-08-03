import { type FC } from "react"
import { MenuProfileItem } from "./MenuProfileItem"
import { api } from "~/utils/api"
import { useSearchHistory } from "../hooks/useSearchHistory"
import { LoadingSpinner } from "~/components/LoadingPage"
import { ListItem } from "~/components/styledHTMLElements/StyledListItem"

import Link from "next/link"

export const SearchMenu: FC<{
	searchValue: string
}> = ({ searchValue }) => {
	const searchedResult = api.search.getAllUsersAndTags.useQuery(searchValue)

	const searchHistory = useSearchHistory()

	if (searchedResult.isLoading) {
		return (
			<div className="flex w-64 justify-center">
				<LoadingSpinner />
			</div>
		)
	}

	if (!searchedResult.data) {
		return <span>No searched result!</span>
	}

	return (
		<ul>
			{searchedResult.data.searchedTags.map((tag) => (
				<ListItem className="w-64" key={tag}>
					<Link href={`/tag/${tag}`} onClick={() => searchHistory.add(tag)}>
						<span className="inline-block w-64 align-middle leading-10">{`#${tag}`}</span>
					</Link>
				</ListItem>
			))}
			{searchedResult.data.searchedProfiles.map((profile) => (
				<ListItem className="w-64" key={profile.id}>
					<Link href={`/${profile.username}`} onClick={() => searchHistory.add(profile)}>
						<MenuProfileItem key={profile.id} profile={profile} />
					</Link>
				</ListItem>
			))}
		</ul>
	)
}
