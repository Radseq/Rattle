import { SignInButton, SignOutButton, useUser } from "@clerk/nextjs"
import type { PropsWithChildren } from "react"
import { NavigationBar } from "./homePage/NavigationBar"

export const Layout = (props: PropsWithChildren) => {
	const user = useUser()
	return (
		<div className="m-auto flex justify-center 2xl:w-3/5">
			<main
				className="h-full w-full flex-grow border-x-2 border-gray-200 p-4 
								sm:w-full md:mr-4 md:w-2/3"
			>
				<header className="sticky">
					<NavigationBar />
				</header>
				{props.children}
			</main>
			<aside
				className="sticky hidden w-full flex-grow-0 rounded-lg border-2 border-gray-200 
									sm:w-full md:block md:w-1/3"
			>
				<div className="sticky w-full rounded-xl p-4">
					{!user.isSignedIn && (
						<div>
							<SignInButton />
						</div>
					)}
					{user.isSignedIn && (
						<div>
							<SignOutButton />
						</div>
					)}
				</div>
			</aside>
		</div>
	)
}
