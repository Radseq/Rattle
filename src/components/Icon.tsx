import { type FC } from "react"
import { Trash } from "./Icons/Trash"
import { OptionDots } from "./Icons/OptionDots"
import { ExternalLink } from "./Icons/ExternalLink"
import { Calendar } from "./Icons/Calendar"

export type IconKindProps = "trash" | "optionDots" | "externalLink" | "calendar"

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
		default:
			return null
	}
}

export const Icon: FC<{ iconKind: IconKindProps }> = ({ iconKind }) => {
	return GetIconByType(iconKind)
}
