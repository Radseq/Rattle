import { SignOutButton, SignUp, useUser } from "@clerk/nextjs"
import type { PropsWithChildren } from "react"
import { NavigationBar } from "./NavigationBar"

export const Layout = (props: PropsWithChildren) => {
	const { user, isSignedIn } = useUser()
	return (
		<div className="m-auto flex justify-center 2xl:w-3/5">
			<main
				className="h-full w-full flex-grow border-x-2 border-gray-200 sm:w-full 
								 md:mr-4 md:w-2/3 lg:p-4"
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
					{isSignedIn && (
						<div>
							<h1 className="p-2 text-2xl font-semibold">Hello {user.firstName}</h1>
							<SignOutButton>
								<span
									className="flex justify-center rounded border border-gray-500 bg-transparent 
							py-2 px-4 font-semibold text-gray-700 hover:border-transparent 
							hover:bg-gray-500 hover:text-white"
								>
									Sign Out
								</span>
							</SignOutButton>
						</div>
					)}
				</div>
			</aside>
		</div>
	)
}
