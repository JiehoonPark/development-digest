export class RateLimiter {
  private queue: Array<() => void> = [];
  private running = 0;

  constructor(
    private readonly concurrency: number,
    private readonly intervalMs: number
  ) {}

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    await this.waitForSlot();
    this.running++;

    try {
      const result = await fn();
      return result;
    } finally {
      this.running--;
      await this.delay(this.intervalMs);
      this.releaseNext();
    }
  }

  private waitForSlot(): Promise<void> {
    if (this.running < this.concurrency) {
      return Promise.resolve();
    }
    return new Promise<void>((resolve) => {
      this.queue.push(resolve);
    });
  }

  private releaseNext() {
    const next = this.queue.shift();
    if (next) next();
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
