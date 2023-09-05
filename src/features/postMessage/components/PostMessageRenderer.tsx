import Link from "next/link"
import { type FC, memo } from "react"
import { ProfilePopup } from "./ProfilePopup"
import React from "react"

const hasSpecialChar = (message: string) => {
	// eslint-disable-next-line no-useless-escape
	const format = /[ `#@!$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
	return format.test(message)
}

type Token = { type: "normal" | "tag" | "profile"; value: string; connectedValue: string }

const parseText = (text: string): Token[] => {
	const tokens: Token[] = []
	const separator = " "
	for (const rawWord of text.split(separator)) {
		let type: "normal" | "tag" | "profile" = "normal"

		let toSkipIndex = 0
		let index = 1
		for (const char of rawWord) {
			if (char === "#") {
				type = "tag"
				continue
			} else if (char === "@") {
				type = "profile"
				continue
			}
			if (hasSpecialChar(char)) {
				toSkipIndex = index
				break
			}

			++index
		}
		// use to separated special character/s from tag/profile name e.g #someTag!!!
		if (toSkipIndex > 0) {
			tokens.push({ type, value: rawWord.slice(0, toSkipIndex), connectedValue: "" })
			tokens.push({
				type: "normal",
				value: rawWord.slice(toSkipIndex, rawWord.length),
				connectedValue: separator,
			})
		}

		if (toSkipIndex === 0) {
			tokens.push({ type, value: rawWord, connectedValue: separator })
		} else {
			toSkipIndex = 0
		}
	}
	return tokens
}

const PostMessageRenderer: FC<{ message: string }> = ({ message }) => {
	const tokens = parseText(message)
	return (
		<>
			{tokens.map((token) => {
				if (token.type === "tag") {
					return (
						<Link
							key={token.value}
							className="text-blue-400"
							href={`/hashTag/${token.value}`}
						>
							{`${token.value}${token.connectedValue}`}
						</Link>
					)
				} else if (token.type === "profile") {
					return <ProfilePopup key={token.value} profileName={token.value} />
				}
				return `${token.value}${token.connectedValue}`
			})}
		</>
	)
}

export default memo(PostMessageRenderer)
