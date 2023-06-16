import { type FC } from "react"
import { Trash } from "./Icons/Trash"
import { OptionDots } from "./Icons/OptionDots"
import { ExternalLink } from "./Icons/ExternalLink"
import { Calendar } from "./Icons/Calendar"
import { Chat } from "./Icons/Chat"
import { PostForward } from "./Icons/PostForward"
import { Quote } from "./Icons/Quote"
import { Cross } from "./Icons/Cross"
import { Pool } from "./Icons/Pool"

export type IconKindProps =
	| "trash"
	| "postForward"
	| "quote"
	| "optionDots"
	| "externalLink"
	| "calendar"
	| "chat"
	| "cross"
	| "pool"

const GetIconByType = (kind: IconKindProps) => {
	switch (kind) {
		case "trash":
			return <Trash />
		case "optionDots":
			return <OptionDots />
		case "externalLink":
			return <ExternalLink />
		case "calendar":
			return <Calendar />
		case "chat":
			return <Chat />
		case "postForward":
			return <PostForward />
		case "quote":
			return <Quote />
		case "cross":
			return <Cross />
		case "pool":
			return <Pool />
		default:
			return null
	}
}

export const Icon: FC<{ iconKind: IconKindProps }> = ({ iconKind }) => {
	return GetIconByType(iconKind)
}
