import { useEffect, useState } from "react"

type WidowScroll = { posY: number; windowHeight: number }

export const useWindowsScroll = () => {
	const [windowScroll, setWindowScroll] = useState<WidowScroll | null>(null)

	useEffect(() => {
		const updateScrollYPos = () =>
			setWindowScroll({ posY: window.scrollY, windowHeight: window.innerHeight })

		updateScrollYPos()
		window.addEventListener("scroll", updateScrollYPos)

		return () => window.removeEventListener("scroll", updateScrollYPos)
	}, [])

	return windowScroll
}
