import { type FC } from "react"
import toast from "react-hot-toast"
import { api } from "~/utils/api"
import { useRestrictedInput, useRestrictedTextArea } from "~/hooks/useRestrictedInput"
import {
	StyledInput,
	StyledLabel,
	StyledTextArea,
} from "~/components/styledHTMLElements/FloatingStyles"
import { LoadingSpinner } from "~/components/LoadingPage"
import { PrimaryButton } from "~/components/styledHTMLElements/StyledButtons"

const BANNER_MAX_LETTERS = 100
const PROFILE_MAX_LETTERS = 100
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
		onError: () => {
			toast.error("Failed to update settings! Please try again later", { duration: 10000 })
		},
	})

	const bannerInput = useRestrictedInput(BANNER_MAX_LETTERS ?? 0, props.bannerImageUrl || "")

	const profileInput = useRestrictedInput(PROFILE_MAX_LETTERS ?? 0, props.profileImageUrl || "")

	const webPageInput = useRestrictedInput(WEBPAGE_MAX_LETTERS ?? 0, props.webPage || "")

	const bioTextArea = useRestrictedTextArea(BIO_MAX_LETTERS ?? 0, props.bio || "")

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center 
							overflow-y-auto overflow-x-hidden outline-none focus:outline-none"
		>
			<div className="relative mx-auto my-6 w-auto max-w-3xl">
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
								className="block size-6 bg-transparent text-2xl 
												text-black outline-none focus:outline-none"
							>
								×
							</span>
						</button>
					</div>
					<div className="p-2">
						<div className="mt-2">
							<div className="relative">
								<StyledInput id="bannerImageUrl" {...bannerInput} />
								<StyledLabel htmlFor="bannerImageUrl" side="left">
									Banner Image URL
								</StyledLabel>
								<StyledLabel
									side="right"
									htmlFor="bannerImageUrl"
								>{`${BANNER_MAX_LETTERS}/${bannerInput.charsLeft}`}</StyledLabel>
							</div>
						</div>
						<div className="mt-2">
							<div className="relative">
								<StyledInput
									id="profileImageUrl"
									placeholder=""
									{...profileInput}
								/>
								<StyledLabel htmlFor="profileImageUrl" side="left">
									Profile Image URL
								</StyledLabel>
								<StyledLabel
									side="right"
									htmlFor="profileImageUrl"
								>{`${PROFILE_MAX_LETTERS}/${profileInput.charsLeft}`}</StyledLabel>
							</div>
						</div>
						<div className="mt-2">
							<div className="relative">
								<StyledInput id="webpageUrl" placeholder="" {...webPageInput} />
								<StyledLabel htmlFor="webpageUrl" side="left">
									Webpage URL
								</StyledLabel>
								<StyledLabel
									side="right"
									htmlFor="webpageUrl"
								>{`${WEBPAGE_MAX_LETTERS}/${webPageInput.charsLeft}`}</StyledLabel>
							</div>
						</div>
						<div className="mt-2 flex-auto">
							<div className="relative">
								<StyledTextArea id="bio" placeholder="" {...bioTextArea} rows={4} />
								<StyledLabel htmlFor="bio" side="left">
									Bio
								</StyledLabel>
								<StyledLabel
									side="right"
									htmlFor="bio"
								>{`${BIO_MAX_LETTERS}/${bioTextArea.charsLeft}`}</StyledLabel>
							</div>
						</div>
					</div>

					{(bannerInput.value ||
						profileInput.value ||
						webPageInput.value ||
						bioTextArea.value) && (
						<div
							className="flex items-center justify-end rounded-b border-t 
										border-solid border-slate-200 p-6"
						>
							{isUpdating ? (
								<LoadingSpinner />
							) : (
								<PrimaryButton
									onClick={(e) => {
										e.preventDefault()
										mutate({
											bannerImageUrl: bannerInput.value,
											bio: bioTextArea.value,
											profileImageUrl: profileInput.value,
											webPage: webPageInput.value,
										})
									}}
								>
									Save Changes
								</PrimaryButton>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	)
}
