import { useEffect, useState } from "react"
import { useLoadNextPage } from "~/features/homePage"
import { type Profile } from "~/features/profile"
import { useDebounce } from "~/features/search"
import { api } from "~/utils/api"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400
const debounceTimeout = 200

export const useGetPrivateMessagesAuthors = (
	ulHeightInPx: number | null,
	searchedValue: string,
) => {
	const [authors, setAuthors] = useState<Profile[]>()

	const debouncedValue = useDebounce(searchedValue, debounceTimeout)

	const { data, fetchNextPage, refetch, isLoading } =
		api.privateMessages.getLastPrivateMessagesUsers.useInfiniteQuery(
			{
				limit: POSTS_PER_PAGE - 1,
				searchedValue: debouncedValue,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			},
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
