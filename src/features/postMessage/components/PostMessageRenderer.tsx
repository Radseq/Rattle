import Link from "next/link"
import { FC } from "react"
import { ProfilePopup } from "./ProfilePopup"

const SKIP_HASH_CHAR_INDEX = 1
const OPEN_SQUARE_BRACKED_INDEX = 1;

const createSpan = (msg: string) => {
	return <span>{msg + " "}</span>
}

const createLink = (url: string) => {
	const replacedUrl = `http://www.google.pl/${url.replace("@", "")}`
	return (
		<>
			<Link className="text-blue-400" href={replacedUrl}>
				{url}
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
			elements.push(createLink(message.substring(SKIP_HASH_CHAR_INDEX)))
			lastSpanIndex = index + 1
		} else if (message.startsWith("@")) {
			// todo popup profile
			elements.push(<ProfilePopup />)
		}
	}

	return <div>{elements}</div>
}
