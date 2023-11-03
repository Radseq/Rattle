import { useEffect, useState } from "react"
import { type PostWithAuthor } from "~/components/post/types"
import { useLoadNextPage } from "~/features/homePage"
import { api } from "~/utils/api"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetPostReplies = (postId: string, ulHeightInPx: number | null) => {
	const [postReplies, setPostReplies] = useState<PostWithAuthor[]>()

	const { data, fetchNextPage, refetch, isLoading } = api.posts.getPostReplies.useInfiniteQuery(
		{
			postId,
			limit: POSTS_PER_PAGE - 1,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		}
	)

	const loadNextPosts = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		if (loadNextPosts) {
			fetchNextPage().catch(() => {
				return
			})
		}
	}, [fetchNextPage, loadNextPosts])

	useEffect(() => {
		setPostReplies(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { postReplies, refetch, isLoading }
}
