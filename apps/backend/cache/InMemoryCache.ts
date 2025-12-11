import { ICache } from './ICache';

interface CacheItem<T> {
  value: T;
  expiry: number;
  timeoutId: NodeJS.Timeout;
}

export class InMemoryCache implements ICache {
  private cache: Map<string, CacheItem<any>> = new Map();

  async get<T>(key: string): Promise<T | null> {
    const item = this.cache.get(key);
    
    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.delete(key);
      return null;
    }

    return item.value as T;
  }

  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    // Clear existing timeout if key exists
    const existingItem = this.cache.get(key);

    if (existingItem) {
      clearTimeout(existingItem.timeoutId);
    }

    const ttlMs = ttlSeconds * 1000;
    const expiry = Date.now() + ttlMs;

    const timeoutId = setTimeout(() => {
      this.delete(key);
    }, ttlMs);
    
    timeoutId.unref();

    this.cache.set(key, { value, expiry, timeoutId });
  }

  async delete(key: string): Promise<void> {
    const item = this.cache.get(key);

    if (item) {
      clearTimeout(item.timeoutId);
      this.cache.delete(key);
    }
  }

  async clear(): Promise<void> {
    for (const [key, item] of this.cache) {
      clearTimeout(item.timeoutId);
    }
    this.cache.clear();
  }
}
