import { SignUp, useUser } from "@clerk/nextjs"
import type { PropsWithChildren, ReactNode } from "react"
import { NavigationBar } from "./NavigationBar"
import { Panel } from "./Panel"
import { ProfilePanel } from "~/features/profile"

type LayoutProps = PropsWithChildren & {
	rightPanel?: ReactNode | null
}

export const Layout = (props: LayoutProps) => {
	const { user, isSignedIn } = useUser()
	return (
		<main className="m-auto flex justify-center 2xl:w-3/5">
			<section
				className="mr-1 h-full w-full grow border-x-2 border-gray-200 
				sm:w-full md:w-2/3 lg:mr-4 lg:p-4"
			>
				<header className="sticky">
					<NavigationBar />
				</header>
				{props.children}
			</section>
			<aside className="hidden grow-0 sm:w-full md:block md:w-1/3">
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
		</main>
	)
}
