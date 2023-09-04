import Link from "next/link"
import { type FC, type Key, memo } from "react"
import { ProfilePopup } from "./ProfilePopup"
import React from "react"

// # or @
const SKIP_SPECIAL_CHAR_INDEX = 1

// e.g: message contains myHome=http://www.mypage.com
const CreateLink = (message: string, key: Key) => {
	const SPLITTED_MESSAGE = message.split("=")
	return (
		<React.Fragment key={key}>
			<Link className="text-blue-400" href={SPLITTED_MESSAGE[1] || "#"}>
				{`#${SPLITTED_MESSAGE[0] || ""}`}
			</Link>{" "}
		</React.Fragment>
	)
}

const parseMessage = (message: string) => {
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
				const spanMessage = splittedMsg.slice(lastSpanIndex, index).join(" ")
				elements.push(<span key={index - 1}>{spanMessage + " "}</span>)
			}
			elements.push(CreateLink(message.substring(SKIP_SPECIAL_CHAR_INDEX), index))
			lastSpanIndex = index + 1
		} else if (message.startsWith("@")) {
			if (lastSpanIndex != index) {
				const spanMessage = splittedMsg.slice(lastSpanIndex, index).join(" ")
				elements.push(<span key={index - 1}>{spanMessage + " "}</span>)
			}
			elements.push(<ProfilePopup profileName={`@${message.substring(SKIP_SPECIAL_CHAR_INDEX)}`} />)
			lastSpanIndex = index + 1
		}
	}

	if (lastSpanIndex < splittedMsg.length) {
		const spanMessage = splittedMsg.slice(lastSpanIndex, splittedMsg.length).join(" ")
		elements.push(<span key={splittedMsg.length}>{spanMessage}</span>)
	}

	return elements
}

const PostMessageRenderer: FC<{ message: string }> = ({ message }) => {
	return <>{parseMessage(message)}</>
}

export default memo(PostMessageRenderer)
