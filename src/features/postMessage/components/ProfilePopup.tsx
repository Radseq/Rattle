import { type FC } from "react"
import { PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"
import { ProfileAvatarImageUrl, ProfileWatchedWatching } from "~/features/profile"

const Profile = () => {
	return (
		<article className="absolute left-0 top-4 z-20 hidden rounded-lg  border-2 border-gray-400 bg-gray-200 p-4 text-black group-hover:flex">
			<div className="relative w-72">
				<header className="flex justify-between ">
					<div>
						<ProfileAvatarImageUrl
							src={
								"https://images.clerk.dev/oauth_github/img_2NhNM5PBaAPdmXD88zbRk5GLAAP.png"
							}
						/>
						<div className=" mt-1 flex w-10/12 flex-col">
							<div className="h-5 font-bold">{"radosław"}</div>
							<div className="text-gray-500">{`@${"radseq"}`}</div>
						</div>
					</div>
					<div>
						<PrimaryButton
							onClick={(e) => {
								e.stopPropagation()
							}}
						>
							Follow
						</PrimaryButton>
					</div>
				</header>
				<div className="mt-2">
					<span>
						SpaceX designs, manufactures and launches the world’s most advanced rockets
						and spacecraft
					</span>
				</div>
				<footer className="mt-2">
					<ProfileWatchedWatching
						watchedWatchingCount={{ watchedCount: 0, watchingCount: 0 }}
					/>
				</footer>
			</div>
		</article>
	)
}

export const ProfilePopup: FC<{ profileName: string }> = ({ profileName }) => {
	return (
		<span className="group relative  text-blue-400 ">
			{profileName} <Profile />
		</span>
	)
}
