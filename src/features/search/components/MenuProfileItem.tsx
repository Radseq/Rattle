import { type FC } from "react"
import { type Profile } from "../types"
import { ProfileAvatarImageUrl } from "~/features/profile"

export const MenuProfileItem: FC<{
	profile: Profile
}> = ({ profile }) => {
	return (
		<div className="w-56">
			<div className="flex h-16">
				<ProfileAvatarImageUrl className="size-12 rounded-full" src={profile.imageUrl} />
				<div className="ml-2 mt-1 flex w-full flex-col">
					<div className="h-5 font-bold">{profile.fullName}</div>
					<div className="text-gray-500">{`@${profile.username}`}</div>
				</div>
			</div>
		</div>
	)
}
