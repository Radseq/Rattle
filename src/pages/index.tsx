import { SignInButton, SignOutButton, SignUp, useUser } from "@clerk/nextjs"
import { type NextPage } from "next"
import Head from "next/head"
import Link from "next/link"

import { api } from "~/utils/api"

const Home: NextPage = () => {
	const user = useUser()

	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Rattle" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<main className="flex min-h-screen flex-col items-center justify-center">
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
				<SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
			</main>
		</>
	)
}

export default Home
