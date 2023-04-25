import type { RouterOutputs } from "~/utils/api"

export type PostWithUser = RouterOutputs["posts"]["getAllByAuthorId"][number]

export type PostMenuItemsType = "view" | "followedAuthor" | "notFollowedAuthor" | "own"
