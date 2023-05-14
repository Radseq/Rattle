import { type FC, type PropsWithChildren } from "react"
import { Icon } from "../Icon"
import { Heart } from "../Icons/Heart"
import Link from "next/link"
import { type PostWithUser } from "./types"

const ReplayIcon = (props: PropsWithChildren) => {
	return (
		<div className="group mr-2 flex">
			<div className={"flex rounded-full p-1 group-hover:bg-blue-400"}>
				<Icon iconKind="chat" />
			</div>
			<span className={"self-center pl-1 text-xl group-hover:text-blue-400"}>
				{props.children}
			</span>
		</div>
	)
}

type LikeIconProps = PropsWithChildren & {
	fillColor: string
}

const LikeIcon = (props: LikeIconProps) => {
	return (
		<div className="group flex">
			<Heart
				className={"h-9 w-9 rounded-full p-1 group-hover:bg-red-500"}
				fillColor={props.fillColor}
			/>
			<span className={"self-center pl-1 text-xl group-hover:text-red-500"}>
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
