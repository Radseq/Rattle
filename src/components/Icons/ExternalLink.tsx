import Image from "next/image"

export const ExternalLink = () => {
	return (
		<Image
			width={15}
			height={15}
			src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/external-link.svg"
			alt={"external link icon"}
		></Image>
	)
}
