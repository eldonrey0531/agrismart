import { createClient } from 'redis'

/**
 * Redis wrapper with typed methods
 */
class RedisService {
  private client

  constructor() {
    this.client = createClient({
      url: process.env.REDIS_URL,
      socket: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379'),
      },
      password: process.env.REDIS_PASSWORD,
    })

    this.client.on('error', (err) => {
      console.error('Redis Client Error:', err)
    })

    this.client.connect().catch(console.error)
  }

  // Get a value
  async get(key: string): Promise<string | null> {
    return this.client.get(key)
  }

  // Set a value
  async set(key: string, value: string): Promise<void> {
    await this.client.set(key, value)
  }

  // Delete a key
  async del(key: string): Promise<void> {
    await this.client.del(key)
  }

  // Increment a counter
  async incr(key: string): Promise<number> {
    const result = await this.client.incr(key)
    return result
  }

  // Set expiration in seconds
  async expire(key: string, seconds: number): Promise<boolean> {
    return this.client.expire(key, seconds)
  }

  // Get time to live in seconds
  async getTTL(key: string): Promise<number> {
    return this.client.ttl(key)
  }

  // Set with expiry
  async setex(key: string, seconds: number, value: string): Promise<void> {
    await this.client.setEx(key, seconds, value)
  }

  // Check if key exists
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key)
    return result === 1
  }

  // Get all keys matching pattern
  async keys(pattern: string): Promise<string[]> {
    return this.client.keys(pattern)
  }

  // Clear all keys matching pattern
  async clearPattern(pattern: string): Promise<void> {
    const keys = await this.keys(pattern)
    if (keys.length > 0) {
      await this.client.del(keys)
    }
  }

  // Close connection
  async disconnect(): Promise<void> {
    await this.client.quit()
  }
}

// Lazy initialization of Redis client
let redisInstance: RedisService | null = null

export function getRedis(): RedisService {
  if (!redisInstance) {
    redisInstance = new RedisService()
  }
  return redisInstance
}

// Export singleton instance
export const redis = getRedis()

// Export type
export type { RedisService }