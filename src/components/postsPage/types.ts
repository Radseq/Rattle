import { RouterOutputs } from "~/utils/api"

export type PostWithUser = RouterOutputs["posts"]["getAllByAuthorId"][number]
