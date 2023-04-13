import { type FC, useState } from "react"

export const SetUpProfileModal: FC<{
	webPage: string
	bio: string
	bannerImageUrl: string
	profileImageUrl: string
}> = (props) => {
	const [showModal, setShowModal] = useState<boolean>()

	const [userSettings, setUserSettings] = useState(props)

	return (
		<div>
			<button
				className="block rounded-lg bg-blue-500 px-5 py-2.5 text-center font-bold text-white 
             hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 
             dark:hover:bg-blue-700 dark:focus:ring-blue-800"
				type="button"
				onClick={(e) => {
					setShowModal(true)
					e.preventDefault()
				}}
			>
				Set up profile
			</button>

			{showModal ? (
				<>
					<div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden outline-none focus:outline-none">
						<div className="relative my-6 mx-auto w-auto max-w-3xl">
							<div
								className="relative flex w-full flex-col rounded-lg border-0 bg-white shadow-lg 
							outline-none focus:outline-none"
							>
								<div className="flex items-start justify-between rounded-t border-b border-solid border-slate-200 p-5 text-gray-800">
									<h3 className="text-3xl font-semibold">Profile Settings</h3>
									<button
										className="float-right ml-auto border-0 p-1 text-3xl font-semibold leading-none text-black 
										outline-none focus:outline-none"
										onClick={() => {
											setShowModal(false)
										}}
									>
										<span className="block h-6 w-6 bg-transparent text-2xl text-black outline-none focus:outline-none">
											×
										</span>
									</button>
								</div>
								<div className="p-2">
									<div className="">
										<input
											type="url"
											id="banner"
											className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 
											"
											placeholder="Banner image URL"
											value={userSettings.bannerImageUrl}
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
											className="mb-2 block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500 
											"
											placeholder="Profile image URL"
											value={userSettings.profileImageUrl}
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
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 
											text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
											placeholder="Website URL"
											value={userSettings.webPage}
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
											className="block w-full rounded-lg border border-gray-300 bg-gray-50 
											p-2.5 text-sm focus:border-blue-500 focus:ring-blue-500 "
											placeholder="Write your bio..."
											value={userSettings.bio}
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

								{(userSettings.bannerImageUrl ||
									userSettings.bio ||
									userSettings.webPage) && (
									<div className="flex items-center justify-end rounded-b border-t border-solid border-slate-200 p-6">
										<button
											className="mr-1 mb-1 rounded bg-emerald-500 px-6 py-3 text-sm font-bold uppercase text-white shadow outline-none transition-all duration-150 ease-linear hover:shadow-lg focus:outline-none active:bg-emerald-600"
											type="button"
											onClick={() => setShowModal(false)}
										>
											Save Changes
										</button>
									</div>
								)}
							</div>
						</div>
					</div>
					<div className="fixed inset-0 z-40 bg-black opacity-25"></div>
				</>
			) : null}
		</div>
	)
}
