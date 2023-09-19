import Link from "next/link"
import { type FC } from "react"
import { ProfileSimple } from "~/components/postRepliesPage/ProfileSimple"
import { PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"
import { useGetPeoples } from "../hooks/useGetPeoples"
import { LoadingPage } from "~/components/LoadingPage"
import { api } from "~/utils/api"
import toast from "react-hot-toast"
import { CONFIG } from "~/config"
import { type Profile } from "~/features/profile"

const PeopleItem: FC<{ people: Profile; onFollowClick: (id: string) => void }> = ({
	people,
	onFollowClick,
}) => {
	return (
		<li>
			<article>
				<ProfileSimple
					fullName={people.fullName}
					profileImageUrl={people.profileImageUrl}
					username={people.username}
				>
					<div className="">
						<PrimaryButton
							onClick={(e) => {
								e.stopPropagation()
								onFollowClick(people.id)
							}}
						>
							Follow
						</PrimaryButton>
					</div>
				</ProfileSimple>
				{people.extended && <div className="p-4">{people.extended.bio}</div>}
			</article>
		</li>
	)
}

export const Peoples: FC<{ tag: string }> = ({ tag }) => {
	const { peoples, peoplesLoading } = useGetPeoples(tag)

	if (!peoples.at(0)) {
		return null
	}

	if (peoplesLoading) {
		return (
			<div className="relative">
				<LoadingPage />
			</div>
		)
	}

	const addUserToFollow = api.follow.addUserToFollow.useMutation({
		onSuccess: (result) => {
			toast.success(`${result.addedUserName} is now followed`)
		},
		onError: () => {
			toast.error("Failed to follow! Please try again later", {
				duration: CONFIG.TOAST_ERROR_DURATION_MS,
			})
		},
	})

	return (
		<div>
			<h1 className="text-2xl font-bold">People</h1>
			<ul>
				{peoples.map((people) => {
					return (
						<PeopleItem
							onFollowClick={() => addUserToFollow.mutate(people.id)}
							people={people}
							key={people.id}
						/>
					)
				})}
			</ul>
			<Link className="font-medium text-blue-600" href={""}>
				View all
			</Link>
		</div>
	)
}
