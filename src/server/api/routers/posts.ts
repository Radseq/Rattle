import clerkClient from "@clerk/clerk-sdk-node"
import { TRPCError } from "@trpc/server"
import { z } from "zod"
import { CreateRateLimit } from "~/RateLimit"
import { CONFIG } from "~/config"
import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc"
import {
	addTimeToDate,
	calculateSkip,
	filterClarkClientToAuthor,
	type TimeAddToDate,
} from "~/utils/helpers"
import {
	createPostOfPrismaPost,
	deletePost,
	deleteRepliesFromPost,
	getPostById,
	isPostExists,
} from "../posts"
import {
	getPostAuthor,
	getPostsLikedByUser,
	isPostsQuotedByUser,
	isUserForwardedPost,
	removeForwardedPostFromUser,
} from "../profile"
import { type CacheSpecialKey, getCacheData, setCacheData } from "~/server/cache"
import { fetchHomePosts } from "~/server/features/homePage"
import { type Post as PrismaPost } from "@prisma/client"
import type { Post, PostWithAuthor } from "~/components/post/types"
import { isFollowed } from "../follow"
import { type PostAuthor } from "~/features/profile"
import { fetchProfilePosts } from "~/server/features/profile"

const postRateLimit = CreateRateLimit({ requestCount: 1, requestCountPer: "1 m" })

const MAX_CACHE_POST_LIFETIME_IN_SECONDS = 60
const MAX_CACHE_USER_LIFETIME_IN_SECONDS = 600

