import Image from "next/image"
import { type FC } from "react"

const OptionMenuItem = () => {
	return (
		<div className="flex h-12 w-full rounded-lg p-2  hover:bg-gray-50">
			<Image
				width={15}
				height={15}
				src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/trash.svg"
				alt={"icon"}
			></Image>
			<button className="pl-1 font-bold text-red-500">Delete</button>
		</div>
	)
}

export const OptionMenu: FC<{ postId: string }> = (postId) => {
	return (
		<ul
			className="absolute right-1 hidden h-full w-64 flex-col rounded-lg 
				bg-white shadow-[0px_0px_3px_1px_#00000024] hover:flex peer-hover:flex "
		>
			<li>
				<OptionMenuItem />
			</li>
		</ul>
	)
}
