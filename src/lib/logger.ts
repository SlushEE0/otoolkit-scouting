import pino, { type LoggerOptions } from "pino";

// Lightweight universal logger wrapper around pino that works in both
// browser and server (Node / edge) environments without relying on worker
// transports that Next.js cannot bundle (eg. thread-stream).
const isBrowser = typeof window !== "undefined";

const baseOptions: LoggerOptions = {
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
  base: { env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime
};

if (isBrowser) {
  baseOptions.browser = { asObject: true };
}

export const logger = pino(baseOptions);

export type Logger = typeof logger;
