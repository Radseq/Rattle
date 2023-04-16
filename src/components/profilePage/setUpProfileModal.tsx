import { type FC } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { LoadingSpinner } from "../LoadingPage"
import { ParseZodErrorToString } from "~/utils/helpers"
import { StyledInput, StyledLabel, StyledTextArea } from "../FloatingStyles"
import { useRestrictedInput, useRestrictedTextArea } from "~/hooks/useRestrictedInput"

const BANNER_MAX_LETTERS = 50
const PROFILE_MAX_LETTERS = 50
const WEBPAGE_MAX_LETTERS = 50
const BIO_MAX_LETTERS = 500

export const SetUpProfileModal: FC<{
	webPage: string | null
	bio: string | null
	bannerImageUrl: string | null
	profileImageUrl: string | null
	showModal: (arg0: boolean) => void
}> = (props) => {
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

	const {
		charsLeft: bannerCharsLeft,
		onChange: onBannerChange,
		value: bannerValue,
	} = useRestrictedInput(BANNER_MAX_LETTERS ?? 0, props.bannerImageUrl || "")

	const {
		charsLeft: profileCharsLeft,
		onChange: onProfileChange,
		value: profileValue,
	} = useRestrictedInput(PROFILE_MAX_LETTERS ?? 0, props.profileImageUrl || "")

	const {
		charsLeft: webpageCharsLeft,
		onChange: onWebPageChange,
		value: webPageValue,
	} = useRestrictedInput(WEBPAGE_MAX_LETTERS ?? 0, props.webPage || "")

	const {
		charsLeft: bioCharsLeft,
		onChange: onBioChange,
		value: bioValue,
	} = useRestrictedTextArea(WEBPAGE_MAX_LETTERS ?? 0, props.webPage || "")

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
							<div className="relative">
								<StyledInput
									id="bannerImageUrl"
									placeholder=""
									value={bannerValue}
									onChange={onBannerChange}
								/>
								<StyledLabel htmlFor="bannerImageUrl" side="left">
									Profile Image URL
								</StyledLabel>
								{bannerCharsLeft && (
									<StyledLabel
										side="right"
										htmlFor="bannerImageUrl"
									>{`${BANNER_MAX_LETTERS}/${bannerCharsLeft}`}</StyledLabel>
								)}
							</div>
						</div>

						<div className="mt-2">
							<div className="relative">
								<StyledInput
									id="profileImageUrl"
									placeholder=""
									value={profileValue}
									onChange={onProfileChange}
								/>
								<StyledLabel htmlFor="profileImageUrl" side="left">
									Profile Image URL
								</StyledLabel>
								{profileCharsLeft && (
									<StyledLabel
										side="right"
										htmlFor="profileImageUrl"
									>{`${PROFILE_MAX_LETTERS}/${profileCharsLeft}`}</StyledLabel>
								)}
							</div>
						</div>
						<div className="mt-2">
							<div className="relative">
								<StyledInput
									id="webpageUrl"
									placeholder=""
									value={webPageValue}
									onChange={onWebPageChange}
								/>
								<StyledLabel htmlFor="webpageUrl" side="left">
									Webpage URL
								</StyledLabel>
								{webpageCharsLeft && (
									<StyledLabel
										side="right"
										htmlFor="webpageUrl"
									>{`${WEBPAGE_MAX_LETTERS}/${webpageCharsLeft}`}</StyledLabel>
								)}
							</div>
						</div>

						<div className="mt-2 flex-auto">
							<div className="relative">
								<StyledTextArea
									id="bio"
									placeholder=""
									value={bioValue}
									onChange={onBioChange}
									rows={4}
								/>
								<StyledLabel htmlFor="bio" side="left">
									Bio
								</StyledLabel>
								{bioCharsLeft && (
									<StyledLabel
										side="right"
										htmlFor="bio"
									>{`${BIO_MAX_LETTERS}/${bioCharsLeft}`}</StyledLabel>
								)}
							</div>
						</div>
					</div>

					{(bannerValue || profileValue || webPageValue || bioValue) && (
						<div
							className="flex items-center justify-end rounded-b border-t 
										border-solid border-slate-200 p-6"
						>
							{isUpdating ? (
								<LoadingSpinner />
							) : (
								<button
									className="mr-1 mb-1 rounded bg-emerald-500 px-6 py-3 outline-none 
									transition-all duration-150 ease-linear hover:shadow-lg 
									focus:outline-none active:bg-emerald-600"
									type="button"
									onClick={(e) => {
										e.preventDefault()
										mutate({
											bannerImageUrl: bannerValue,
											bio: bioValue,
											profileImageUrl: profileValue,
											webPage: webPageValue,
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
