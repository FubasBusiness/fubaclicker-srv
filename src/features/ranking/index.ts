import Elysia, { t } from "elysia";
import { auth } from "../auth/auth.macro";
import { GetTopFifty } from "./use-case/get-top-fifty";
import { GetTopFiftyInscribed } from "./use-case/get-top-fifty-inscribed";

export const rankingController = new Elysia()
  .use(auth)
  .group("/ranking", (app) =>
    app
      .get(
        "/",
        async () => {
          return await GetTopFifty();
        },
        {
          response: t.Array(
            t.Object({
              username: t.String(),
              data: t.String(),
            }),
          ),
        },
      )
      .get(
        "/inscribed",
        async () => {
          return await GetTopFiftyInscribed();
        },
        {
          response: t.Array(
            t.Object({
              username: t.String(),
              data: t.String(),
            }),
          ),
        },
      ),
  );