export const postsRouter = createTRPCRouter({
	getAllByAuthorId: publicProcedure
		.input(
			z.object({
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
				authorId: z.string(),
			})
		)
		.query(async ({ ctx, input }) => {
			return fetchProfilePosts(
				ctx.authUserId,
				input.authorId,
				input.limit,
				input.cursor,
				input.skip
			)
		}),
	getHomePosts: privateProcedure
		.input(
			z.object({
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
			})
		)
		.query(async ({ ctx, input }) => {
			return fetchHomePosts(ctx.authUserId, input.limit, input.cursor, input.skip)
		}),
	getAll: publicProcedure.query(async ({ ctx }) => {
		// todo delete
		const posts = await ctx.prisma.post.findMany({ take: 10 })

		const users = (
			await clerkClient.users.getUserList({
				userId: posts.map((post) => post.authorId),
				limit: 10, // todo remove magic number
			})
		).map((user) => filterClarkClientToAuthor(user))

		return posts.map((post) => {
			const postAuthor = users.find((user) => user.id === post.authorId)
			if (!users) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Author of posts not found",
				})
			}
			return {
				post,
				postAuthor,
			}
		})
	}),
	createPost: privateProcedure
		.input(
			z.object({
				message: z
					.string()
					.min(1, { message: "Message is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Message is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				poll: z
					.object({
						choices: z
							.string()
							.array()
							.min(1, { message: "Post poll should have at last two elements!" }),
						length: z.object({
							days: z.number(),
							hours: z.number(),
							minutes: z.number(),
						}),
					})
					.optional(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			let createdPost: PrismaPost | false = false

			if (input.poll) {
				await ctx.prisma.$transaction(async (tx) => {
					// input.poll give us below error even if code is in guard if (input.poll)
					if (!input.poll) {
						throw new Error("Poll is not provided for post!")
					}

					createdPost = await tx.post.create({
						data: {
							authorId,
							content: input.message,
						},
					})

					const endDate = addTimeToDate(new Date(), input.poll.length as TimeAddToDate)
					if (!endDate) {
						throw new Error("Can't set end date for poll!")
					}

					const pollChoices = input.poll.choices.map((choice) => {
						return { choice: choice }
					})
					const createPoll = await tx.postPoll.create({
						data: {
							choices: {
								create: pollChoices,
							},
							postId: createdPost.id,
							endDate,
						},
					})
					if (!createPoll) {
						throw new Error("Can't create poll for post!")
					}
				})
			} else {
				createdPost = await ctx.prisma.post.create({
					data: {
						authorId,
						content: input.message,
					},
				})
			}

			if (!createdPost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Can't create post",
				})
			}

			const returnPost = createPostOfPrismaPost(createdPost)

			const postCacheKey: CacheSpecialKey = { id: returnPost.id, type: "post" }
			void setCacheData(postCacheKey, returnPost, MAX_CACHE_POST_LIFETIME_IN_SECONDS)

			return returnPost
		}),
	createQuotedPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Message is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Message is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				quotedPostId: z.string().min(25, { message: "wrong quotedPostId" }),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			const postExists = await isPostExists(input.quotedPostId)
			if (!postExists) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Quoted post not exists",
				})
			}

			const create = await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content,
					quotedId: input.quotedPostId,
				},
			})

			const quotedPostCacheKey: CacheSpecialKey = { id: input.quotedPostId, type: "post" }
			const quotedPost = await getCacheData<Post>(quotedPostCacheKey)
			if (quotedPost) {
				quotedPost.quotedCount += 1
				void setCacheData(
					quotedPostCacheKey,
					quotedPost,
					MAX_CACHE_POST_LIFETIME_IN_SECONDS
				)
			}

			return create
		}),
	createReplyPost: privateProcedure
		.input(
			z.object({
				content: z
					.string()
					.min(1, { message: "Reply is too small" })
					.max(CONFIG.MAX_POST_MESSAGE_LENGTH, {
						message: `Reply is too large, max ${CONFIG.MAX_POST_MESSAGE_LENGTH} characters`,
					}),
				replyPostId: z.string().cuid(),
			})
		)
		.mutation(async ({ ctx, input }) => {
			const authorId = ctx.authUserId
			const { success } = await postRateLimit.limit(authorId)

			if (!success) {
				throw new TRPCError({ code: "TOO_MANY_REQUESTS" })
			}

			const createdReply = await ctx.prisma.post.create({
				data: {
					authorId,
					content: input.content,
					replyId: input.replyPostId,
				},
			})

			const replyPostCacheKey: CacheSpecialKey = { id: input.replyPostId, type: "post" }
			const replayPost = await getCacheData<Post>(replyPostCacheKey)
			if (replayPost) {
				replayPost.replyCount += 1
				void setCacheData(replyPostCacheKey, replayPost, MAX_CACHE_POST_LIFETIME_IN_SECONDS)
			}

			const returnPost = createPostOfPrismaPost(createdReply)
			const replyCacheKey: CacheSpecialKey = { id: createdReply.id, type: "post" }
			void setCacheData(replyCacheKey, returnPost, MAX_CACHE_POST_LIFETIME_IN_SECONDS)

			return returnPost
		}),
	deletePost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const postId = input
			const authorId = ctx.authUserId
			const deletedPost = await deletePost(postId, authorId)
			if (deletedPost) {
				await Promise.all([
					removeForwardedPostFromUser(authorId, postId),
					deleteRepliesFromPost(postId),
				])
			}
			return deletedPost
		}),
	getPostReplies: publicProcedure
		.input(
			z.object({
				postId: z.string().min(25, { message: "wrong postId" }),
				limit: z.number(),
				cursor: z.string().nullish(),
				skip: z.number().optional(),
			})
		)
		.query(async ({ input, ctx }) => {
			const { limit, postId, cursor, skip } = input
			const take = limit ?? CONFIG.MAX_POST_REPLIES

			const getPostReplies = await ctx.prisma.post.findMany({
				where: { replyId: postId },
				skip: calculateSkip(skip, cursor),
				take: take + 1,
				cursor: cursor ? { id: cursor } : undefined,
				orderBy: { createdAt: "desc" },
				select: {
					id: true,
					authorId: true,
				},
			})

			const postReplies = await Promise.all(
				getPostReplies.map((post) => getPostById(post.id))
			)

			let nextCursor: typeof cursor | undefined = undefined
			if (getPostReplies.length > limit) {
				const nextItem = getPostReplies.pop() // return the last item from the array
				nextCursor = nextItem?.id
			}

			let postsLikedByUser: string[] = []
			let postsQuotedByUser: string[] = []
			let isAuthorFollowed = false
			if (ctx.authUserId) {
				const postReplyIds = postReplies.map((post) => post.id)

				const [getPostsLikedBySignInUser, getPostsIdsQuotedByUser, getAuthorFollowed] =
					await Promise.all([
						getPostsLikedByUser(ctx.authUserId, postReplyIds),
						isPostsQuotedByUser(ctx.authUserId, postReplyIds),
						isFollowed(ctx.authUserId, postReplies[0]?.authorId ?? ""),
					])
				postsLikedByUser = getPostsLikedBySignInUser
				postsQuotedByUser = getPostsIdsQuotedByUser
				isAuthorFollowed = getAuthorFollowed
			}

			const postAuthors = await Promise.all(
				getPostReplies.map((post) => getPostAuthor(post.authorId))
			)

			const result = postReplies.map((postReply) => {
				const postAuthor = postAuthors.find((user) => user.id === postReply.authorId)
				if (!postAuthor || !postAuthor.username) {
					throw new TRPCError({
						code: "INTERNAL_SERVER_ERROR",
						message: "Author of one of the posts not found",
					})
				}
				return {
					post: {
						...postReply,
						createdAt: postReply.createdAt.toString(),
					},
					signInUser: {
						isLiked: postsLikedByUser.some((post) => post === postReply.id),
						isQuoted: postsQuotedByUser.some((post) => post === postReply.id),
						authorFollowed: isAuthorFollowed,
					},
					author: postAuthor,
				} as PostWithAuthor
			})

			return {
				result,
				nextCursor,
			}
		}),
	forwardPost: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const [isAlreadyForwarded, postExists] = await Promise.all([
				isUserForwardedPost(ctx.authUserId, input),
				isPostExists(input),
			])

			if (isAlreadyForwarded) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is already forwarded!",
				})
			}
			if (!postExists) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post not exists!",
				})
			}

			const createForward = await ctx.prisma.userPostForward.create({
				data: {
					userId: ctx.authUserId,
					postId: input,
				},
			})

			if (!createForward) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Unable to forward post!",
				})
			}

			const postCacheKey: CacheSpecialKey = { id: input, type: "post" }
			let post = await getCacheData<Post>(postCacheKey)
			if (post) {
				post.forwardsCount += 1
			} else {
				post = await getPostById(input)
			}
			void setCacheData(postCacheKey, post, MAX_CACHE_POST_LIFETIME_IN_SECONDS)

			const authorCacheKey: CacheSpecialKey = { id: post.authorId, type: "author" }
			let author: PostAuthor | null = await getCacheData<PostAuthor>(authorCacheKey)
			if (!author) {
				author = await getPostAuthor(post.authorId)
				void setCacheData(authorCacheKey, author, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
			}

			const userCacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "postsForwarded" }
			const cacheIds = await getCacheData<string[]>(userCacheKey)
			if (cacheIds) {
				cacheIds.push(input)
				void setCacheData(userCacheKey, cacheIds, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
			}

			// todo uncomment after testing
			// if (getPostToForward.authorId === ctx.authUserId) {
			// 	throw new TRPCError({
			// 		code: "INTERNAL_SERVER_ERROR",
			// 		message: "Can't forward own post!",
			// 	})
			// }

			return {
				post,
				author,
			} as PostWithAuthor
		}),
	removePostForward: privateProcedure
		.input(z.string().min(25, { message: "wrong postId" }))
		.mutation(async ({ ctx, input }) => {
			const forwardedPost = await isUserForwardedPost(ctx.authUserId, input)

			if (!forwardedPost) {
				throw new TRPCError({
					code: "INTERNAL_SERVER_ERROR",
					message: "Post is not forwarded!",
				})
			}

			await ctx.prisma.userPostForward.deleteMany({
				where: {
					postId: input,
					userId: ctx.authUserId,
				},
			})

			const postCacheKey: CacheSpecialKey = { id: input, type: "post" }
			let post = await getCacheData<Post>(postCacheKey)
			if (post) {
				post.forwardsCount -= 1
			} else {
				post = await getPostById(input)
			}
			void setCacheData(postCacheKey, post, MAX_CACHE_POST_LIFETIME_IN_SECONDS)

			const userCacheKey: CacheSpecialKey = { id: ctx.authUserId, type: "postsForwarded" }
			const cacheIds = await getCacheData<string[]>(userCacheKey)
			if (cacheIds) {
				const removed = cacheIds.filter((postId) => postId !== input)
				void setCacheData(userCacheKey, removed, MAX_CACHE_USER_LIFETIME_IN_SECONDS)
			}

			return post
		}),
})
