import type { GetServerSideProps, NextPage } from "next"
import { getProfileByUserId } from "~/server/api/profile"
import { useState } from "react"
import { type Profile } from "~/features/profile"
import { MessageIcon } from "~/features/layout"
import { getAuth } from "@clerk/nextjs/server"
import { Icon } from "~/components/Icon"
import { Menu } from "~/features/layout/components/Menu"
import { FetchAuthors, Search, SelectedAuthorMessages } from "~/features/privateMessagePage"

export const getServerSideProps: GetServerSideProps = async (props) => {
	const { userId } = getAuth(props.req)

	if (!userId) {
		return {
			redirect: {
				destination: "/signIn",
				permanent: false,
			},
		}
	}

	const messageToUserId = props.params?.userId as string | null

	if (!messageToUserId) {
		return {
			redirect: {
				destination: "/home",
				permanent: false,
			},
		}
	}

	const messageToProfile = await getProfileByUserId(messageToUserId)

	if (!messageToProfile) {
		return {
			redirect: {
				destination: "/home",
				permanent: false,
			},
		}
	}

	return {
		props: {
			messageToProfile,
		},
	}
}

const MessagesLink: NextPage<{
	messageToProfile: Profile
}> = ({ messageToProfile }) => {
	const [selectedAuthor, setSelectedAuthor] = useState<Profile>(messageToProfile)

	return (
		<div className="flex">
			<div className="m-auto flex">
				<header className="sticky top-0 h-screen w-16 min-w-[40px] xl:w-72">
					<Menu />
				</header>
				<main className="size-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					<div className="flex justify-between">
						<h1>Messages</h1>
						<div className="flex space-x-2">
							<Icon iconKind="optionDots" />
							<MessageIcon width={25} height={25} />
						</div>
					</div>
					<div className="w-full">
						<Search />
						<FetchAuthors
							initProfile={selectedAuthor}
							OnSelectAuthor={(authorId) => setSelectedAuthor(authorId)}
						/>
					</div>
				</main>
				<aside className="block size-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3  lg:flex lg:p-4">
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

export default MessagesLink
