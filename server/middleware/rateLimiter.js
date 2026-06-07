import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = Redis.fromEnv();

const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export const rateLimitMiddleware = async (req, res, next) => {
    try {
        const { success } = await rateLimit.limit(req.user.userId);

        if (!success) {
            return res.status(429).json({ message: "Too many requests" });
        }

        next();
    } catch (error) {
        console.error('Rate limiter error:', error.message)
        next() // fail open — don't block request if rate limiter is down
    }
}