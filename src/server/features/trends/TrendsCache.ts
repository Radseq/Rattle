import { prisma } from "~/server/db"

export type Trend = {
	addDate: Date
	word: string
	postIds: string[]
}

// TODO write whole api for cache trends.... xD

const CLEAR_CACHE_EVERY_MS = 3 * 60 * 60 * 1000 // 3hours

const globalTrendsRegionalCache = global as unknown as { cache: Map<string, Trend[]> }

;(function () {
	if (globalTrendsRegionalCache.cache) {
		return globalTrendsRegionalCache.cache
	}
	globalTrendsRegionalCache.cache = new Map<string, Trend[]>()
})()

// remove older trends than 1 day
;(function () {
	setInterval(() => {
		globalTrendsRegionalCache.cache.forEach((value, key) => {
			const yesterday = new Date()
			yesterday.setDate(yesterday.getDate() - 1)
			globalTrendsRegionalCache.cache.set(
				key,
				value.filter((trend) => trend.addDate < yesterday)
			)
		})
	}, CLEAR_CACHE_EVERY_MS)
})()

const TrendsCache = (() => {
	return {
		AddToCache: (postMessage: string, postId: string, region: string) => {
			const cache = globalTrendsRegionalCache.cache.get(region) || []

			if (cache) {
				postMessage.split(" ").forEach((word) => {
					if (!Number(word) || (false && word.length > 3) || !word.startsWith("@")) {
						const normalizeWord = word.toLocaleLowerCase()

						const trend = cache.find(
							(trend) => trend.word.toLocaleLowerCase() === normalizeWord
						)

						if (trend) {
							trend.postIds.push(postId)
						} else {
							cache.push({ addDate: new Date(), postIds: [postId], word })
						}
					}
				})
			}
			cache.sort((a, b) => b.postIds.length - a.postIds.length)
			globalTrendsRegionalCache.cache.set(region, cache)
		},
		GeTrends: (region: string, limit?: number) => {
			const cacheTrends = globalTrendsRegionalCache.cache.get(region) || []
			const trends = cacheTrends.map((trend) => {
				return { word: trend.word, postsCount: trend.postIds.length }
			})
			if (limit) {
				return trends.slice(0, limit)
			}
			return trends
		},
		GetTrendPostIds: (region: string, trendWord: string) => {
			const cache = globalTrendsRegionalCache.cache.get(region) || []
			const trend = cache.find((trend) => trend.word === trendWord.toLocaleLowerCase())
			if (trend) {
				return trend.postIds
			}
			return []
		},
	} as const
})()

export const Trends = () => {
	return {
		AddTrends: (postMessage: string, postId: string, region: string) =>
			TrendsCache.AddToCache(postMessage, postId, region),
		GetTrends: (region: string, limit?: number) => TrendsCache.GeTrends(region, limit),
		GetTrendPosts: (region: string, trendWord: string) =>
			TrendsCache.GetTrendPostIds(region, trendWord),
	}
}
// temp to feed trends
;(async function () {
	const trends = Trends()
	if (!trends.GetTrends("word", 1).length) {
		const posts = await prisma.post.findMany()
		posts.forEach((element) => {
			trends.AddTrends(element.content, element.id, "world")
		})
	}
})()