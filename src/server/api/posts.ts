import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import { filterClarkClientToUser } from "~/utils/helpers"

export const getPostReplays = async (postId: string) => {
	const getPostReplaysCount = prisma.post.count({
		where: {
			replayId: postId,
		},
	})

	const getPostReplays = prisma.post.findMany({
		where: {
			replayId: postId,
		},
		take: 15, //todo get from env
	})

	const [postReplaysCount, postReplays] = await Promise.all([getPostReplaysCount, getPostReplays])

	const replaysAuthors = await clerkClient.users.getUserList({
		userId: postReplays.map((post) => post.authorId),
	})

	if (!replaysAuthors) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Author of posts not found",
		})
	}

	return {
		replays: postReplays.map((postReplay) => {
			const postAuthor = replaysAuthors.find((user) => user.id === postReplay.authorId)
			if (!postAuthor) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author of one of the posts not found",
				})
			}
			return {
				post: { ...postReplay, createdAt: postReplay.createdAt.toString() },
				author: filterClarkClientToUser(postAuthor),
			}
		}),
		replaysCount: postReplaysCount,
	}
}

export const getPostById = async (postId: string) => {
	return await prisma.post.findUnique({
		where: {
			id: postId,
		},
	})
}
