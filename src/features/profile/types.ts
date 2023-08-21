export type Profile = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string
	createdAt: number
	extended: ProfileExtend | null
}

export type WatchedWatching = {
	watchedCount: number
	watchingCount: number
}

export type ProfileExtend = {
	bannerImgUrl: string | null
	bio: string | null
	webPage: string | null
	country: string | null
}

export type PostAuthor = {
	id: string
	username: string
	profileImageUrl: string
	fullName: string
}
