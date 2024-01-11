import { type GetServerSideProps, type NextPage } from "next"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import { Menu } from "~/features/layout/components/Menu"
import { Icon } from "~/components/Icon"
import { MessageIcon } from "~/features/layout/components/MessageIcon"
import { getFullName } from "~/utils/helpers"
import { Picture } from "~/components/Icons/Picture"
import { Emoji } from "~/components/Icons/Emoji"
import {
	FetchMessagesAuthors,
	MessageItem,
	Person,
	Search,
} from "~/features/privateMessagePage"

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

	const user = await clerkClient.users.getUser(userId)

	return {
		props: {
			user: JSON.parse(JSON.stringify(user)) as User,
		},
	}
}

const Messages: NextPage<{ user: User }> = ({ user }) => {
	const fullName = getFullName(user.firstName, user.lastName)

	return (
		<div className="flex">
			<div className="m-auto flex">
				<header className="sticky top-0 h-screen w-16 min-w-[40px] xl:w-72">
					<Menu />
				</header>
				<main className="h-full w-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					<div className="flex justify-between">
						<h1>Messages</h1>
						<div className="flex space-x-2">
							<Icon iconKind="optionDots" />
							<MessageIcon width={25} height={25} />
						</div>
					</div>
					<div className="w-96">
						<Search />
						<FetchMessagesAuthors />
					</div>
				</main>
				<aside className="h-full w-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					<Person
						username={user.username ?? ""}
						fullName={fullName ?? ""}
						profileImageUrl={user.profileImageUrl}
					/>
					<ul>
						<MessageItem message={"test message"} />
					</ul>
					<div className="flex gap-1 rounded-xl bg-slate-300 pl-1">
						<Picture />
						<Emoji />
						<textarea
							className="text-wrap block h-full w-full overflow-hidden bg-transparent p-2 pl-2 text-sm text-gray-900 focus:outline-none"
							placeholder="Start a new message"
							required
						/>
					</div>
				</aside>
			</div>
		</div>
	)
}

export default Messages
