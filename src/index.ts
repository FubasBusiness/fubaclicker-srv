import { Elysia } from "elysia";
import { authController } from "./features/auth";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { userController } from "./features/user";
import { rankingController } from "./features/ranking";
import cors from "@elysiajs/cors";
import { DrizzleError, DrizzleQueryError } from "drizzle-orm";
import { logger } from "./shared/logger/logger";
const app = new Elysia()
  .error({
    DrizzleError,
    DrizzleQueryError,
  })
  .onError(({ error, code }) => {
    switch(code){
      case "VALIDATION": return error.detail(error.message);
      default: logger.error(undefined, error)
    }
  })
  .use(
    openapi({
      // enabled: !!!Bun.env.NODE_ENV
    }),
  )
  .use(
    cors({
      // origin: /^(?:www\.)?fubaclicker\.com\.br$/,
    }),
  )
  .use(userController)
  .use(authController)
  .use(rankingController)
  .listen(3000);
