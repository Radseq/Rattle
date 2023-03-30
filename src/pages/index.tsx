import { SignIn, SignInButton, SignOutButton, SignUp, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import Head from "next/head"
import Image from "next/image"
import Link from "next/link"
import { use } from "react"

import { api } from "~/utils/api"

const NavigationBar = () => {
	return (
		<ul className="w:48 flex content-center justify-between overflow-hidden">
			<li className="rounded py-2 hover:bg-indigo-300">
				<Link className="truncate" href="#">
					<Image
						width={10}
						height={10}
						src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/home.svg"
						className="mx-4 inline w-7 sm:mx-2"
						alt={"home icon"}
					/>
					<span className="hidden pr-3 sm:inline">Home</span>
				</Link>
			</li>
			<li className="flex w-3/5 rounded py-2 hover:bg-indigo-300">
				<Image
					width={10}
					height={10}
					src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/search.svg"
					className="mx-4 inline w-7 sm:mx-2"
					alt={"search icon"}
				/>
				<input placeholder="Search Post" type="text" className="mr-3 w-full" />
			</li>
			<li className="rounded py-2 hover:bg-indigo-300">
				<Link className="truncate" href="#">
					<Image
						width={10}
						height={10}
						src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/cog.svg"
						className="mx-4 inline w-7 sm:mx-2"
						alt={"cog icon"}
					/>
					<span className="hidden pr-3 sm:inline">Settings</span>
				</Link>
			</li>
		</ul>
	)
}

const Home: NextPage = () => {
	const user = useUser()

	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Rattle" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="m-auto flex justify-center 2xl:w-3/5">
				<div
					className="sticky mr-4 h-full w-full flex-grow border-x-2 
								border-gray-200 p-4 sm:w-full md:w-2/3"
				>
					<NavigationBar />
				</div>
				<div
					className="hidden w-full flex-grow-0 rounded-lg border-2 border-gray-200 
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
				</div>
			</main>
		</>
	)
}

export default Home
