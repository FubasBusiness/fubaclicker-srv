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
const app = new Elysia()
  .error({
    DrizzleError,
    DrizzleQueryError,
    TooManyAccounts,
  })
  .onError(({ error, code, set }) => {
    switch (code) {
      case "VALIDATION":
        return error.detail(error.message);
      case "TooManyAccounts":
        set.status = 429;
        return { error: "Too Many Accounts", detail: error.message };
      default:
        logger.error(undefined, error);
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
  .use(rankingController)
  .listen(3000);
