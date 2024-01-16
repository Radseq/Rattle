import type { GetStaticProps, NextPage } from "next"
import Head from "next/head"
import { api } from "~/utils/api"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import { LoadingSpinner } from "~/components/LoadingPage"
import toast from "react-hot-toast"

import { useState } from "react"
import { CONFIG } from "~/config"
import { Icon } from "~/components/Icon"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import superjson from "superjson"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import { useAuth } from "@clerk/nextjs"
import {
	ActionButtonSelector,
	FetchPosts,
	ProfileAvatarImageUrl,
	ProfileWatchedWatching,
	SetUpProfileModal,
	useGetProfile,
} from "~/features/profile"
import { getPostProfileType } from "~/utils/helpers"
import { Layout, MessageIcon } from "~/features/layout"
import Link from "next/link"

dayjs.extend(relativeTime)

export const getStaticProps: GetStaticProps = async (context) => {
	const ssg = createProxySSGHelpers({
		router: appRouter,
		ctx: { prisma, authUserId: null, opts: undefined },
		transformer: superjson, // optional - adds superjson serialization
	})

	const username = context.params?.profile as string

	if (!username) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			},
		}
	}

	await ssg.profile.getProfileByUsername.prefetch(username)

	return {
		props: {
			trpcState: ssg.dehydrate(),
			username,
		},
	}
}

// todo use for most viewed profiles?
export const getStaticPaths = () => {
	return {
		paths: [],
		fallback: "blocking",
	}
}

const ProfilePage: NextPage<{
	username: string
}> = ({ username }) => {
	const [showModal, setShowModal] = useState<boolean>()

	const user = useAuth()
	const { profile, isUserFollowProfile, watchedWatchingCount, setWatchedWatching } =
		useGetProfile(username)

	if (!profile) {
		return <div>404</div>
	}

	const { mutate: addUserToFollow, isLoading: isFollowed } =
		api.follow.addUserToFollow.useMutation({
			onMutate: () => {
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount += 1),
				})
			},
			onSuccess: () => {
				toast.success(`${profile.username} is now followed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount -= 1),
				})
			},
		})

	const { mutate: stopFollowing, isLoading: isUnFollowing } =
		api.follow.stopFollowing.useMutation({
			onMutate: () => {
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount -= 1),
				})
			},
			onSuccess: () => {
				toast.success(`${profile.username} is no longer followed`)
				window.location.reload()
			},
			onError: () => {
				toast.error("Failed to stop follow! Please try again later", {
					duration: CONFIG.TOAST_ERROR_DURATION_MS,
				})
				setWatchedWatching({
					...watchedWatchingCount,
					watchedCount: (watchedWatchingCount.watchedCount += 1),
				})
			},
		})

	return (
		<>
			<Head>
				<title>{profile.username}</title>
			</Head>
			<Layout>
				<section>
					<article className="flex flex-col pb-4">
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
							<div className="mt-4 flex h-14">
								{profile.id !== user.userId && (
									<Link
										href={`/message/${profile.id}`}
										className="m-2 flex rounded-full border p-1"
									>
										<MessageIcon width={48} height={48} />
									</Link>
								)}
								<ActionButtonSelector
									profileType={getPostProfileType(
										isUserFollowProfile,
										profile.id,
										user.userId
									)}
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
						{watchedWatchingCount && (
							<ProfileWatchedWatching watchedWatchingCount={watchedWatchingCount} />
						)}
					</article>
					<FetchPosts userId={user.userId} authorId={profile.id} />
				</section>
			</Layout>
		</>
	)
}

export default ProfilePage
