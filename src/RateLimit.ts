import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

type Unit = "ms" | "s" | "m" | "h" | "d"
export type Duration = `${number} ${Unit}` | `${number}${Unit}`

// Create a new ratelimiter, that allows 1 requests per duration unit
export const CreateRateLimit = (props: {
	requestCount: number
	requestCountPer: Duration
	prefix?: string
}) => {
	const ratelimit = new Ratelimit({
		redis: Redis.fromEnv(),
		limiter: Ratelimit.slidingWindow(props.requestCount, props.requestCountPer),
		analytics: true,
		/**
		 * Optional prefix for the keys used in redis. This is useful if you want to share a redis
		 * instance with other applications and want to avoid key collisions. The default prefix is
		 * "@upstash/ratelimit"
		 */
		prefix: props.prefix ?? "@upstash/ratelimit",
	})
	return ratelimit
}
