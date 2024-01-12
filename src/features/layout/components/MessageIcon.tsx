import Image from "next/image"
import { type FC } from "react"

export const MessageIcon: FC<{ width: number; height: number }> = ({ height = 10, width = 10 }) => (
	<Image
		width={width}
		height={height}
		className="flex xl:inline"
		src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/mail.svg"
		alt={"message icon"}
	/>
)
