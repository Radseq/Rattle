import { useEffect, useState } from "react"
import { type PrivateMessage } from "../types"
import { api } from "~/utils/api"
import { useLoadNextPage } from "~/features/homePage"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetAuthorMessages = (authorId: string, ulHeightInPx: number | null) => {
	const [messages, setMessages] = useState<PrivateMessage[]>()

	const { data, fetchNextPage, refetch, isLoading } =
		api.privateMessages.getPrivateMessages.useInfiniteQuery(
			{
				authorId,
				limit: POSTS_PER_PAGE - 1,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
		)
	const loadNextMessages = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextMessages) {
			fetchNextPage().catch(() => {
				return
			})
		}
	}, [fetchNextPage, loadNextMessages])

	useEffect(() => {
		setMessages(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { messages, refetch, isLoading }
}
