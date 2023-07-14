import type { FC } from "react"
import Image from "next/image"

export const ProfileAvatarImageUrl: FC<{ url: string }> = ({ url }) => (
	<Image
		className="h-16 w-16 rounded-full"
		src={url}
		alt={"avatar"}
		width={128}
		height={128}
	></Image>
)
