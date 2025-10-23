import { Elysia } from "elysia";
import { authController } from "./features/auth";
import openapi, { fromTypes } from "@elysiajs/openapi";
import { userController } from "./features/user";
import { rankingController } from "./features/ranking";

const app = new Elysia()
  .use(openapi())
  .use(userController)
  .use(authController)
  .use(rankingController)
  .listen(3000);
