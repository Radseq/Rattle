import { useEffect, useState } from "react"

export const useDebounce = (text: string, timeout = 100) => {
	const [debounceText, setDebounceText] = useState(text)
	useEffect(() => {
		const timeId = setTimeout(() => {
			setDebounceText(text)
		}, timeout)
		return () => clearTimeout(timeId)
	}, [text, timeout])

	return debounceText
}
