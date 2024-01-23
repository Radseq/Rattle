import { Emoji } from "~/components/Icons/Emoji"
import { MessageItem } from "./MessageItem"
import { Person } from "./Person"
import { Picture } from "~/components/Icons/Picture"
import { type FC, useRef, ChangeEvent, useState } from "react"
import { useGetAuthorMessages } from "../hooks/useGetAuthorMessages"
import { LoadingPage } from "~/components/LoadingPage"
import TextareaAutosize from "react-textarea-autosize"

export const SelectedAuthorMessages: FC<{
	username: string
	fullName: string
	profileImageUrl: string
	authorId: string
}> = ({ username, fullName, profileImageUrl, authorId }) => {
	const ulRef = useRef<HTMLUListElement>(null)
	const [text, setText] = useState<string>("")

	const { isLoading, messages } = useGetAuthorMessages(
		authorId,
		ulRef.current && ulRef.current.scrollHeight - ulRef.current.offsetTop,
	)

	if (isLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	return (
		<div>
			<Person username={username} fullName={fullName} profileImageUrl={profileImageUrl} />
			<ul ref={ulRef}>
				{messages?.map((message) => <MessageItem key={message.id} message={message} />)}
			</ul>
			<div className="flex gap-1 rounded-xl bg-slate-300 pl-1">
				<Picture />
				<Emoji />
				<TextareaAutosize
					value={text}
					onChange={(e) => setText(e.target.value)}
					className="block size-full resize-none overflow-hidden bg-transparent p-2 text-sm text-gray-900 focus:outline-none"
					placeholder="Start a new message"
					required
				/>
			</div>
		</div>
	)
}
