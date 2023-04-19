import Image from "next/image"

export const Trash = () => {
	return (
		<Image
			width={15}
			height={15}
			src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/trash.svg"
			alt={"trash icon"}
		></Image>
	)
}
