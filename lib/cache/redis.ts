// lib/cache/redis.ts

import { Redis } from "@upstash/redis";

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * Upstash Redis client for caching data.
 */
export const redis = new Redis({
  url: REDIS_URL,
  token: REDIS_TOKEN,
  // Set timeout of 5 seconds for each request
  signal: () => AbortSignal.timeout(5000)
});
