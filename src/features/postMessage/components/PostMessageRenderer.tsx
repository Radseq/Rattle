import Link from "next/link"
import { FC } from "react"
import { ProfilePopup } from "./ProfilePopup"

// # or @
const SKIP_SPECIAL_CHAR_INDEX = 1

const createSpan = (message: string) => {
	return <span>{message + " "}</span>
}

// e.g: message contains myHome=http://www.mypage.com
const createLink = (message: string) => {
	const SPLITTED_MESSAGE = message.split("=")
	return (
		<>
			<Link className="text-blue-400" href={SPLITTED_MESSAGE[1] || "#"}>
				{SPLITTED_MESSAGE[0]}
			</Link>{" "}
		</>
	)
}

export const PostMessageRenderer: FC<{ message: string }> = ({ message }) => {
	const elements: React.ReactElement[] = []

	const splittedMsg = message.split(" ")
	let lastSpanIndex = 0
	for (let index = 0; index < splittedMsg.length; index++) {
		const message = splittedMsg[index]
		if (!message) {
			break
		}

		if (message.startsWith("#")) {
			if (lastSpanIndex != index) {
				const spanMessage = splittedMsg.slice(lastSpanIndex, index).join("")
				elements.push(createSpan(spanMessage))
			}
			elements.push(createLink(message.substring(SKIP_SPECIAL_CHAR_INDEX)))
			lastSpanIndex = index + 1
		} else if (message.startsWith("@")) {
			// todo popup profile
			elements.push(<ProfilePopup profileName={message.substring(SKIP_SPECIAL_CHAR_INDEX)} />)
		}
	}

	return <div>{elements}</div>
}
