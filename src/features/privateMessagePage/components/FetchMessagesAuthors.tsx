import { useRef } from "react"
import { useGetPrivateMessagesAuthors } from "../hooks/useGetPrivateMessagesAuthors"
import { LoadingPage } from "~/components/LoadingPage"
import { Person } from "./Person"

export const FetchMessagesAuthors = () => {
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
		<ul ref={ulRef}>
			{authors?.map((author) => (
				<li className="flex py-2">
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
