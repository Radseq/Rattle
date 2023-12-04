import { SignUp, useUser } from "@clerk/nextjs"
import { type PropsWithChildren, type ReactNode } from "react"
import { Panel } from "../../../components/Panel"
import { ProfilePanel } from "~/features/profile"
import { Menu } from "./Menu"
import { SearchInput } from "./SearchInput"

type LayoutProps = PropsWithChildren & {
	rightPanel?: ReactNode | null
	onCreatePostClick?: () => void
}

export const Layout = (props: LayoutProps) => {
	const { user, isSignedIn } = useUser()
	return (
		<div className="flex">
			<div className="m-auto flex">
				<header className="w-16 min-w-[40px] xl:w-72">
					<Menu />
				</header>
				<main className="h-full w-full max-w-3xl grow border-gray-200 sm:mx-1 sm:w-full sm:border-x-2 md:w-2/3 lg:mx-4 lg:p-4">
					{props.children}
				</main>
				<aside className="hidden grow-0 md:block md:w-96">
					<SearchInput />
					<Panel>
						<div className="sticky top-0 w-full md:p-2 lg:p-4">
							{!isSignedIn && (
								<SignUp
									appearance={{
										elements: {
											rootBox: "mx-auto pl-4 max-w-full bg-gray-200",
											card: "p-1 shadow-none max-w-full bg-gray-200",
										},
									}}
								/>
							)}
							{isSignedIn && user.firstName && user.username && (
								<ProfilePanel firstName={user.firstName} username={user.username} />
							)}
						</div>
					</Panel>
					{props.rightPanel}
				</aside>
			</div>
		</div>
	)
}
