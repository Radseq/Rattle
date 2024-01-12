import { type FC, useRef } from "react"
import { useGetPrivateMessagesAuthors } from "../hooks/useGetPrivateMessagesAuthors"
import { LoadingPage } from "~/components/LoadingPage"
import { Person } from "./Person"
import { type Profile } from "~/features/profile"

export const FetchAuthors: FC<{ OnSelectAuthor: (author: Profile) => void }> = ({
	OnSelectAuthor,
}) => {
	const ulRef = useRef<HTMLUListElement>(null)

	const { isLoading, authors, refetch } = useGetPrivateMessagesAuthors(
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop
	)

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<ul className="w-full" ref={ulRef}>
			{authors?.map((author) => (
				<li className="flex py-2" key={author.id} onClick={() => OnSelectAuthor(author)}>
					<Person
						username={author.username}
						fullName={author.fullName}
						profileImageUrl={author.profileImageUrl}
					/>
				</li>
			))}
		</ul>
	)
}
