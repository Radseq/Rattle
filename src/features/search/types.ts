import { RouterOutputs } from "~/utils/api"

export type Profile = {
	id: string
	username: string
	fullName: string
	imageUrl: string
}

export type SearchResult = RouterOutputs["search"]["getAllUsersAndTags"]
