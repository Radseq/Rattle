export type Profile = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string
	createdAt: number
	extended: ProfileExtend | null
}

export type ProfileExtend = {
	bannerImgUrl: string | null
	bio: string | null
	webPage: string | null
	country: string | null
}

export type ProfilePageType = "view" | "own" | "follow" | "unfollow"

export type PostAuthor = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string
}
