import type { FC } from "react"
import { Icon } from "../Icon"
import { ProfileAvatarImageUrl } from "../profile/ProfileAvatarImageUrl"

export const ProfileSimple: FC<{ profileImageUrl: string; fullName: string; username: string }> = ({
	profileImageUrl,
	fullName,
	username,
}) => {
	return (
		<div className="flex h-16">
			<ProfileAvatarImageUrl src={profileImageUrl} />
			<div className="ml-2 mt-1 flex w-10/12 flex-col">
				<div className="h-5 font-bold">{fullName}</div>
				<div className="">{`@${username}`}</div>
			</div>
			<div className="flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
				<Icon iconKind="optionDots" />
			</div>
		</div>
	)
}
