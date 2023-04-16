import Link from "next/link"
import Image from "next/image"
import { useUser } from "@clerk/nextjs"

export const NavigationBar = () => {
	const { isSignedIn } = useUser()
	return (
		<ul className="flex content-center justify-between overflow-hidden">
			<li className="rounded py-2 hover:bg-indigo-300">
				<Link className="truncate" href={isSignedIn ? "/home" : "/"}>
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
