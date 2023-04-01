import { type NextPage } from "next"
import Head from "next/head"
import { Layout } from "~/components/Layout"

const Home: NextPage = () => {
	return (
		<>
			<Head>
				<title>Create T3 App</title>
				<meta name="description" content="Rattle" />
				<link rel="icon" href="/favicon.ico" />
			</Head>
			<Layout></Layout>
		</>
	)
}

export default Home
