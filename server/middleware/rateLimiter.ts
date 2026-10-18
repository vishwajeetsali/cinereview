import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { Request, Response, NextFunction } from "express";

let rateLimit: Ratelimit | null = null;

try {
    if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
        const redis = new Redis({
            url: process.env.UPSTASH_REDIS_REST_URL,
            token: process.env.UPSTASH_REDIS_REST_TOKEN,
        });
        rateLimit = new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(5, "1 m"),
        });
    }
} catch (error: any) {
    console.warn("Failed to initialize Upstash rate limiter:", error.message);
}

export const rateLimitMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        if (!rateLimit) {
            return next();
        }

        const identifier = req.user?.userId || "anonymous";
        const { success } = await rateLimit.limit(identifier);

        if (!success) {
            return res.status(429).json({ message: "Too many requests" });
        }

        next();
    } catch (error: any) {
        console.error('Rate limiter error:', error.message);
        next(); // fail open — don't block request if rate limiter is down
    }
};