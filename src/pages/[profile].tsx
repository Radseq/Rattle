import type { GetServerSideProps, NextPage } from "next"
import Head from "next/head"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { FetchPosts } from "~/components/postsPage/FetchPosts"
import { LoadingSpinner } from "~/components/LoadingPage"
import toast from "react-hot-toast"
import { getAuth } from "@clerk/nextjs/server"
import { type Profile } from "src/components/profilePage/types"
import { ActionButtonSelector } from "~/components/profilePage/ActionButtonSelector"
import { SetUpProfileModal } from "~/components/profilePage/setUpProfileModal"
import { useState } from "react"
import { useProfileType } from "~/hooks/useProfileType"
import { getProfileByUserName } from "~/server/api/profile"
import { isFollowed } from "~/server/api/follow"
import { CONFIG } from "~/config"
import { Icon } from "~/components/Icon"
import { clerkClient, type User } from "@clerk/nextjs/dist/api"
import { ProfileAvatarImageUrl } from "~/components/profile/ProfileAvatarImageUrl"

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

	const { userId } = getAuth(props.req)

	const isUserFollowProfile = userId ? await isFollowed(userId, profile.id) : false

	const user = userId ? await clerkClient.users.getUser(userId) : undefined

	return {
		props: {
			profile,
			user: JSON.parse(JSON.stringify(user)) as User,
			isUserFollowProfile,
		},
	}
}

const Profile: NextPage<{
	profile: Profile
	user: User | undefined
	isUserFollowProfile: boolean
}> = ({ profile, user, isUserFollowProfile }) => {
	const [showModal, setShowModal] = useState<boolean>()

	const profileType = useProfileType(profile.id, user, isUserFollowProfile)

	const { mutate: addUserToFollow, isLoading: isFollowed } =
		api.follow.addUserToFollow.useMutation({
			onSuccess: () => {
				toast.success(`${profile.username} is now followed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
			},
		})

	const { mutate: stopFollowing, isLoading: isUnFollowing } =
		api.follow.stopFollowing.useMutation({
			onSuccess: () => {
				toast.success(`${profile.username} is now Unfollowed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to stop follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
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
						{profile.extended?.bannerImgUrl ? (
							<img src={profile.extended?.bannerImgUrl} alt={"banner"}></img>
						) : (
							<div className="h-52 w-full bg-black"></div>
						)}
						<div className="flex justify-between">
							<div className="relative w-full">
								<ProfileAvatarImageUrl
									src={profile.profileImageUrl}
									className="absolute -top-16 h-32 w-32 rounded-full border-4 border-white"
								/>
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
								{(isFollowed || isUnFollowing) && <LoadingSpinner />}
								{showModal ? (
									<div>
										<SetUpProfileModal
											bannerImageUrl={profile.extended?.bannerImgUrl ?? ""}
											bio={profile.extended?.bio ?? ""}
											webPage={profile.extended?.webPage ?? ""}
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
						<p className="ml-2 mt-2">{profile.extended?.bio}</p>
						<div className="flex gap-3 pt-2">
							{profile.extended?.webPage && (
								<span className="flex pl-2">
									<Icon iconKind="externalLink" />
									<a
										href={profile.extended?.webPage}
										className="pl-1 text-blue-500"
									>
										{profile.extended?.webPage}
									</a>
								</span>
							)}
							<span className="ml-2 flex">
								<Icon iconKind="calendar" />
								<span className="ml-1 text-slate-500">
									since {dayjs(profile.createdAt).fromNow()}
								</span>
							</span>
						</div>
						<div className="ml-2 mt-2 flex gap-10">
							<span className="flex">
								<span className="">{profile.watchedCount}</span>
								<span className="ml-1 text-slate-500">Watched</span>
							</span>
							<span className="flex">
								<span className="">{profile.watchingCount}</span>
								<span className="pl-1 text-slate-500">Followed</span>
							</span>
						</div>
					</div>
					<div className="pt-4">
						<FetchPosts
							userId={profile.id}
							user={user}
							isUserFollowProfile={isUserFollowProfile}
						/>
					</div>
				</div>
			</Layout>
		</>
	)
}

export default Profile
