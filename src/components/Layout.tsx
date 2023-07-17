import { SignUp, useUser } from "@clerk/nextjs"
import type { PropsWithChildren, ReactNode } from "react"
import { NavigationBar } from "./NavigationBar"
import { ProfilePanel } from "./profile/ProfilePanel"
import { Panel } from "./Panel"

type LayoutProps = PropsWithChildren & {
	rightPanel?: ReactNode | null
}

export const Layout = (props: LayoutProps) => {
	const { user, isSignedIn } = useUser()
	return (
		<div className="m-auto flex justify-center 2xl:w-3/5">
			<main
				className="h-full w-full grow border-x-2 border-gray-200 sm:w-full 
								 md:mr-4 md:w-2/3 lg:p-4"
			>
				<header className="sticky">
					<NavigationBar />
				</header>
				{props.children}
			</main>
			<aside className="hidden grow-0 sm:w-full md:block md:w-1/3">
				<Panel>
					<div className="sticky top-0 w-full p-4">
						{!isSignedIn && (
							<SignUp
								appearance={{
									elements: {
										rootBox: "mx-auto pl-4 max-w-full",
										card: "p-1 shadow-none max-w-full",
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
	)
}
