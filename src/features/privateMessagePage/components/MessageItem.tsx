import { type FC } from "react"

export const MessageItem: FC<{message:string}> = ({message}) => {
	return (
		<li className="my-2 rounded-full bg-slate-100 p-2">
			<div>{message}</div>
		</li>
	)
}
