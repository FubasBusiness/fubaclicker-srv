import { pino } from "pino";

const internalLogger = pino({
  transport: { target: "pino-pretty", options: { colorize: true } },
});
function loggerFactory() {
  function error(message?: string, err?: unknown) {
    if (err instanceof Error) {
      return message
        ? internalLogger.error(err, `[API-ERROR]: ${message}`)
        : internalLogger.error(err, `[API-ERROR]`);
    }
    if (message && err !== undefined) {
      return internalLogger.error({ payload: err }, `[API-ERROR]: ${message}`);
    }
    if (message) return internalLogger.error(`[API-ERROR]: ${message}`);
    return internalLogger.error(`[API-ERROR]`);
  }
  function info(message?: string, ...rest: unknown[]) {
    return message
      ? rest.length > 0
        ? internalLogger.info({ infos: rest }, `[API-INFO]: ${message}`)
        : internalLogger.info(`[API-INFO]: ${message}`)
      : internalLogger.info(`[API-INFO]`);
  }

  function warn(message?: string, ...rest: unknown[]) {
    return message
      ? rest.length > 0
        ? internalLogger.info({ infos: rest }, `[API-WARN]: ${message}`)
        : internalLogger.info(`[API-WARN]: ${message}`)
      : internalLogger.info(`[API-WARN]`);
  }

  return { error, info, warn };
}

export const logger = Object.freeze(loggerFactory());
