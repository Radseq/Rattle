import { type FC, useState } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { LoadingSpinner } from "../LoadingPage"
import { ParseZodErrorToString } from "~/utils/helpers"

export const SetUpProfileModal: FC<{
	webPage: string | null
	bio: string | null
	bannerImageUrl: string | null
	profileImageUrl: string | null
	showModal: (arg0: boolean) => void
}> = (props) => {
	const [userSettings, setUserSettings] = useState(props)

	const { mutate, isLoading: isUpdating } = api.profile.updateUser.useMutation({
		onSuccess: () => {
			toast.success("Successfully updated!")
		},
		onError: (e) => {
			const error =
				ParseZodErrorToString(e.data?.zodError) ??
				"Failed to update settings! Please try again later"
			toast.error(error, { duration: 10000 })
		},
	})

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center 
							overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
		>
			<div className="relative my-6 mx-auto w-auto max-w-3xl">
				<div
					className="relative flex w-full flex-col rounded-lg border-0 
									bg-white shadow-lg outline-none focus:outline-none"
				>
					<div
						className="flex items-start justify-between rounded-t 
										border-b border-solid border-slate-200 p-5 text-gray-800"
					>
						<h3 className="text-3xl font-semibold">Profile Settings</h3>
						<button
							className="float-right ml-auto border-0 p-1 text-3xl font-semibold 
											leading-none text-black outline-none focus:outline-none"
							onClick={() => {
								props.showModal(false)
							}}
						>
							<span
								className="block h-6 w-6 bg-transparent text-2xl 
												text-black outline-none focus:outline-none"
							>
								×
							</span>
						</button>
					</div>
					<div className="p-2">
						<div className="">
							<input
								type="url"
								id="banner"
								className="mb-2 block w-full rounded-lg border border-gray-300
												bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 
												focus:ring-blue-500 "
								placeholder="Banner image URL"
								value={userSettings.bannerImageUrl ?? ""}
								onChange={(e) => {
									setUserSettings({
										...userSettings,
										bannerImageUrl: e.target.value,
									})
									e.preventDefault()
								}}
							></input>
						</div>
						<div className="">
							<input
								type="url"
								id="profileImage"
								className="mb-2 block w-full rounded-lg border border-gray-300 
												bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 
												focus:ring-blue-500"
								placeholder="Profile image URL"
								value={userSettings.profileImageUrl ?? ""}
								onChange={(e) => {
									setUserSettings({
										...userSettings,
										profileImageUrl: e.target.value,
									})
									e.preventDefault()
								}}
							></input>
						</div>
						<div className="mt-2">
							<input
								type="url"
								className="block w-full rounded-lg border border-gray-300 
												bg-gray-50 p-2.5 text-sm text-gray-900 
												focus:border-blue-500 focus:ring-blue-500"
								placeholder="Website URL"
								value={userSettings.webPage ?? ""}
								onChange={(e) => {
									setUserSettings({
										...userSettings,
										webPage: e.target.value,
									})
									e.preventDefault()
								}}
							></input>
						</div>

						<div className="mt-2 flex-auto">
							<textarea
								rows={4}
								className="block w-full rounded-lg border border-gray-300 
												bg-gray-50 p-2.5 text-sm focus:border-blue-500 
												focus:ring-blue-500 "
								placeholder="Write your bio..."
								value={userSettings.bio ?? ""}
								onChange={(e) => {
									setUserSettings({
										...userSettings,
										bio: e.target.value,
									})
									e.preventDefault()
								}}
							></textarea>
						</div>
					</div>

					{(userSettings.bannerImageUrl || userSettings.bio || userSettings.webPage) && (
						<div
							className="flex items-center justify-end rounded-b border-t 
										border-solid border-slate-200 p-6"
						>
							{isUpdating ? (
								<LoadingSpinner />
							) : (
								<button
									className="mr-1 mb-1 rounded bg-emerald-500 px-6 py-3 
												outline-none transition-all duration-150 ease-linear 
												hover:shadow-lg focus:outline-none active:bg-emerald-600"
									type="button"
									onClick={(e) => {
										e.preventDefault()
										mutate({
											bannerImageUrl: userSettings.bannerImageUrl,
											bio: userSettings.bio,
											profileImageUrl: userSettings.profileImageUrl,
											webPage: userSettings.webPage,
										})
									}}
								>
									Save Changes
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
