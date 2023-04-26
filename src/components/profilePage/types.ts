export type Profile = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string | null
	createdAt: number
	bannerImgUrl: string | null
	bio: string | null
	webPage: string | null
	watchedCount: number | null
	watchingCount: number | null
}

export type SignInUser = {
	userId: string | null
	isSignedIn: boolean
}

export type ProfilePageType = "view" | "own" | "follow" | "unfollow"
