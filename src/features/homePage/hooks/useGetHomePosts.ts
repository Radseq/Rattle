import { useEffect, useState } from "react"
import { type PostWithAuthor } from "~/components/post/types"
import { CONFIG } from "~/config"
import { useLoadNextPage } from "~/features/homePage"
import { api } from "~/utils/api"

export const useGetHomePosts = (ulHeightInPx: number | null) => {
	const [posts, setPosts] = useState<PostWithAuthor[]>()

	const { data, fetchNextPage, refetch, isLoading } = api.posts.getHomePosts.useInfiniteQuery(
		{
			limit: CONFIG.POSTS_PER_PAGE - 1,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	)

	const loadNextPosts = useLoadNextPage(CONFIG.SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextPosts) {
			fetchNextPage().catch(() => console.error("Can't fetch more data!"))
		}
	}, [fetchNextPage, loadNextPosts])

	useEffect(() => {
		setPosts(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { posts, refetch, isLoading }
}
