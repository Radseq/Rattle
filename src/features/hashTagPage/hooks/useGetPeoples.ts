import { useEffect, useState } from "react"
import { type PostWithAuthor } from "~/components/post/types"
import { useLoadNextPage } from "~/features/homePage"
import { api } from "~/utils/api"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetPeoples = (ulHeightInPx: number | null, limit?: number) => {
	const [peoples, setPeoples] = useState()

	const { data, fetchNextPage, refetch, isLoading } = api.posts.getHomePosts.useInfiniteQuery(
		{
			limit: POSTS_PER_PAGE - 1,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	)

	const loadNextPosts = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextPosts) {
			fetchNextPage().catch(() => console.error("Can't fetch more data!"))
		}
	}, [fetchNextPage, loadNextPosts])

	useEffect(() => {
		setPeoples(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { peoples, refetch, isLoading }
}
