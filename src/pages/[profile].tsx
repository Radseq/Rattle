import type { GetStaticPropsContext, NextPage } from "next"
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
import { LoadingPage } from "~/components/LoadingPage"
import { DetermineActionButton } from "~/components/profilePage/DetermineActionButton"

dayjs.extend(relativeTime)

export const getStaticProps = async (context: GetStaticPropsContext<{ profile: string }>) => {
	const ssg = createProxySSGHelpers({
		router: appRouter,
		ctx: { prisma, authUserId: null, opts: undefined },
		transformer: superjson, // optional - adds superjson serialization
	})

	const username = context.params?.profile.replace("@", "") as string

	if (!username) {
		throw new Error("No Username provided")
	}

	await ssg.profile.getProfileByUsername.prefetch(username)

	return {
		props: {
			trpcState: ssg.dehydrate(),
			username,
		},
	}
}

export const getStaticPaths = () => {
	return {
		paths: [],
		// https://nextjs.org/docs/api-reference/data-fetching/get-static-paths#fallback-blocking
		fallback: "blocking",
	}
}

const Profile: NextPage<{ username: string }> = ({ username }) => {
	const { data: profileData, isLoading } = api.profile.getProfileByUsername.useQuery(username)

	if (isLoading) {
		return <LoadingPage />
	}

	if (!profileData) {
		// todo error page
		return null
	}

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
							<DetermineActionButton profileData={profileData} />
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
