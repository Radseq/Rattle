export type Profile = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string | null
	createdAt: number
	extended: ProfileExtend | null
}

export type ProfileExtend = {
	bannerImgUrl: string | null
	bio: string | null
	webPage: string | null
	country: string | null
}

export type SignInUser = {
	userId: string | null
	isSignedIn: boolean
}

export type ProfilePageType = "view" | "own" | "follow" | "unfollow"
