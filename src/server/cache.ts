import { Redis } from "@upstash/redis"

export type CacheSpecialKey = { type: string; id: string }

export const getCacheData = async <T>(key: CacheSpecialKey) => {
	const redis = Redis.fromEnv()
	if (redis) {
		const value = await redis.get<T>(JSON.stringify(key))
		if (value) {
			return value
		}
	}
	return null
}

export const setCacheData = async <T>(
	key: CacheSpecialKey,
	value: T,
	ttlInSeconds: number | null = null
) => {
	const redis = Redis.fromEnv()
	if (redis) {
		const specialKey = JSON.stringify(key)
		await redis.set(specialKey, value)
		if (ttlInSeconds) {
			await redis.expire(specialKey, ttlInSeconds)
		}
	}
}
