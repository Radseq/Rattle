import Image, { type ImageProps as NextJsImageProps } from "next/image"

type ImageProps = Omit<NextJsImageProps, "alt"> & {
	size?: number
	alt?: string
}

export const ProfileAvatarImageUrl = (props: ImageProps) => {
	const styledClassName = props.className ? props.className : "h-16 w-16 rounded-full"
	const width = props.size ?? props.width
	const height = props.size ?? props.height
	return (
		<Image
			{...props}
			className={styledClassName}
			src={props.src}
			alt={props.alt ?? "avatar"}
			width={width ?? 128}
			height={height ?? 128}
		/>
	)
}
