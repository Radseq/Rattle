import { useEffect, useState } from "react"

export const useWindowsScroll = () => {
	const [posY, setPosY] = useState<number | null>(null)

	useEffect(() => {
		function updateScrollYPos() {
			setPosY(window.scrollY)
		}

		updateScrollYPos()
		window.addEventListener("scroll", updateScrollYPos)

		return () => window.removeEventListener("scroll", updateScrollYPos)
	}, [])

	return posY
}
