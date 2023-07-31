import { FC } from "react"
import { ListItem } from "~/components/styledHTMLElements/StyledListItem"
import { Profile } from "../types"
import Link from "next/link"
import { Icon } from "~/components/Icon"
import { ProfileAvatarImageUrl } from "~/components/profile/ProfileAvatarImageUrl"

export const OverlayProfileItem: FC<{ profile: Profile }> = ({ profile }) => {
	return (
		<ListItem>
			<Link className="w-56" href={`/${profile.username}`}>
				<div className="flex h-16">
					<ProfileAvatarImageUrl
						className="h-12 w-12 rounded-full"
						src={profile.imageUrl}
					/>
					<div className="ml-2 mt-1 flex w-full flex-col">
						<div className="h-5 font-bold">{profile.fullName}</div>
						<div className="text-gray-500">{`@${profile.username}`}</div>
					</div>
				</div>
			</Link>
			<div className="flex h-10 w-10 justify-center rounded-full hover:bg-gray-200">
				<Icon iconKind="trash" />
			</div>
		</ListItem>
	)
}
