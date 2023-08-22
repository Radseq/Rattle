import { useEffect, useState } from "react"
import { useWindowScroll } from "~/hooks/useWindowScroll"

export const useLoadNextPage = (marginToEndPx: number, height: number | null) => {
	const [loadNextPage, setLoadNextPage] = useState(false)
	const windowScroll = useWindowScroll()

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
