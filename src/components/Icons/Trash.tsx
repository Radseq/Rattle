import Image from "next/image"

export const Trash = () => {
	return (
		<Image
			width={24}
			height={24}
			src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/trash.svg"
			alt={"trash icon"}
		></Image>
	)
}
