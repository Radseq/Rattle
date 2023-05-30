import { SignIn, useUser } from "@clerk/nextjs"
import { getAuth } from "@clerk/nextjs/server"
import { GetServerSidePropsContext, NextPage } from "next"
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
			<SignIn
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
