import Image from "next/image"
import { type FC } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { LoadingSpinner } from "../LoadingPage"
import { Icon } from "../Icon"

export const OptionMenu: FC<{
	postId: string
	closeMenu: () => void
	refetchPosts: CallableFunction
}> = ({ postId, closeMenu, refetchPosts }) => {
	const { mutate, isLoading: isDeleting } = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted")
			await refetchPosts()
		},
		onError: (e) => {
			const zodValidationError = e.data?.zodError?.fieldErrors.content
			const error = zodValidationError?.join() ?? "Failed to posts! Please try again later"
			toast.error(error)
		},
	})
	return (
		<ul
			className="absolute right-1 h-full w-64 flex-col rounded-lg 
				bg-white shadow-[0px_0px_3px_1px_#00000024]"
			onMouseLeave={closeMenu}
		>
			<li
				className="flex h-12 w-full rounded-lg p-2  hover:bg-gray-50"
				onClick={() => mutate(postId)}
			>
				<Icon iconKind="trash" />
				<button className="pl-1 font-bold text-red-500">Delete</button>
				{isDeleting && (
					<div>
						<LoadingSpinner size={30} />
					</div>
				)}
			</li>
		</ul>
	)
}
