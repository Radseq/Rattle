import { type FC, useState } from "react"
import { PrimalyButton } from "../styledHTMLElements/StyledButtons"
import { LoadingSpinner } from "../LoadingPage"
import Image from "next/image"
import { Icon } from "../Icon"

type PoolLength = {
	days: number
	hours: number
	minutes: number
}

type Pool = {
	choise: string[]
	length: PoolLength
}

type PostContent = {
	message: string
	pool?: Pool
}

export const HomeCreatePost: FC<{
	onCreatePost: (message: string) => void
	isCreating: boolean
	profileImageUrl: string
	placeholderMessage: string
}> = ({ onCreatePost, isCreating, profileImageUrl, placeholderMessage }) => {
	const [postContent, setPostContent] = useState<PostContent>()

	if (isCreating) {
		return (
			<div className="flex justify-center">
				<LoadingSpinner size={50} />
			</div>
		)
	}

	return (
		<div className="flex">
			<Image
				className="h-16 w-16 rounded-full"
				src={profileImageUrl}
				alt={"avatar"}
				width={128}
				height={128}
			></Image>
			<div className="w-full pl-1">
				<header className="flex ">
					<input
						className="w-full rounded-xl border-2 border-solid p-1 text-lg outline-none"
						placeholder={placeholderMessage}
						onChange={(e) =>
							setPostContent({ ...postContent, message: e.target.value })
						}
						type="text"
						value={postContent?.message}
					></input>
				</header>
				<main className="my-2 flex w-full pl-1"></main>
				<footer className="flex">
					<div className="flex p-2">
						<Icon iconKind="pool" />
					</div>
					<div className="w-full"></div>
					<div className="mr-2">
						<PrimalyButton onClick={() => onCreatePost(postContent?.message ?? "")}>
							Post
						</PrimalyButton>
					</div>
				</footer>
			</div>
		</div>
	)
}