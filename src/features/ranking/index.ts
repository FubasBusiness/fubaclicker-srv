import Elysia, { t } from "elysia";
import { auth } from "../auth/auth.macro";
import { GetTopFifty } from "./use-case/get-top-fifty";

export const rankingController = new Elysia()
  .use(auth)
  .group("/ranking", (app) =>
    app.get(
      "/",
      async () => {
        return await GetTopFifty();
      },
      { auth: true, response: t.Array(t.Object({ username: t.String() })) },
    ),
  );
