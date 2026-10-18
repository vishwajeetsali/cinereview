import { Redis } from '@upstash/redis';

type SetOptions = Parameters<Redis['set']>[2];

const hasRedisConfig = Boolean(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN);

if (!hasRedisConfig) {
    console.warn('Warning: Upstash Redis env vars missing. Caching will be disabled.');
}

const redis = hasRedisConfig
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL!,
        token: process.env.UPSTASH_REDIS_REST_TOKEN!
    })
    : null;

export const cacheGet = async <T = any>(key: string): Promise<T | null> => {
    if (!redis) return null;
    try {
        return await redis.get<T>(key);
    } catch (error: any) {
        console.warn(`[Redis Cache] GET failed for "${key}": ${error?.message || error}`);
        return null;
    }
};

export const cacheSet = async (
    key: string,
    value: any,
    options?: SetOptions
): Promise<void> => {
    if (!redis) return;
    try {
        await redis.set(key, value, options);
    } catch (error: any) {
        console.warn(`[Redis Cache] SET failed for "${key}": ${error?.message || error}`);
    }
};

export const cacheDel = async (key: string): Promise<void> => {
    if (!redis) return;
    try {
        await redis.del(key);
    } catch (error: any) {
        console.warn(`[Redis Cache] DEL failed for "${key}": ${error?.message || error}`);
    }
};

export default redis;