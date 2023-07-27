import { useEffect, useState } from "react"
import { useWindowsScroll } from "~/hooks/useWindowsScroll"

export const useLoadNextPage = (marginToEndPx = 400, height: number | null) => {
	const [loadNextPage, setLoadNextPage] = useState(false)
	const posY = useWindowsScroll()

	useEffect(() => {
		if (height && posY) {
			const calcHeight = height - posY
			if (calcHeight < 0) {
				setLoadNextPage(false)
			}
			setLoadNextPage(calcHeight < marginToEndPx)
		}
	}, [height, posY, marginToEndPx])

	return loadNextPage
}
