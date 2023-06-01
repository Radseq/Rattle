import { SignIn as ClerkSignIn, useUser } from "@clerk/nextjs"
import { getAuth } from "@clerk/nextjs/server"
import { type GetServerSidePropsContext, type NextPage } from "next"
import { LoadingPage } from "~/components/LoadingPage"

export const getServerSideProps = (props: GetServerSidePropsContext) => {
	const { userId } = getAuth(props.req)

	if (userId) {
		return {
			redirect: {
				destination: "/home",
				permanent: false,
			},
		}
	}

	return {
		props: {},
	}
}

const signIn: NextPage = () => {
	const { isLoaded } = useUser()

	if (!isLoaded) {
		return <LoadingPage />
	}

	return (
		<div>
			<ClerkSignIn
				appearance={{
					elements: {
						rootBox: "mx-auto",
					},
				}}
				redirectUrl={"/home"}
			/>
		</div>
	)
}

export default signIn
