import Link from "next/link"
import { type FC, useState } from "react"
import { HomeIcon } from "./HomeIcon"
import { MenuItem } from "./MenuItem"
import { MessageIcon } from "./MessageIcon"
import { AddPostIcon } from "./AddPostIcon"
import { Dialog } from "~/components/dialog/Dialog"
import { useUser } from "@clerk/nextjs"
import { ConnectorCreatePost } from "~/features/homePage"

export const Menu: FC<{ onCreatePostClick?: () => void }> = ({ onCreatePostClick }) => {
	const { user, isSignedIn } = useUser()
	const homeUrl = isSignedIn ? "/home" : "/"
	const [quotePopUp, setQuotePopUp] = useState(false)

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
			<MenuItem onClick={() => setQuotePopUp(true)}>
				<div>
					<AddPostIcon />
					<span className="my-auto hidden cursor-pointer xl:inline">New post</span>
				</div>
			</MenuItem>

			{quotePopUp && isSignedIn && (
				<Dialog open={isSignedIn ?? false} onClose={() => setQuotePopUp(false)}>
					<ConnectorCreatePost
						refetch={() => {
							onCreatePostClick && onCreatePostClick()
						}}
						profileImageUrl={user.profileImageUrl}
					/>
				</Dialog>
			)}
		</ul>
	)
}
