import type { GetServerSideProps, InferGetServerSidePropsType, NextPage } from "next"

export const getServerSideProps: GetServerSideProps<{
	question: string
	source: string
}> = async (props) => {
	//http://localhost:3000/search?q=Holandii&src=trend_click&vertical=trends
	const question = props.query.q as string
	const source = props.query?.src as string

	return {
		props: {
			question,
			source,
		},
	}
}

const Search: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = ({
	question,
	source,
}) => {
	return (
		<>
			{question} {source}
			haha
		</>
	)
}

export default Search
