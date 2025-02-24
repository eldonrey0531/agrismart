import Redis from 'ioredis';
import { appConfig } from '../config/app.config';
import { log } from '../utils/logger';
import { throwError } from './errors';

class RedisService {
  private client: Redis;
  private isConnected: boolean = false;

  constructor() {
    this.client = new Redis(appConfig.redis.url, {
      password: appConfig.redis.password,
      retryStrategy: (times) => {
        const delay = Math.min(times * 50, 2000);
        return delay;
      },
      maxRetriesPerRequest: 3
    });

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.client.on('connect', () => {
      this.isConnected = true;
      log.info('Redis connected successfully');
    });

    this.client.on('error', (error) => {
      this.isConnected = false;
      log.error('Redis connection error:', error);
    });

    this.client.on('reconnecting', () => {
      log.info('Redis reconnecting...');
    });
  }

  public isReady(): boolean {
    return this.isConnected;
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      log.error('Redis get error:', { error, key });
      return null;
    }
  }

  public async set(key: string, value: any, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl) {
        await this.client.set(key, stringValue, 'EX', ttl);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      log.error('Redis set error:', { error, key });
      throwError.externalService('Redis', 'Failed to set value');
    }
  }

  public async del(key: string | string[]): Promise<void> {
    try {
      await this.client.del(Array.isArray(key) ? key : [key]);
    } catch (error) {
      log.error('Redis delete error:', { error, key });
      throwError.externalService('Redis', 'Failed to delete value');
    }
  }

  public async exists(key: string): Promise<boolean> {
    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      log.error('Redis exists error:', { error, key });
      return false;
    }
  }

  public async keys(pattern: string): Promise<string[]> {
    try {
      return await this.client.keys(pattern);
    } catch (error) {
      log.error('Redis keys error:', { error, pattern });
      return [];
    }
  }

  // Session management
  public async setSession(userId: string, sessionId: string, data: any, ttl: number): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.set(key, {
      ...data,
      lastAccess: new Date().toISOString()
    }, ttl);
  }

  public async getSession(userId: string, sessionId: string): Promise<any> {
    const key = `session:${userId}:${sessionId}`;
    return this.get(key);
  }

  public async removeSession(userId: string, sessionId: string): Promise<void> {
    const key = `session:${userId}:${sessionId}`;
    await this.del(key);
  }

  public async removeAllSessions(userId: string): Promise<void> {
    const keys = await this.keys(`session:${userId}:*`);
    if (keys.length > 0) {
      await this.del(keys);
    }
  }

  // Cache management
  public async setCache<T>(key: string, data: T, ttl: number): Promise<void> {
    const cacheKey = `cache:${key}`;
    await this.set(cacheKey, data, ttl);
  }

  public async getCache<T>(key: string): Promise<T | null> {
    const cacheKey = `cache:${key}`;
    return this.get<T>(cacheKey);
  }

  public async invalidateCache(pattern: string): Promise<void> {
    const keys = await this.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await this.del(keys);
    }
  }

  // Rate limiting
  public async increment(key: string, ttl: number): Promise<number> {
    try {
      const count = await this.client.incr(key);
      if (count === 1) {
        await this.client.expire(key, ttl);
      }
      return count;
    } catch (error) {
      log.error('Redis increment error:', { error, key });
      return 0;
    }
  }

  // Pub/Sub
  public subscribe(channel: string, callback: (message: string) => void): void {
    const subscriber = this.client.duplicate();
    subscriber.subscribe(channel, (error, count) => {
      if (error) {
        log.error('Redis subscribe error:', { error, channel });
        return;
      }
      log.info(`Subscribed to ${count} channels`);
    });

    subscriber.on('message', (ch, message) => {
      if (ch === channel) {
        callback(message);
      }
    });
  }

  public async publish(channel: string, message: string): Promise<void> {
    try {
      await this.client.publish(channel, message);
    } catch (error) {
      log.error('Redis publish error:', { error, channel });
      throwError.externalService('Redis', 'Failed to publish message');
    }
  }

  // Cleanup
  public async quit(): Promise<void> {
    try {
      await this.client.quit();
      this.isConnected = false;
      log.info('Redis connection closed');
    } catch (error) {
      log.error('Redis quit error:', error);
    }
  }
}

// Export singleton instance
export const redis = new RedisService();