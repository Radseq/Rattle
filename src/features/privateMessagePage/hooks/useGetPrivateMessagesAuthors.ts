import { useEffect, useState } from "react"
import { useLoadNextPage } from "~/features/homePage"
import { Profile } from "~/features/profile"
import { api } from "~/utils/api"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetPrivateMessagesAuthors = (ulHeightInPx: number | null) => {
	const [authors, setAuthors] = useState<Profile[]>()

	const { data, fetchNextPage, refetch, isLoading } =
		api.privateMessages.getLastPrivateMessagesUsers.useInfiniteQuery(
			{
				limit: POSTS_PER_PAGE - 1,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)
	const loadNextAuthors = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextAuthors) {
			fetchNextPage().catch(() => {
				return
			})
		}
	}, [fetchNextPage, loadNextAuthors])

	useEffect(() => {
		setAuthors(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { authors, refetch, isLoading }
}
