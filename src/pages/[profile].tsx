import type { GetServerSideProps, NextPage } from "next"
import Head from "next/head"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"

import Image from "next/image"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { LoadingSpinner } from "~/components/LoadingPage"
import toast from "react-hot-toast"
import { ParseZodErrorToString } from "~/utils/helpers"
import { getAuth } from "@clerk/nextjs/server"
import type { Profile, SignInUser } from "src/components/profilePage/types"
import { ActionButtonSelector } from "~/components/profilePage/ActionButtonSelector"
import { SetUpProfileModal } from "~/components/profilePage/setUpProfileModal"
import { useState } from "react"
import { useProfileType } from "~/hooks/useProfileType"
import { getProfileByUserName } from "~/server/api/profile"
import { isFolloweed } from "~/server/api/follow"

dayjs.extend(relativeTime)

export const getServerSideProps: GetServerSideProps = async (props) => {
	const username = props.params?.profile as string

	const profile = await getProfileByUserName(username)
	if (!profile) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	const { user, userId } = getAuth(props.req)

	const isUserFollowProfile = user ? await isFolloweed(user.id, profile.id) : false

	const signInUser: SignInUser = {
		userId: userId ? userId : null,
		isSignedIn: !!userId,
	}

	return {
		props: {
			profile,
			signInUser,
			isUserFollowProfile,
		},
	}
}

const ZOD_ERROR_DURATION_MS = 10000

const Profile: NextPage<{
	profile: Profile
	signInUser: SignInUser
	isUserFollowProfile: boolean
}> = ({ profile, signInUser, isUserFollowProfile }) => {
	const [showModal, setShowModal] = useState<boolean>()

	const profileType = useProfileType(profile.id, signInUser, isUserFollowProfile)

	const { mutate: addUserToFollow, isLoading: isFolloweed } =
		api.follow.addUserToFollow.useMutation({
			onSuccess: () => {
				toast.success(`${profile.username} is now followeed`)
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
				toast.success(`${profile.username} is now Unfolloweed`)
				window.location.reload()
			},
			onError: (e) => {
				const error =
					ParseZodErrorToString(e.data?.zodError) ??
					"Failed to update settings! Please try again later"
				toast.error(error, { duration: ZOD_ERROR_DURATION_MS })
			},
		})

	return (
		<>
			<Head>
				<title>{profile.username}</title>
			</Head>
			<Layout>
				<div>
					<div className="flex flex-col">
						{profile.bannerImgUrl ? (
							<img src={profile.bannerImgUrl} alt={"banner"}></img>
						) : (
							<div className="h-52 w-full bg-black"></div>
						)}
						<div className="flex justify-between">
							<div className="relative w-full">
								<img
									className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white "
									src={profile.profileImageUrl}
									alt={"avatar"}
								></img>
								{/* fix me: to add shadow to icon when mouse hover */}
								<span
									className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white
									 bg-black bg-opacity-0 transition-all duration-200 hover:bg-opacity-10"
								></span>
							</div>
							<div className="mt-4 h-14">
								<ActionButtonSelector
									profileType={profileType}
									onClick={(
										actionType: "signUp" | "follow" | "unfollow" | null
									) => {
										if (actionType === "unfollow") {
											stopFollowing(profile.id)
										} else if (actionType === "follow") {
											addUserToFollow(profile.id)
										} else {
											setShowModal(true)
										}
									}}
								/>
								{(isFolloweed || isUnFollowing) && <LoadingSpinner />}
								{showModal ? (
									<div>
										<SetUpProfileModal
											bannerImageUrl={profile.bannerImgUrl ?? ""}
											bio={profile.bio ?? ""}
											webPage={profile.webPage ?? ""}
											profileImageUrl={profile.profileImageUrl}
											showModal={(e: boolean) => setShowModal(e)}
										/>
										<div className="fixed inset-0 z-40 bg-black opacity-25"></div>
									</div>
								) : null}
							</div>
						</div>
						<h1 className="pl-2 pt-2 text-2xl font-semibold">{profile.fullName}</h1>
						<span className="pl-2 font-normal text-slate-400">@{profile.username}</span>
						<p className="ml-2 mt-2">{profile.bio}</p>
						<div className="flex gap-3 pt-2">
							{profile.webPage && (
								<span className="flex pl-2">
									<Image
										width={18}
										height={18}
										src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/external-link.svg"
										alt={"icon"}
									></Image>
									<a href={profile.webPage} className="pl-1 text-blue-500">
										{profile.webPage}
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
									since {dayjs(profile.createdAt).fromNow()}
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
						<FetchPosts
							userId={profile.id}
							signInUser={signInUser}
							isUserFollowProfile={isUserFollowProfile}
						/>
					</div>
				</div>
			</Layout>
		</>
	)
}

export default Profile
