import { clerkClient } from "@clerk/nextjs/server"
import { TRPCError } from "@trpc/server"
import { prisma } from "../db"
import { filterClarkClientToUser } from "~/utils/helpers"

export const getPostReplas = async (postId: string) => {
	const postReplays = await prisma.post.findMany({
		where: {
			replayId: postId,
		},
		take: 15, //todo get from env
	})

	const replaysAuthors = await clerkClient.users.getUserList({
		userId: postReplays.map((post) => post.authorId),
	})

	if (!replaysAuthors) {
		throw new TRPCError({
			code: "INTERNAL_SERVER_ERROR",
			message: "Author of posts not found",
		})
	}

	return postReplays.map((postReplay) => {
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
	})
}

export const getPostById = async (postId: string) => {
	return await prisma.post.findUnique({
		where: {
			id: postId,
		},
	})
}
