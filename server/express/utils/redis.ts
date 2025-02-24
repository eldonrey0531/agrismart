const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

// Create a wrapper to ensure consistent error handling and types
class RedisWrapper {
  private client: typeof Redis;

  constructor() {
    this.client = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      retryStrategy(times: number) {
        if (times > 3) {
          return undefined;
        }
        return Math.min(times * 200, 2000);
      }
    });
  }

  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value);
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setex(key, seconds, value);
  }

  async del(...keys: string[]): Promise<void> {
    if (keys.length) {
      await this.client.del(keys);
    }
  }

  async incr(key: string): Promise<number> {
    return this.client.incr(key);
  }

  async expire(key: string, seconds: number): Promise<void> {
    await this.client.expire(key, seconds);
  }

  async ttl(key: string): Promise<number> {
    return this.client.ttl(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern);
  }

  async scan(pattern: string): Promise<string[]> {
    const results: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, keys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        '100'
      );
      cursor = nextCursor;
      results.push(...keys);
    } while (cursor !== '0');

    return results;
  }

  async mget(keys: string[]): Promise<(string | null)[]> {
    if (!keys.length) return [];
    return this.client.mget(keys);
  }

  async disconnect(): Promise<void> {
    await this.client.quit();
  }
}

// Export singleton instance
export const redis = new RedisWrapper();