import Redis from "ioredis";

// Redis URL (default or env)
const REDIS_URL: string = process.env.REDIS_URL ?? "redis://127.0.0.1:6379";
// Export redis provider
const cache = new Redis(REDIS_URL);
export default cache;
