import { type FC, useRef, useState } from "react"
import { useGetPrivateMessagesAuthors } from "../hooks/useGetPrivateMessagesAuthors"
import { LoadingPage } from "~/components/LoadingPage"
import { Person } from "./Person"
import { type Profile } from "~/features/profile"
import { SearchForm } from "./SearchForm"

export const FetchAuthors: FC<{
	OnSelectAuthor: (author: Profile) => void
	initProfile?: Profile
}> = ({ OnSelectAuthor, initProfile }) => {
	const ulRef = useRef<HTMLUListElement>(null)
	const [searchValue, setSearchValue] = useState("")

	const { isLoading, authors } = useGetPrivateMessagesAuthors(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop,
		searchValue,
	)

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	const initExists = authors?.some((a) => a.id === initProfile?.id)

	return (
		<div className="w-full">
			<SearchForm
				onSearchClick={() => {}}
				onChangeSearchInput={(message) => setSearchValue(message)}
			/>

			<ul className="w-full" ref={ulRef}>
				{initProfile && !initExists && (
					<div onClick={() => OnSelectAuthor(initProfile)}>
						<Person
							username={initProfile.username}
							fullName={initProfile.fullName}
							profileImageUrl={initProfile.profileImageUrl}
						/>
					</div>
				)}
				{authors?.map((author) => (
					<li
						className="flex py-2"
						key={author.id}
						onClick={() => OnSelectAuthor(author)}
					>
						<Person
							username={author.username}
							fullName={author.fullName}
							profileImageUrl={author.profileImageUrl}
						/>
					</li>
				))}
			</ul>
		</div>
	)
}
