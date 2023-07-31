import { type FC } from "react"
import { OverlayTagItem } from "./OverlayTagItem"
import { OverlayProfileItem } from "./OverlayProfileItem"
import { SearchResult } from "../types"

export const SearchOverlay: FC<{ searchResult: SearchResult }> = ({ searchResult }) => {
	return (
		<ul
			className="absolute top-8 z-10 flex-col rounded-lg 
				bg-white shadow-[0px_0px_3px_1px_#00000024] group-hover:flex"
		>
			{searchResult?.searchedTags.map((tag) => (
				<OverlayTagItem key={tag} tag={tag} />
			))}
			{searchResult?.searchedProfiles.map((profile) => (
				<OverlayProfileItem key={profile.id} profile={profile} />
			))}
		</ul>
	)
}
