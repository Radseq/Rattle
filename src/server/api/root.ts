import { createTRPCRouter } from "~/server/api/trpc"
import { postsRouter } from "~/server/api/routers/posts"
import { profileRouter } from "./routers/profile"
import { followRouter } from "./routers/follow"
import { searchRouter } from "./routers/features"
import { privateMessagesRouter } from "../features/privateMessages"

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
	posts: postsRouter,
	profile: profileRouter,
	follow: followRouter,
	search: searchRouter,
	privateMessages: privateMessagesRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter
