import Image from "next/image"

export const Emoji = () => {
	return (
		<Image
			width={24}
			height={24}
			src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/emoji-happy.svg"
			alt={"emoji"}
		></Image>
	)
}
