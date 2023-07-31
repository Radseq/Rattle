import { type FC } from "react"
import { MenuTagItem } from "./MenuTagItem"
import { MenuProfileItem } from "./MenuProfileItem"
import { type SearchResult } from "../types"

export const SearchMenu: FC<{
	searchResult: SearchResult | null | undefined
	onMouseLeave: () => void
}> = ({ searchResult, onMouseLeave }) => {
	return (
		<ul
			className="absolute top-8 z-10  flex-col 
				rounded-lg bg-white shadow-[0px_0px_3px_1px_#00000024]"
			onMouseLeave={onMouseLeave}
		>
			{searchResult?.searchedTags.map((tag) => (
				<MenuTagItem key={tag} tag={tag} />
			))}
			{searchResult?.searchedProfiles.map((profile) => (
				<MenuProfileItem key={profile.id} profile={profile} />
			))}
		</ul>
	)
}
