import Link from "next/link"
import { useState } from "react"
import { HomeIcon } from "./HomeIcon"
import { MenuItem } from "./MenuItem"
import { MessageIcon } from "./MessageIcon"
import { AddPostIcon } from "./AddPostIcon"
import { Dialog } from "~/components/dialog/Dialog"
import { useUser } from "@clerk/nextjs"
import { CreatePost } from "~/features/homePage"

export const Menu = () => {
	const { user, isSignedIn } = useUser()
	const homeUrl = isSignedIn ? "/home" : "/"
	const [quotePopUp, setQuotePopUp] = useState(false)

	return (
		<ul className="my-2 rounded-xl border bg-gray-200">
			<MenuItem>
				<Link href={homeUrl} className="w-full p-2">
					<HomeIcon />
					<span className="my-auto hidden xl:inline">Home</span>
				</Link>
			</MenuItem>
			<MenuItem>
				<Link href={"/messages"} className="flex p-2">
					<MessageIcon width={48} height={48} />
					<span className="my-auto hidden xl:inline">Messages</span>
				</Link>
			</MenuItem>
			<MenuItem onClick={() => setQuotePopUp(true)}>
				<div className="w-full p-2">
					<AddPostIcon />
					<span className="my-auto hidden cursor-pointer xl:inline">New post</span>
				</div>
			</MenuItem>

			{quotePopUp && isSignedIn && (
				<Dialog open={isSignedIn ?? false} onClose={() => setQuotePopUp(false)}>
					<CreatePost profileImageUrl={user.profileImageUrl} />
				</Dialog>
			)}
		</ul>
	)
}
