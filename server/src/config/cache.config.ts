import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

export const cacheConfig = {
  client: redis,
  prefix: 'agrismart:',
  ttl: 3600, // 1 hour default TTL
  
  async get(key: string): Promise<any> {
    const data = await redis.get(`${this.prefix}${key}`);
    return data ? JSON.parse(data) : null;
  },
  
  async set(key: string, value: any, ttl: number = this.ttl): Promise<void> {
    await redis.set(
      `${this.prefix}${key}`,
      JSON.stringify(value),
      'EX',
      ttl
    );
  },
  
  async del(key: string): Promise<void> {
    await redis.del(`${this.prefix}${key}`);
  },
  
  async clear(): Promise<void> {
    const keys = await redis.keys(`${this.prefix}*`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }
};
