import type { GetStaticPropsContext, NextPage } from "next"
import Head from "next/head"
import { toast } from "react-hot-toast"
import { Layout } from "~/components/Layout"
import { LoadingSpinner } from "~/components/LoadingPage"
import { api } from "~/utils/api"
import { createProxySSGHelpers } from "@trpc/react-query/ssg"
import superjson from "superjson"
import { appRouter } from "~/server/api/root"
import { prisma } from "~/server/db"

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
	const { data, isLoading } = api.profile.getProfileByUsername.useQuery(username)

	if (isLoading) {
		return (
			<div className="flex justify-center ">
				<LoadingSpinner />
			</div>
		)
	}

	if (!data) {
		return <div>{toast.error("Profile not exists!")}</div>
	}

	return (
		<>
			<Head>
				<title>{data.username}</title>
			</Head>
			<Layout>
				<h1>profile page</h1>
			</Layout>
		</>
	)
}

export default Profile
