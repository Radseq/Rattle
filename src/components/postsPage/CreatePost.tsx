import { useUser } from "@clerk/nextjs"
import Image from "next/image"
import { api } from "~/utils/api"
import { LoadingPage } from "../LoadingPage"
import { useState } from "react"

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

	const createMutation = api.posts.createPost.useMutation({
		onSuccess: async () => {
			await posts.refetch()
		},
		onError: () => {
			// todo
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
				className=" w-full rounded-xl border-2 border-solid text-lg outline-none"
				placeholder="Write your message & hit enter"
				onChange={(e) => setPostContent(e.target.value)}
				value={postContent}
				onKeyDown={(e) => {
					if (e.key === "Enter" && postContent) {
						createMutation.mutate({ userId: user.id, content: postContent })
						setPostContent("")
					}
				}}
			></input>
		</div>
	)
}
