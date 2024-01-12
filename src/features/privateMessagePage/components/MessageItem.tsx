import { type FC } from "react"
import { type PrivateMessage } from "../types"

export const MessageItem: FC<{ message: PrivateMessage }> = ({ message }) => {
	return (
		<li className="my-2 rounded-full bg-slate-100 p-2">
			<div>{message.text}</div>
		</li>
	)
}
