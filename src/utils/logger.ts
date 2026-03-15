import pino from "pino";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  serializers: {
    error: pino.stdSerializers.err,
  },
  transport:
    process.env.NODE_ENV !== "production"
      ? { target: "pino/file", options: { destination: 1 } }
      : undefined,
});

export function createChildLogger(name: string) {
  return logger.child({ module: name });
}
