import { createChildLogger } from "../utils/logger.js";

const log = createChildLogger("step-runner");

export async function runStep<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  log.info({ step: name }, "단계 시작");

  try {
    const result = await fn();
    const elapsed = Date.now() - start;
    log.info({ step: name, elapsed: `${elapsed}ms` }, "단계 완료");
    return result;
  } catch (error) {
    const elapsed = Date.now() - start;
    log.error({ step: name, elapsed: `${elapsed}ms`, error }, "단계 실패");
    throw error;
  }
}
