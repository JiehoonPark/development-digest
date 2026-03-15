import "dotenv/config";
import { runPipeline } from "./pipeline/pipeline.js";
import { logger } from "./utils/logger.js";

async function main() {
  try {
    await runPipeline();
    process.exit(0);
  } catch (error) {
    logger.fatal({ error }, "치명적 오류로 종료");
    process.exit(1);
  }
}

main();
