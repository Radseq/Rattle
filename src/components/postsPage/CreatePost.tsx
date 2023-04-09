import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { api } from "~/utils/api"
import { LoadingPage, LoadingSpinner } from "../LoadingPage"
import { useState } from "react"
import { toast } from "react-hot-toast"

export const CreatePost = () => {
	const { user, isLoaded } = useUser()
	const [postContent, setPostContent] = useState<string>()

	if (!user) {
		return <div>Please login again</div>
	}

	const posts = api.posts.getAllByAuthorId.useQuery(user.id)

	if (!isLoaded) {
		return <LoadingPage />
	}

	const { mutate, isLoading: isPosting } = api.posts.createPost.useMutation({
		onSuccess: async () => {
			await posts.refetch()
		},
		onError: (e) => {
			const zodValidationError = e.data?.zodError?.fieldErrors.content
			const error = zodValidationError?.join() ?? "Failed to posts! Please try again later"
			toast.error(error)
		},
	})

	return (
		<div className="flex rounded-lg p-2 hover:bg-gray-100 ">
			<Image
				className="w-1/12 rounded-full pr-2"
				src={user.profileImageUrl}
				alt={"avatar"}
				width={128}
				height={128}
			></Image>

			<input
				className="w-full rounded-xl border-2 border-solid text-lg outline-none"
				placeholder="Write your message & hit enter"
				onChange={(e) => setPostContent(e.target.value)}
				type="text"
				value={postContent}
				onKeyDown={(e) => {
					if (e.key === "Enter" && postContent) {
						e.preventDefault()
						mutate({ content: postContent })
						setPostContent("")
					}
				}}
				disabled={isPosting}
			></input>
			{isPosting && (
				<div>
					<LoadingSpinner size={50} />
				</div>
			)}
		</div>
	)
}
