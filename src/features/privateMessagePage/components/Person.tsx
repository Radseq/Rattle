import Link from "next/link"
import { type FC } from "react"
import { ProfileAvatarImageUrl } from "~/features/profile"

export const Person: FC<{ username: string; fullName: string; profileImageUrl: string }> = ({
	username,
	fullName,
	profileImageUrl,
}) => {
	return (
		<div className="flex">
			<ProfileAvatarImageUrl src={profileImageUrl} />
			<div className="w-full pl-2">
				<div className="text-lg font-semibold">
					<span className="pr-1">{`${fullName}`}</span>
					<span>
						<Link
							onClick={(e) => e.stopPropagation()}
							href={`/${username}`}
						>{`@${username}`}</Link>
					</span>
					<span className="p-1 text-slate-400">·</span>
				</div>
			</div>
		</div>
	)
}
