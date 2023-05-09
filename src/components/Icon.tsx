import { type FC } from "react"
import { Trash } from "./Icons/Trash"
import { OptionDots } from "./Icons/OptionDots"
import { ExternalLink } from "./Icons/ExternalLink"
import { Calendar } from "./Icons/Calendar"
import { Chat } from "./Icons/Chat"
import { Heart } from "./Icons/Heart"

export type IconKindProps = "trash" | "optionDots" | "externalLink" | "calendar" | "chat" | "heart"

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
		case "heart":
			return <Heart />
		default:
			return null
	}
}

export const Icon: FC<{ iconKind: IconKindProps }> = ({ iconKind }) => {
	return GetIconByType(iconKind)
}
