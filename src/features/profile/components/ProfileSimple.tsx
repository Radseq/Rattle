import type { FC, PropsWithChildren } from "react"
import { ProfileAvatarImageUrl } from "~/features/profile"

type ProfileSimple = PropsWithChildren & {
	profileImageUrl: string
	fullName: string
	username: string
}

export const ProfileSimple: FC<ProfileSimple> = ({
	profileImageUrl,
	fullName,
	username,
	children,
}) => {
	return (
		<div className="flex h-16">
			<ProfileAvatarImageUrl src={profileImageUrl} />
			<div className="ml-2 mt-1 flex w-10/12 flex-col">
				<div className="h-5 font-bold">{fullName}</div>
				<div className="">{`@${username}`}</div>
			</div>
			{children}
		</div>
	)
}
