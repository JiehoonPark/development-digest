import { createChildLogger } from "./logger.js";

const log = createChildLogger("retry");

interface RetryOptions {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  for (let attempt = 1; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === opts.maxRetries;
      if (isLastAttempt) {
        log.error({ label, attempt, error }, "모든 재시도 실패");
        throw error;
      }

      const delay = Math.min(
        opts.baseDelayMs * Math.pow(2, attempt - 1),
        opts.maxDelayMs
      );
      log.warn({ label, attempt, delay }, "재시도 대기 중");
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw new Error("unreachable");
}
