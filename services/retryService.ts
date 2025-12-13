/**
 * Retry Service with Exponential Backoff
 * Handles API failures gracefully with configurable retry logic
 */

interface RetryOptions {
    maxRetries?: number;
    baseDelayMs?: number;
    maxDelayMs?: number;
    backoffFactor?: number;
    retryOn?: (error: any) => boolean;
    onRetry?: (attempt: number, error: any, delayMs: number) => void;
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
    maxRetries: 3,
    baseDelayMs: 1000,
    maxDelayMs: 30000,
    backoffFactor: 2,
    retryOn: (error) => {
        // Retry on network errors or rate limits
        if (error?.message?.includes('fetch')) return true;
        if (error?.status === 429) return true; // Rate limit
        if (error?.status >= 500) return true; // Server errors
        return false;
    },
    onRetry: () => { },
};

/**
 * Sleep for specified milliseconds
 */
const sleep = (ms: number): Promise<void> =>
    new Promise(resolve => setTimeout(resolve, ms));

/**
 * Calculate delay with exponential backoff and jitter
 */
const calculateDelay = (
    attempt: number,
    baseDelay: number,
    maxDelay: number,
    factor: number
): number => {
    const exponentialDelay = baseDelay * Math.pow(factor, attempt);
    const jitter = Math.random() * 0.3 * exponentialDelay; // 0-30% jitter
    return Math.min(exponentialDelay + jitter, maxDelay);
};

/**
 * Execute a function with retry logic
 */
export async function withRetry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const opts = { ...DEFAULT_OPTIONS, ...options };
    let lastError: any;

    for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error;

            // Check if we should retry
            if (attempt < opts.maxRetries && opts.retryOn(error)) {
                const delay = calculateDelay(
                    attempt,
                    opts.baseDelayMs,
                    opts.maxDelayMs,
                    opts.backoffFactor
                );

                opts.onRetry(attempt + 1, error, delay);
                console.warn(`[Retry] Attempt ${attempt + 1}/${opts.maxRetries} after ${Math.round(delay)}ms`, error);

                await sleep(delay);
            } else {
                throw error;
            }
        }
    }

    throw lastError;
}

/**
 * Create a retryable version of an async function
 */
export function createRetryable<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    options: RetryOptions = {}
): (...args: Args) => Promise<T> {
    return (...args: Args) => withRetry(() => fn(...args), options);
}

/**
 * Rate limiter to prevent hitting API limits
 */
class RateLimiter {
    private queue: (() => void)[] = [];
    private processing = false;
    private lastCall = 0;
    private minInterval: number;

    constructor(callsPerSecond: number = 2) {
        this.minInterval = 1000 / callsPerSecond;
    }

    async acquire(): Promise<void> {
        return new Promise((resolve) => {
            this.queue.push(resolve);
            this.process();
        });
    }

    private async process(): Promise<void> {
        if (this.processing) return;
        this.processing = true;

        while (this.queue.length > 0) {
            const now = Date.now();
            const elapsed = now - this.lastCall;

            if (elapsed < this.minInterval) {
                await sleep(this.minInterval - elapsed);
            }

            this.lastCall = Date.now();
            const resolve = this.queue.shift();
            resolve?.();
        }

        this.processing = false;
    }
}

export const geminiRateLimiter = new RateLimiter(2); // 2 calls per second

/**
 * Wrap a function with rate limiting
 */
export function withRateLimit<T, Args extends any[]>(
    fn: (...args: Args) => Promise<T>,
    limiter: RateLimiter = geminiRateLimiter
): (...args: Args) => Promise<T> {
    return async (...args: Args): Promise<T> => {
        await limiter.acquire();
        return fn(...args);
    };
}
