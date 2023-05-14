import { type FC, type PropsWithChildren, useState } from "react"
import { Icon } from "../Icon"
import { Heart } from "../Icons/Heart"
import Link from "next/link"
import { type PostWithUser } from "./types"

const ReplayIcon = (props: PropsWithChildren) => {
	const [hover, setHover] = useState<boolean>()
	return (
		<div
			className="mr-2 flex"
			onMouseEnter={() => {
				setHover(true)
			}}
			onMouseLeave={() => setHover(false)}
		>
			<div className={`flex rounded-full p-1 ${hover ? "bg-blue-400" : ""}`}>
				<Icon iconKind="chat" />
			</div>
			<span className={`self-center pl-1 text-xl ${hover ? "text-blue-400" : ""}`}>
				{props.children}
			</span>
		</div>
	)
}

type LikeIconProps = PropsWithChildren & {
	fillColor: string
}

const LikeIcon = (props: LikeIconProps) => {
	const [hover, setHover] = useState<boolean>()
	return (
		<div
			className="flex"
			onMouseEnter={() => {
				setHover(true)
			}}
			onMouseLeave={() => setHover(false)}
		>
			<Heart
				className={`h-9 w-9 rounded-full p-1 ${hover ? "bg-red-500" : ""}`}
				fillColor={props.fillColor}
			/>

			<span className={`self-center pl-1 text-xl ${hover ? "text-red-500" : ""} `}>
				{props.children}
			</span>
		</div>
	)
}

export const PostFooter: FC<{
	isLikedByUser: boolean
	postWithUser: PostWithUser
}> = ({ isLikedByUser, postWithUser }) => {
	return (
		<footer className="mt-3 flex text-gray-500">
			<Link
				className="mr-2 flex"
				href={`/post/${postWithUser.author.username}/status/${postWithUser.post.id}`}
			>
				<ReplayIcon>{postWithUser.post.replaysCount}</ReplayIcon>
			</Link>
			<div onClick={() => console.log("click")}>
				<LikeIcon fillColor={`${isLikedByUser ? "red" : ""}`}>
					{postWithUser.post.likeCount}
				</LikeIcon>
			</div>
		</footer>
	)
}
