import Link from "next/link"
import type { FC, PropsWithChildren } from "react"
import { Panel } from "~/components/Panel"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PrimalyButton } from "~/components/styledHTMLElements/StyledButtons"
import { type UserToFollow } from "../types"

type WhoToFollow = PropsWithChildren & {
	onFollowClick: (id: string) => void
	users: UserToFollow[]
}

export const WhoToFollow: FC<WhoToFollow> = (props) => {
	return (
		<Panel>
			{props.children}
			<ul className="hover:bg-gray-300">
				{props.users &&
					props.users.map((user) => (
						<li key={user.id} className="flex p-4">
							<Link className="w-full" href={`/${user.username}`}>
								<ProfileSimple
									profileImageUrl={user.profileImageUrl}
									fullName={user.fullName}
									username={user.username}
								></ProfileSimple>
							</Link>
							<div className="m-auto">
								<PrimalyButton
									onClick={(e) => {
										e.stopPropagation()
										props.onFollowClick(user.id)
									}}
								>
									Follow
								</PrimalyButton>
							</div>
						</li>
					))}
			</ul>
			<Link
				className="flex w-full rounded-xl p-4 font-bold text-blue-500 hover:bg-gray-300"
				href={"/trends"}
			>
				Show more
			</Link>
		</Panel>
	)
}
