import { useEffect, useState } from "react"
import { useWindowsScroll } from "~/hooks/useWindowsScroll"

export const useLoadNextPage = (marginToEndPx = 400, height: number | null) => {
	const [loadNextPage, setLoadNextPage] = useState(false)
	const windowScroll = useWindowsScroll()

	useEffect(() => {
		if (height && windowScroll) {
			const { posY, windowHeight } = windowScroll

			if (height < 0) {
				setLoadNextPage(false)
				return
			}

			const calcHeight = height - posY
			const margin = windowHeight < marginToEndPx ? marginToEndPx : windowHeight
			setLoadNextPage(calcHeight < margin)
		}
	}, [height, windowScroll, marginToEndPx])

	return loadNextPage
}
