import { type FC } from "react"
import { Trash } from "./Icons/Trash"

type IconKindProps = "trash"

const GetIconByType = (kind: IconKindProps) => {
	switch (kind) {
		case "trash":
			return <Trash />

		default:
			return null
	}
}

export const Icon: FC<{ iconKind: IconKindProps }> = ({ iconKind }) => {
	return GetIconByType(iconKind)
}
