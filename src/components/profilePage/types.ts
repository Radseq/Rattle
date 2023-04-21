export type Profile = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string | null
	createdAt: number
	bannerImgUrl: string | null
	bio: string | null
	webPage: string | null
}

export type SignInUser = {
	userId: string | undefined
	isSignedIn: boolean | undefined
	isLoaded: boolean
}
