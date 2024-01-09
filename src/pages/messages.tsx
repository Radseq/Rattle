import { type GetServerSideProps, type NextPage } from "next"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import { Layout } from "~/features/layout"
import { Menu } from "~/features/layout/components/Menu"
import { Icon } from "~/components/Icon"
import { AddPostIcon } from "~/features/layout/components/AddPostIcon"
import { MessageIcon } from "~/features/layout/components/MessageIcon"
import { PostTitle } from "~/features/postItem"
import { ProfileAvatarImageUrl } from "~/features/profile"
import Link from "next/link"
import { getFullName } from "~/utils/helpers"
import { Picture } from "~/components/Icons/Picture"
import { Emoji } from "~/components/Icons/Emoji"

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
						<form className="flex items-center">
							<label className="sr-only">Search</label>
							<div className="relative w-full">
								<div className="start-0 pointer-events-none absolute inset-y-0 flex items-center p-2">
									<svg
										className="h-4 w-4 text-gray-500 dark:text-gray-400"
										aria-hidden="true"
										xmlns="http://www.w3.org/2000/svg"
										fill="none"
										viewBox="0 0 20 20"
									>
										<path
											stroke="currentColor"
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth="2"
											d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
										/>
									</svg>
								</div>
								<input
									type="text"
									id="simple-search"
									className=" block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 pl-7 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500  "
									placeholder="Search..."
									required
								/>
							</div>
							<button
								type="submit"
								className="ms-2 rounded-lg border border-blue-700 bg-blue-700 p-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 "
							>
								<svg
									className="h-4 w-4"
									aria-hidden="true"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 20 20"
								>
									<path
										stroke="currentColor"
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
									/>
								</svg>
								<span className="sr-only">Search</span>
							</button>
						</form>
						<ul>
							<li className="flex py-2">
								<ProfileAvatarImageUrl src={user.profileImageUrl} />
								<div className="w-full pl-2">
									<div className="text-lg font-semibold">
										<span className="pr-1">{`${fullName}`}</span>
										<span>
											<Link
												onClick={(e) => e.stopPropagation()}
												href={`/${user.username}`}
											>{`@${user.username}`}</Link>
										</span>
										<span className="p-1 text-slate-400">·</span>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</main>
				<aside className="h-full w-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					<div className="flex w-96">
						<ProfileAvatarImageUrl src={user.profileImageUrl} />
						<div className="w-full pl-2">
							<div className="text-lg font-semibold">
								<span className="pr-1">{`${fullName}`}</span>
								<span>
									<Link
										onClick={(e) => e.stopPropagation()}
										href={`/${user.username}`}
									>{`@${user.username}`}</Link>
								</span>
								<span className="p-1 text-slate-400">·</span>
							</div>
						</div>
					</div>
					<ul>
						<li className="my-2 rounded-full bg-slate-100 p-2">
							<div>Message</div>
						</li>
					</ul>
					<div className="flex gap-1 rounded-full bg-slate-300 pl-1">
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
