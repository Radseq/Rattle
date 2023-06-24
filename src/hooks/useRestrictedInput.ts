import { useState } from "react"

export const useRestrictedInput = (maxLetters: number, initValue: string) => {
	const [value, setValue] = useState(initValue)
	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const newValue = e.target.value
		if (newValue.length <= maxLetters) {
			setValue(newValue)
		}
	}
	const charsleft = maxLetters - value.length
	return {
		value,
		charsleft,
		onChange,
	} as const
}

export const useRestrictedTextArea = (maxLetters: number, initValue: string) => {
	const [value, setValue] = useState(initValue)
	const onChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
		const newValue = e.target.value
		if (newValue.length <= maxLetters) {
			setValue(newValue)
		}
	}
	const charsleft = maxLetters - value.length
	return {
		value,
		charsleft,
		onChange,
	} as const
}
