import { Elysia } from "elysia";
import { authController } from "./features/auth";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { userController } from "./features/user";
import { rankingController } from "./features/ranking";
import cors from "@elysiajs/cors";

const app = new Elysia()
  .use(openapi({ enabled: !!!Bun.env.NODE_ENV }))
  .use(
    cors({
      origin: /^(?:www\.)?fubaclicker\.com\.br$/,
    }),
  )
  .use(userController)
  .use(authController)
  .use(rankingController)
  .listen(3000);
