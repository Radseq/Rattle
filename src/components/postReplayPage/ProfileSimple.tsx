import type { FC } from "react"
import Image from "next/image"

export const ProfileSimple: FC<{ profileImageUrl: string; fullName: string; username: string }> = ({
	profileImageUrl,
	fullName,
	username,
}) => {
	return (
		<div className="flex h-16">
			<img className="w-16" src={profileImageUrl} alt="avatar url" />
			<div className="ml-2 mt-1 flex w-10/12 flex-col">
				<div className="h-5 font-bold">{fullName}</div>
				<div className="text-md">{`@${username}`}</div>
			</div>
			<div className="flex h-12 w-1/12 justify-center rounded-full hover:bg-gray-200">
				{/* todo use icon from other branch */}
				<Image
					width={15}
					height={15}
					src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/dots-horizontal.svg"
					alt={"option icon"}
				></Image>
			</div>
		</div>
	)
}
