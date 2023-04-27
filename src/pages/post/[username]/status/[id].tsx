import { type NextPage } from "next"
import { Layout } from "~/components/Layout"
import { PostContent } from "~/components/postReplayPage/PostContent"
import { ProfileSimple } from "~/components/postReplayPage/ProfileSimple"

const ReplayPost: NextPage = () => {
	return (
		<Layout>
			<div className="h-48 flex-col pt-2">
				<ProfileSimple
					fullName="John Brown"
					profileImageUrl="https://img.freepik.com/free-vector/isolated-young-handsome-man-different-poses-white-background-illustration_632498-859.jpg?t=st=1682533159~exp=1682533759~hmac=425cb0c37d202bc59c34c9ac4934b704eeec0f5c9c0898734324c3c65e44353e"
					username="johnB"
				/>
				<PostContent
					postCreateDate="9:01 AM · Apr 27, 2023"
					message={`Lorem ipsum dolor sit amet consectetur adipisicing elit. Accusamus tempora, ipsum
	beatae fuga et ea sapiente quam adipisci odit non corporis atque totam inventore
	voluptas, porro quisquam distinctio. Quod, quis.`}
				/>
				<hr className="my-2" />
			</div>
		</Layout>
	)
}

export default ReplayPost
