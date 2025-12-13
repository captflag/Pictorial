/**
 * Cache Service for Gemini API responses
 * Reduces API calls and improves performance for repeated queries
 */

interface CacheEntry<T> {
    data: T;
    timestamp: number;
    expiresIn: number; // milliseconds
}

const CACHE_PREFIX = 'pictorial_cache_';
const DEFAULT_TTL = 30 * 60 * 1000; // 30 minutes

class CacheService {
    private memoryCache: Map<string, CacheEntry<any>> = new Map();

    private generateKey(prefix: string, ...args: any[]): string {
        const hash = args.map(a => JSON.stringify(a)).join('_');
        return `${CACHE_PREFIX}${prefix}_${hash}`;
    }

    /**
     * Get cached data if valid
     */
    get<T>(key: string): T | null {
        // Check memory cache first
        const memEntry = this.memoryCache.get(key);
        if (memEntry && Date.now() < memEntry.timestamp + memEntry.expiresIn) {
            return memEntry.data as T;
        }

        // Check localStorage
        try {
            const stored = localStorage.getItem(key);
            if (stored) {
                const entry: CacheEntry<T> = JSON.parse(stored);
                if (Date.now() < entry.timestamp + entry.expiresIn) {
                    // Restore to memory cache
                    this.memoryCache.set(key, entry);
                    return entry.data;
                } else {
                    // Expired, clean up
                    localStorage.removeItem(key);
                }
            }
        } catch (e) {
            console.warn('Cache read error:', e);
        }

        return null;
    }

    /**
     * Store data in cache
     */
    set<T>(key: string, data: T, ttl: number = DEFAULT_TTL): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresIn: ttl,
        };

        // Store in memory
        this.memoryCache.set(key, entry);

        // Store in localStorage for persistence
        try {
            localStorage.setItem(key, JSON.stringify(entry));
        } catch (e) {
            console.warn('Cache write error (likely quota exceeded):', e);
            this.cleanup();
        }
    }

    /**
     * Create a cached version of an async function
     */
    cached<T, Args extends any[]>(
        fn: (...args: Args) => Promise<T>,
        keyPrefix: string,
        ttl: number = DEFAULT_TTL
    ): (...args: Args) => Promise<T> {
        return async (...args: Args): Promise<T> => {
            const key = this.generateKey(keyPrefix, ...args);

            // Check cache
            const cached = this.get<T>(key);
            if (cached !== null) {
                console.log(`[Cache HIT] ${keyPrefix}`);
                return cached;
            }

            console.log(`[Cache MISS] ${keyPrefix}`);

            // Execute and cache
            const result = await fn(...args);
            this.set(key, result, ttl);
            return result;
        };
    }

    /**
     * Invalidate a specific cache entry
     */
    invalidate(key: string): void {
        this.memoryCache.delete(key);
        localStorage.removeItem(key);
    }

    /**
     * Clear all cache entries
     */
    clear(): void {
        this.memoryCache.clear();

        // Clear localStorage entries with our prefix
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    /**
     * Remove expired entries to free up space
     */
    cleanup(): void {
        const now = Date.now();

        // Clean memory cache
        for (const [key, entry] of this.memoryCache.entries()) {
            if (now >= entry.timestamp + entry.expiresIn) {
                this.memoryCache.delete(key);
            }
        }

        // Clean localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                try {
                    const entry = JSON.parse(localStorage.getItem(key) || '{}');
                    if (now >= entry.timestamp + entry.expiresIn) {
                        keysToRemove.push(key);
                    }
                } catch {
                    keysToRemove.push(key);
                }
            }
        }
        keysToRemove.forEach(k => localStorage.removeItem(k));
    }

    /**
     * Get cache statistics
     */
    getStats(): { memoryEntries: number; localStorageEntries: number; totalSizeKB: number } {
        let localStorageEntries = 0;
        let totalSize = 0;

        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key?.startsWith(CACHE_PREFIX)) {
                localStorageEntries++;
                totalSize += (localStorage.getItem(key) || '').length;
            }
        }

        return {
            memoryEntries: this.memoryCache.size,
            localStorageEntries,
            totalSizeKB: Math.round(totalSize / 1024),
        };
    }
}

export const cacheService = new CacheService();

// Run cleanup on load
if (typeof window !== 'undefined') {
    cacheService.cleanup();
}
