import { useEffect, useState } from "react"
import { type PostWithAuthor } from "~/components/post/types"
import { useLoadNextPage } from "~/features/homePage"
import { api } from "~/utils/api"

const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetPostsByAuthor = (authorId: string, ulHeightInPx: number | null) => {
	const [posts, setPost] = useState<PostWithAuthor[]>()

	const { data, fetchNextPage, refetch, isLoading } = api.posts.getAllByAuthorId.useInfiniteQuery(
		{
			authorId,
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
		setPost(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { posts, refetch, isLoading }
}
