import { Elysia } from "elysia";
import { authController } from "./features/auth";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { userController } from "./features/user";
import { rankingController } from "./features/ranking";
import cors from "@elysiajs/cors";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { logger } from "./shared/logger/logger";
import { rateLimiter } from "./features/rate-limiter/rate-limiter.macro";
import { TooManyAccounts } from "./shared/errors/too-many-accounts";
import { InvalidCredentials } from "./shared/errors/invalid-credentials";
import { runMigrations } from "./db/migrate";

const app = new Elysia()
  .error({
    DrizzleError,
    DrizzleQueryError,
    TooManyAccounts,
    InvalidCredentials,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case "VALIDATION":
        return error.detail(error.message);
      case "TooManyAccounts":
        set.status = 429;
        return { error: "Too Many Accounts", detail: error.message };
      case "InvalidCredentials":
        set.status = 401;
        return { error: error.message };
      case "DrizzleQueryError":
        if (error instanceof DrizzleQueryError) {
          logger.error("Database query error", {
            message: error.message,
            cause: error.cause,
            causeMessage: error.cause?.message,
            causeCode: (error.cause as any)?.code,
            causeDetail: (error.cause as any)?.detail,
          });
        }
        set.status = 500;
        return { error: "Database error" };
      case "DrizzleError":
        if (error instanceof DrizzleError) {
          logger.error("Database error", {
            message: error.message,
            cause: error.cause,
          });
        }
        set.status = 500;
        return { error: "Database error" };
      default:
        logger.error("Unhandled error", error);
        if (error instanceof Error) {
          logger.error(`Error name: ${error.name}, message: ${error.message}, stack: ${error.stack}`);
        }
        set.status = 500;
        return { error: "Unknown server error" };
    }
  })
  .use(openapi())
  .use(cors())
  .use(rateLimiter)
  .guard({
    rateLimit: true,
  })
  .use(userController)
  .use(authController)
  .use(rankingController);

runMigrations()
  .then(() => {
    logger.info("Server starting...");
    app.listen(3000);
  })
  .catch((error) => {
    logger.error("Failed to run migrations", error);
    process.exit(1);
  });
