import type { GetServerSideProps, GetStaticPropsContext, NextPage } from "next"
import Head from "next/head"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import superjson from "superjson"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import Image from "next/image"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { LoadingPage, LoadingSpinner } from "~/components/LoadingPage"
import { useUser } from "@clerk/nextjs"
import toast from "react-hot-toast"
import { ParseZodErrorToString, getFullName } from "~/utils/helpers"
import { DangerButton, PrimalyButton } from "~/components/StyledButtons"
import { useState } from "react"
import { SetUpProfileModal } from "~/components/profilePage/setUpProfileModal"
import { clerkClient } from "@clerk/nextjs/server"
import { type Profile, type SignInUser } from "src/components/profilePage/types"

dayjs.extend(relativeTime)

export const getServerSideProps = async (context: GetStaticPropsContext<{ profile: string }>) => {
	const username = context.params?.profile.replace("@", "") as string

	const authors = await clerkClient.users.getUserList({
		username: [username],
	})

	if (authors.length > 1 || !authors[0]) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	const author = authors[0]

	const authorLocal = await prisma.user.findFirst({
		where: {
			id: author.id,
		},
	})

	const { user, isSignedIn, isLoaded } = useUser()

	let isUserFollowProfile: boolean | undefined
	if (user && isLoaded) {
		const followeed = await prisma.followeed.findFirst({
			where: {
				watched: user.id,
				watching: author.id,
			},
		})
		if (followeed) {
			isUserFollowProfile = true
		}
	}

	return {
		props: {
			profile: {
				id: author.id,
				username: author.username,
				profileImageUrl:
					(authorLocal && authorLocal.profileImageUrl) ?? author.profileImageUrl,
				fullName: getFullName(author.firstName, author.lastName),
				createdAt: author.createdAt,
				bannerImgUrl: authorLocal && authorLocal.bannerImageUrl,
				bio: authorLocal && authorLocal.bio,
				webPage: authorLocal && authorLocal.webPage,
			},
			signInUser: {
				userId: user ? user.id : undefined,
				isSignedIn,
				isLoaded,
			},
			isUserFollowProfile,
		},
	}
}

const ZOD_ERROR_DURATION_MS = 10000

const Profile: NextPage<{
	profile: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean | undefined
}> = ({ profile, signInUser, isUserFollowProfile }) => {
	const { data: profileData, isLoading } = api.profile.getProfileByUsername.useQuery(username)

	const { user, isSignedIn } = useUser()
	const [showModal, setShowModal] = useState<boolean>()

	if (isLoading) {
		return <LoadingPage />
	}

	if (!profileData) {
		// todo error page
		return null
	}

	const { mutate: addUserToFollow, isLoading: isFolloweed } =
		api.follow.addUserToFollow.useMutation({
			onSuccess: () => {
				toast.success(`${username} is now followeed`)
				window.location.reload()
			},
			onError: (e) => {
				const error =
					ParseZodErrorToString(e.data?.zodError) ??
					"Failed to update settings! Please try again later"
				toast.error(error, { duration: ZOD_ERROR_DURATION_MS })
			},
		})

	const { mutate: stopFollowing, isLoading: isUnFollowing } =
		api.follow.stopFollowing.useMutation({
			onSuccess: () => {
				toast.success(`${username} is now Unfolloweed`)
				window.location.reload()
			},
			onError: (e) => {
				const error =
					ParseZodErrorToString(e.data?.zodError) ??
					"Failed to update settings! Please try again later"
				toast.error(error, { duration: ZOD_ERROR_DURATION_MS })
			},
		})

	const { data: isAlreadyFollowing } = api.follow.isFolloweed.useQuery(profileData.id)

	return (
		<>
			<Head>
				<title>{profileData.username}</title>
			</Head>
			<Layout>
				<div>
					<div className="flex flex-col">
						{profileData.bannerImgUrl ? (
							<img src={profileData.bannerImgUrl} alt={"banner"}></img>
						) : (
							<div className="h-52 w-full bg-black"></div>
						)}
						<div className="flex justify-between">
							<div className="relative w-full">
								<img
									className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white "
									src={profileData.profileImageUrl}
									alt={"avatar"}
								></img>
								{/* fix me: to add shadow to icon when mouse hover */}
								<span
									className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white
									 bg-black bg-opacity-0 transition-all duration-200 hover:bg-opacity-10"
								></span>
							</div>
							<div className="mt-4 h-14">
								{user && isSignedIn && user.id === profileData.id ? (
									<div>
										<PrimalyButton
											onClick={(e) => {
												setShowModal(true)
												e.preventDefault()
											}}
										>
											Set up profile
										</PrimalyButton>
										{showModal ? (
											<div>
												<SetUpProfileModal
													bannerImageUrl={profileData.bannerImgUrl ?? ""}
													bio={profileData.bio ?? ""}
													webPage={profileData.webPage ?? ""}
													profileImageUrl={profileData.profileImageUrl}
													showModal={(e: boolean) => setShowModal(e)}
												/>
												<div className="fixed inset-0 z-40 bg-black opacity-25"></div>
											</div>
										) : null}
									</div>
								) : isAlreadyFollowing && isSignedIn ? (
									<DangerButton
										onClick={(e) => {
											e.preventDefault()
											stopFollowing(profileData.id)
										}}
									>
										{isUnFollowing && <LoadingSpinner />}
										Unfollow
									</DangerButton>
								) : (
									isSignedIn && (
										<PrimalyButton
											onClick={(e) => {
												e.preventDefault()
												addUserToFollow(profileData.id)
											}}
										>
											{isFolloweed && <LoadingSpinner />}
											Follow
										</PrimalyButton>
									)
								)}
							</div>
						</div>
						<h1 className="pl-2 pt-2 text-2xl font-semibold">{profileData.fullName}</h1>
						<span className="pl-2 font-normal text-slate-400">
							@{profileData.username}
						</span>
						<p className="ml-2 mt-2">{profileData.bio}</p>
						<div className="flex gap-3 pt-2">
							{profileData.webPage && (
								<span className="flex pl-2">
									<Image
										width={18}
										height={18}
										src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/external-link.svg"
										alt={"icon"}
									></Image>
									<a href={profileData.webPage} className="pl-1 text-blue-500">
										{profileData.webPage}
									</a>
								</span>
							)}
							<span className="ml-2 flex">
								<Image
									width={18}
									height={18}
									src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/calendar.svg"
									alt={"icon"}
								></Image>
								<span className="ml-1 text-slate-500">
									since {dayjs(profileData.createdAt).fromNow()}
								</span>
							</span>
						</div>
						<div className="ml-2 mt-2 flex gap-10">
							<span className="flex">
								<span className="">0</span>
								<span className="ml-1 text-slate-500">Watched</span>
							</span>
							<span className="flex">
								<span className="">0</span>
								<span className="pl-1 text-slate-500">Followed</span>
							</span>
						</div>
					</div>
					<div className="pt-4">
						<FetchPosts userId={profileData.id} />
					</div>
				</div>
			</Layout>
		</>
	)
}

export default Profile
