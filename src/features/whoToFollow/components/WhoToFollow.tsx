import Link from "next/link"
import type { PropsWithChildren, FC } from "react"
import { Panel } from "~/components/Panel"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PrimalyButton } from "~/components/styledHTMLElements/StyledButtons"

type User = {
	id: string
	username: string
	fullName: string
	profileImageUrl: string
}

type WhoToFollow = PropsWithChildren & {
	onFollowClick: (id: string) => void
	users: User[]
}

export const WhoToFollow: FC<WhoToFollow> = (props) => {
	return (
		<Panel>
			{props.children}
			<ul className="hover:bg-gray-300">
				{props.users &&
					props.users.map((user) => (
						<li className="p-4">
							<Link href={`/${user.username}`}>
								<ProfileSimple
									profileImageUrl={""}
									fullName={user.fullName}
									username={user.username}
								>
									<div className="m-auto">
										<PrimalyButton onClick={() => props.onFollowClick(user.id)}>
											Follow
										</PrimalyButton>
									</div>
								</ProfileSimple>
							</Link>
						</li>
					))}
			</ul>
			<Link
				className="flex w-full rounded-xl p-4 font-bold text-blue-500 hover:bg-gray-300"
				href={`/trends`}
			>
				Show more
			</Link>
		</Panel>
	)
}
