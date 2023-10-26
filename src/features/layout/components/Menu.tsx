import Link from "next/link"
import { type FC } from "react"
import { HomeIcon } from "./HomeIcon"
import { MenuItem } from "./MenuItem"
import { MessageIcon } from "./MessageIcon"

export const Menu: FC<{ isSignedIn: boolean }> = ({ isSignedIn }) => {
	const homeUrl = isSignedIn ? "/home" : "/"
	return (
		<ul className="my-2 rounded-xl border bg-gray-200">
			<MenuItem>
				<Link href={homeUrl}>
					<HomeIcon />
					<span className="my-auto hidden xl:inline">Home</span>
				</Link>
			</MenuItem>
			<MenuItem>
				<Link href={"/messages"}>
					<MessageIcon />
					<span className="my-auto hidden xl:inline">Messages</span>
				</Link>
			</MenuItem>
		</ul>
	)
}
