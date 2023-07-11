import { type GetServerSideProps, type NextPage } from "next"
import { Layout } from "~/components/Layout"

import { api } from "~/utils/api"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { ParseZodErrorToString } from "~/utils/helpers"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { clerkClient, getAuth } from "@clerk/nextjs/server"
import { type User } from "@clerk/nextjs/dist/api"
import Image from "next/image"
import { Icon } from "~/components/Icon"
import { PrimalyButton } from "~/components/styledHTMLElements/StyledButtons"
import { type PostContent } from "~/components/homePage/types"
import { useReducer, useState } from "react"
import { CreatePoll } from "~/components/homePage/CreatePoll"
import { pollLengthReducer } from "~/reducers/pollLengthReducer"
import { pollChoicesReducer } from "~/reducers/pollChoicesReducer"

const INIT_POLL_LENGTH = {
	days: 1,
	hours: 0,
	minutes: 0,
}

const INIT_POLL_CHOICES = ["", ""]

export const getServerSideProps: GetServerSideProps = async (props) => {
	const { userId } = getAuth(props.req)

	if (!userId) {
		return {
			redirect: {
				destination: "/signIn",
				permanent: false,
			},
		}
	}

	const user = await clerkClient.users.getUser(userId)

	return {
		props: {
			user: JSON.parse(JSON.stringify(user)) as User,
		},
	}
}

const Home: NextPage<{ user: User }> = ({ user }) => {
	//fetch asap
	const posts = api.posts.getAllByAuthorId.useQuery(user.id)
	const [postContent, setPostContent] = useState<PostContent>({
		message: "",
	})

	const [pollLengthState, pollLengthDispatch] = useReducer(pollLengthReducer, INIT_POLL_LENGTH)
	const [pollChoicesState, pollChoicesDispatch] = useReducer(
		pollChoicesReducer,
		INIT_POLL_CHOICES
	)

	const { mutate } = api.posts.createPost.useMutation({
		onSuccess: async () => {
			await posts.refetch()
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: CONFIG.TOAST_ERROR_DURATION_MS })
		},
	})

	const handleCreatePost = () => {
		if (postContent.poll) {
			const notNullchoices = [...pollChoicesState].filter((choice) => {
				if (choice) {
					return choice
				}
			})
			setPostContent({
				...postContent,
				poll: {
					choices: notNullchoices,
					length: pollLengthState,
				},
			})
			mutate({
				message: postContent.message,
				poll: { choices: notNullchoices, length: pollLengthState },
			})
		} else {
			mutate(postContent)
		}
	}

	const handleRemovePoll = () => {
		setPostContent({
			...postContent,
			poll: undefined,
		})
	}

	/*
	PS jeszcze chcę od linii 132 do linii 186 zrobić dodatkowy komponent, 
	i teraz cała logika CreatePoll + logika z linii 166 - 178
	zwrócić jako props

	więc chcąc trzymać logikę tylko na "stronie głównej" musze zwracać 
	propsami wszystko aż do głownej strony
	koronny przykład jak hujowo jest to zrobione to komponent Post Item
	chociaż tu mogę zrobić kompozycję
	oraz komponent FetchPosts

	CreatePoll składa się z:
		PollChoices składa się z:
			PollInput
			DangerButton
			PrimalyOutlineButton
		PollTimeLength
		DangerOutlineButton
	
	a CreatePoll chcę jeszcze opakować w 
	kompoent w stylu CreatePost
	pamiętając że CreatePost będzie miało w sobie logikę
	że post może mieć message + poll | message | message + image id | message + viedeo id
	*/

	return (
		<Layout>
			<div className="pt-2">
				<div className="flex">
					<Image
						className="h-16 w-16 rounded-full"
						src={user.profileImageUrl}
						alt={"avatar"}
						width={128}
						height={128}
					></Image>
					<div className="w-full pl-1">
						<input
							className="w-full rounded-xl border-2 border-solid p-1 text-lg outline-none"
							placeholder={
								postContent?.poll ? "Ask a question!" : "What is happening?!"
							}
							onChange={(e) =>
								setPostContent({ ...postContent, message: e.target.value })
							}
							type="text"
						></input>
						{postContent.poll && (
							<CreatePoll
								onRemovePoll={handleRemovePoll}
								pollChoicesDispatch={pollChoicesDispatch}
								pollLengthDispatch={pollLengthDispatch}
								pollLength={pollLengthState}
								choices={pollChoicesState}
							/>
						)}
					</div>
				</div>
				<footer className="ml-16 flex">
					<div
						className="flex p-2"
						onClick={() => {
							if (postContent.poll) {
								handleRemovePoll()
							} else {
								setPostContent({
									...postContent,
									message: postContent.message ?? "",
									poll: {
										choices: INIT_POLL_CHOICES,
										length: pollLengthState,
									},
								})
							}
						}}
					>
						<Icon iconKind="poll" />
					</div>
					<div className="w-full"></div>
					<div className="mr-2">
						<PrimalyButton onClick={() => handleCreatePost()}>Post</PrimalyButton>
					</div>
				</footer>

				<h1 className="p-2 text-2xl font-semibold">Your last posts:</h1>
				<FetchPosts isUserFollowProfile={null} user={user} userId={user.id} />
			</div>
		</Layout>
	)
}

export default Home
