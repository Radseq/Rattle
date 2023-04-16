import Image from "next/image"
import { type FC } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { LoadingSpinner } from "../LoadingPage"

const OptionMenuItem: FC<{ postId: string; userId: string }> = ({ postId, userId }) => {
	const posts = api.posts.getAllByAuthorId.useQuery(userId)

	const { mutate, isLoading: isDeleting } = api.posts.deletePost.useMutation({
		onSuccess: async () => {
			toast.success("Post Deleted")
			await posts.refetch()
		},
		onError: (e) => {
			const zodValidationError = e.data?.zodError?.fieldErrors.content
			const error = zodValidationError?.join() ?? "Failed to posts! Please try again later"
			toast.error(error)
		},
	})

	return (
		<div
			className="flex h-12 w-full rounded-lg p-2  hover:bg-gray-50"
			onClick={(e) => {
				e.preventDefault()
				console.log(postId.length)
				mutate(postId)
			}}
		>
			<Image
				width={15}
				height={15}
				src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/trash.svg"
				alt={"icon"}
			></Image>
			<button className="pl-1 font-bold text-red-500">Delete</button>
			{isDeleting && (
				<div>
					<LoadingSpinner size={30} />
				</div>
			)}
		</div>
	)
}

export const OptionMenu: FC<{ postId: string; userId: string }> = (postId) => {
	return (
		<ul
			className="absolute right-1 hidden h-full w-64 flex-col rounded-lg 
				bg-white shadow-[0px_0px_3px_1px_#00000024] hover:flex peer-hover:flex "
		>
			<li>
				<OptionMenuItem {...postId} />
			</li>
		</ul>
	)
}
