import { type GetServerSidePropsContext, type NextPage, type PreviewData } from "next"
import { getAuth } from "@clerk/nextjs/server"
import { Menu } from "~/features/layout/components/Menu"
import { Icon } from "~/components/Icon"
import { FetchAuthors, SelectedAuthorMessages } from "~/features/privateMessagePage"
import { useState } from "react"
import { type Profile } from "~/features/profile"
import { MessageIcon } from "~/features/layout"
import { type ParsedUrlQuery } from "querystring"

export const getServerSideProps = (
	props: GetServerSidePropsContext<ParsedUrlQuery, PreviewData>,
) => {
	const { userId } = getAuth(props.req)

	if (!userId) {
		return {
			redirect: {
				destination: "/signIn",
				permanent: false,
			},
		}
	}

	return {
		props: {},
	}
}

const Messages: NextPage = () => {
	const [selectedAuthor, setSelectedAuthor] = useState<Profile | null>(null)

	return (
		<div className="flex">
			<div className="m-auto flex">
				<header className="sticky top-0 h-screen w-16 min-w-[40px] xl:w-72">
					<Menu />
				</header>
				<main className="size-full min-w-56 max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					<div className="flex justify-between">
						<h1>Messages</h1>
						<div className="flex space-x-2">
							<Icon iconKind="optionDots" />
							<MessageIcon width={25} height={25} />
						</div>
					</div>

					<FetchAuthors OnSelectAuthor={(authorId) => setSelectedAuthor(authorId)} />
				</main>
				<aside className="block size-full min-w-56 max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3  lg:flex lg:p-4">
					{selectedAuthor && (
						<SelectedAuthorMessages
							username={selectedAuthor.username}
							fullName={selectedAuthor.fullName}
							profileImageUrl={selectedAuthor.profileImageUrl}
							authorId={selectedAuthor.id}
						/>
					)}
				</aside>
			</div>
		</div>
	)
}

export default Messages
