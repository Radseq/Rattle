import { type FC } from "react"
import { Heart } from "~/components/Icons/Heart"

export const HeartIcon: FC<{
	filledRed: boolean
	likeCount: number
	onClick: (e: React.MouseEvent<HTMLElement>) => void
}> = ({ filledRed, likeCount, onClick }) => {
	return (
		<div className="group flex" onClick={onClick}>
			<Heart
				className={`h-9 w-9 rounded-full p-1 ${
					filledRed ? "group-hover:bg-gray-500" : "group-hover:bg-red-500"
				}`}
				fillColor={filledRed ? "red" : ""}
			/>
			<span className={"self-center pl-1 text-xl group-hover:text-red-500"}>{likeCount}</span>
		</div>
	)
}
