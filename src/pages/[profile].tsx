import type { GetStaticPropsContext, NextPage } from "next"
import Head from "next/head"
import { toast } from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { api } from "~/utils/api"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import superjson from "superjson"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"
import Image from "next/image"

import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

export const getStaticProps = async (context: GetStaticPropsContext<{ profile: string }>) => {
	const ssg = createProxySSGHelpers({
		router: appRouter,
		ctx: { prisma, authUserId: null },
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
	const { data } = api.profile.getProfileByUsername.useQuery(username)

	if (!data) {
		return <div>{toast.error("Profile not exists!")}</div>
	}

	return (
		<>
			<Head>
				<title>{data.username}</title>
			</Head>
			<Layout>
				<div className="flex flex-col">
					<Image
						width={600}
						height={200}
						className="w-full  bg-black"
						src={""}
						alt={"banner"}
					></Image>
					<div className="flex justify-between">
						<div className="relative w-full">
							<Image
								className="absolute -top-16 rounded-full border-4 border-white "
								width={128}
								height={128}
								src={data.profileImageUrl}
								alt={"avatar"}
							></Image>
							<span
								className="absolute -top-16 h-32 w-32 rounded-full border-4 
							border-white bg-black bg-opacity-0 transition-all 
							duration-200 hover:bg-opacity-10"
							></span>
						</div>
						<button
							className="m-2 rounded-full bg-blue-500 py-2 px-4 font-bold text-white 
										hover:bg-blue-700"
						>
							Follow
						</button>
					</div>
					<h1 className="pl-2 pt-2 text-2xl font-semibold">{data.fullName}</h1>
					<span className="pl-2 font-normal text-slate-400">@{data.username}</span>
					<p className="pl-2">
						Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ab, nobis! Est
						quis, quaerat enim unde beatae doloremque, pariatur consequatur similique ut
						a aliquid quod minima provident officiis sequi explicabo vero!
					</p>
					<div className="flex gap-3 pt-2">
						<span className="flex">
							<Image
								width={18}
								height={18}
								src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/external-link.svg"
								alt={"icon"}
							></Image>
							<a href="www.google.pl" className="pl-1 text-blue-500">
								www.google.pl
							</a>
						</span>
						<span className="flex">
							<Image
								width={18}
								height={18}
								src="https://cdn.jsdelivr.net/npm/heroicons@1.0.1/outline/calendar.svg"
								alt={"icon"}
							></Image>
							<span className="pl-1 text-slate-500">
								since {dayjs(data.createdAt).fromNow()}
							</span>
						</span>
					</div>
					<div className="flex gap-10 pt-2">
						<span className="flex">
							<span className="">0</span>
							<span className="pl-1 text-slate-500">Watched</span>
						</span>
						<span className="flex">
							<span className="">0</span>
							<span className="pl-1 text-slate-500">Followed</span>
						</span>
					</div>
				</div>
			</Layout>
		</>
	)
}

export default Profile
