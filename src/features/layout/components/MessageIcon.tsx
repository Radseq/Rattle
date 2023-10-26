import Image from "next/image"

export const MessageIcon = () => (
	<Image
		width={10}
		height={10}
		src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/mail.svg"
		className="flex w-12 xl:inline "
		alt={"message icon"}
	/>
)
