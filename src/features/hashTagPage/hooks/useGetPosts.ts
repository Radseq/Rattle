import { useEffect, useState } from "react"
import { type PostWithAuthor } from "~/components/post/types"
import { useLoadNextPage } from "~/features/homePage"
import { api } from "~/utils/api"

const MAX_POSTS = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetPosts = (ulHeightInPx: number | null, tag: string) => {
	const [posts, setPosts] = useState<PostWithAuthor[]>()

	const { data, fetchNextPage, refetch, isLoading } =
		api.search.getPostsByTagInMessage.useInfiniteQuery(
			{
				limit: MAX_POSTS - 1,
				tag,
			},
			{
				getNextPageParam: (lastPage) => lastPage.nextCursor,
			}
		)

	const loadNextPosts = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextPosts) {
			fetchNextPage()
		}
	}, [fetchNextPage, loadNextPosts])

	useEffect(() => {
		setPosts(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { posts, refetch, isLoading }
}
