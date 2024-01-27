import { useEffect, useState } from "react"
import { useCreatePost, useLoadNextPage } from "~/features/homePage"
import { type PostWithAuthor } from "~/features/postItem"
import { api } from "~/utils/api"

//todo move to config
const POSTS_PER_PAGE = 10
const SCROLL_THRESHOLD_IN_PX = 400

export const useGetHomePosts = (ulHeightInPx: number | null) => {
	const [posts, setPosts] = useState<PostWithAuthor[]>()
	const { isCreatedPost, setIsCreatedPost } = useCreatePost()

	const { data, fetchNextPage, refetch, isLoading } = api.posts.getHomePosts.useInfiniteQuery(
		{
			limit: POSTS_PER_PAGE - 1,
		},
		{
			getNextPageParam: (lastPage) => lastPage.nextCursor,
		},
	)

	const loadNextPosts = useLoadNextPage(SCROLL_THRESHOLD_IN_PX, ulHeightInPx)

	useEffect(() => {
		const asyncRefetch = async () => {
			if (isCreatedPost) {
				await refetch()
				setIsCreatedPost(false)
			}
		}

		asyncRefetch().catch(() => setIsCreatedPost(false))
	}, [isCreatedPost, setIsCreatedPost, refetch])

	useEffect(() => {
		if (loadNextPosts) {
			fetchNextPage().catch(() => {
				return
			})
		}
	}, [fetchNextPage, loadNextPosts])

	useEffect(() => {
		setPosts(data?.pages.map((page) => page.result).flat())
	}, [data?.pages])

	return { posts, refetch, isLoading }
}
