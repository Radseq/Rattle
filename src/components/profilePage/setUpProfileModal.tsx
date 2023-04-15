import { type FC, useState } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { LoadingSpinner } from "../LoadingPage"
import { ParseZodErrorToString } from "~/utils/helpers"
import { FloatingInput } from "../FloatingInput"

export const SetUpProfileModal: FC<{
	webPage: string | null
	bio: string | null
	bannerImageUrl: string | null
	profileImageUrl: string | null
	showModal: (arg0: boolean) => void
}> = (props) => {
	const [userSettings, setUserSettings] = useState(props)
	const maxBioLength = 500
	const charsLeft: number | null = maxBioLength ? maxBioLength - props.bio!.length : null

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
						<div className="mt-2">
							<FloatingInput
								labelName="Banner Image URL"
								inputValue={userSettings.bannerImageUrl ?? ""}
								handleOnChange={(e: string) => {
									setUserSettings({
										...userSettings,
										bannerImageUrl: e,
									})
								}}
								maxLength={100}
							/>
						</div>
						<div className="mt-2">
							<FloatingInput
								labelName="Profile Image URL"
								inputValue={userSettings.profileImageUrl ?? ""}
								handleOnChange={(e: string) => {
									setUserSettings({
										...userSettings,
										profileImageUrl: e,
									})
								}}
								maxLength={100}
							/>
						</div>
						<div className="mt-2">
							<FloatingInput
								labelName="Website URL"
								inputValue={userSettings.webPage ?? ""}
								handleOnChange={(e: string) => {
									setUserSettings({
										...userSettings,
										webPage: e,
									})
								}}
								maxLength={50}
							/>
						</div>

						<div className="mt-2 flex-auto">
							<div className="relative">
								<textarea
									id="bio"
									rows={4}
									className="peer block w-full appearance-none rounded-lg border
										border-gray-300 bg-transparent px-2.5 pb-2.5 pt-4 text-sm 
										text-gray-900 focus:border-blue-600 focus:ring-0"
									placeholder=""
									value={userSettings.bio ?? ""}
									onChange={(e) => {
										if (charsLeft) {
											const calcLenth =
												charsLeft -
												(e.target.value.length - userSettings.bio!.length)

											if (calcLenth <= 0) {
												return
											}
										}
										setUserSettings({
											...userSettings,
											bio: e.target.value,
										})
										e.preventDefault()
									}}
								/>
								<label
									htmlFor="bio"
									className="absolute top-2 left-1 z-10 origin-[0] -translate-y-4 
										scale-75 transform bg-white px-2 text-sm text-gray-500 
										duration-300 peer-placeholder-shown:top-1/2 
										peer-placeholder-shown:-translate-y-1/2 
										peer-placeholder-shown:scale-100 peer-focus:top-2 
										peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 
										peer-focus:text-blue-600"
								>
									Bio
								</label>
								<label
									htmlFor="bio"
									className="absolute top-2 right-1 z-10 origin-[0] -translate-y-4 
										scale-75 transform bg-white px-2 text-sm text-gray-500 
										duration-300 peer-placeholder-shown:top-1/2 
										peer-placeholder-shown:-translate-y-1/2 
										peer-placeholder-shown:scale-100 peer-focus:top-2 
										peer-focus:-translate-y-4 peer-focus:scale-75 peer-focus:px-2 
										peer-focus:text-blue-600"
								>
									{`${maxBioLength}/${charsLeft}`}
								</label>
							</div>
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
