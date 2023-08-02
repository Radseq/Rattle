import { type FC } from "react"
import { MenuProfileItem } from "./MenuProfileItem"
import { ListItem } from "~/components/styledHTMLElements/StyledListItem"
import { Icon } from "~/components/Icon"
import Link from "next/link"
import type { Profile, SearchResult } from "../types"

const Remove: FC<{ onClick: () => void }> = ({ onClick }) => {
	return (
		<div
			className="flex h-full w-8 justify-center rounded-full hover:bg-gray-200"
			onClick={onClick}
		>
			<Icon iconKind="trash" />
		</div>
	)
}

export const HistorySearchMenu: FC<{
	searchResult: SearchResult
	onRemove: (toDelete: Profile | string) => void
}> = ({ searchResult, onRemove }) => {
	return (
		<ul>
			{searchResult.searchedTags.map((tag) => (
				<ListItem key={tag}>
					<div className="flex w-64">
						<Link href={`/tag/${tag}`}>
							<span className="inline-block w-56 align-middle leading-10">{`#${tag}`}</span>
						</Link>
						<Remove onClick={() => onRemove(tag)} />
					</div>
				</ListItem>
			))}
			{searchResult.searchedProfiles.map((profile) => (
				<ListItem key={profile.id}>
					<div className="flex w-64">
						<Link href={`/${profile.username}`}>
							<MenuProfileItem key={profile.id} profile={profile} />
						</Link>
						<Remove onClick={() => onRemove(profile)} />
					</div>
				</ListItem>
			))}
		</ul>
	)
}
