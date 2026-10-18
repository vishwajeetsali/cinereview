import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Request, Response, NextFunction } from "express";

const redis = Redis.fromEnv();

const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, "1 m"),
});

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const identifier = req.user?.userId || "anonymous";
        const { success } = await rateLimit.limit(identifier);

        if (!success) {
            return res.status(429).json({ message: "Too many requests" });
        }

        next();
    } catch (error: any) {
        console.error('Rate limiter error:', error.message)
        next() // fail open — don't block request if rate limiter is down
    }
}