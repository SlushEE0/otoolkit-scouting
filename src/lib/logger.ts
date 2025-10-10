import pino from "pino";

// Lightweight universal logger wrapper around pino that works in both
// browser and server (Node / edge) environments. In the browser we avoid
// pretty transports to keep bundle size minimal.
const isBrowser = typeof window !== "undefined";

export const logger = pino({
  level: process.env.NEXT_PUBLIC_LOG_LEVEL || "info",
  base: { env: process.env.NODE_ENV },
  timestamp: pino.stdTimeFunctions.isoTime,
  // Pretty transport only in dev & server side
  ...(isBrowser
    ? { browser: { asObject: true } }
    : process.env.NODE_ENV === "development"
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" }
        }
      }
    : {})
});

export type Logger = typeof logger;
