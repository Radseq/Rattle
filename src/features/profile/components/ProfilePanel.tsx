import { SignOutButton } from "@clerk/nextjs"
import Link from "next/link"
import { type FC } from "react"

export const ProfilePanel: FC<{ username: string; firstName: string }> = ({
	username,
	firstName,
}) => {
	return (
		<div>
			<h1 className="px-2 pb-2 text-2xl font-semibold">Hello {firstName}</h1>
			<Link
				href={username ? `/${username}` : "/"}
				className="mb-2 flex justify-center rounded border 
                border-gray-500 bg-transparent py-2 px-4 font-semibold 
                text-gray-700 hover:border-transparent hover:bg-gray-500 
                hover:text-white"
			>
				Profile
			</Link>
			<SignOutButton>
				<span
					className="flex justify-center rounded border 
                    border-gray-500 bg-transparent py-2 px-4 font-semibold 
                    text-gray-700 hover:border-transparent hover:bg-gray-500 
                    hover:text-white"
				>
					Sign Out
				</span>
			</SignOutButton>
		</div>
	)
}
