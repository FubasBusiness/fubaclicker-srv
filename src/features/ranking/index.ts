import Elysia, { t } from "elysia";
import { auth } from "../auth/auth.macro";
import { GetTopFifty } from "./use-case/get-top-fifty";

const rebirthData = t.Object({
  rebirthCount: t.Number(),
  ascensionCount: t.Number(),
  transcendenceCount: t.Number(),
  furuborusCount: t.Number(),
  celestialToken: t.Number(),
  hasUsedOneTimeMultiplier: t.Boolean(),
  usedCoupons: t.Array(t.String()),
  forus: t.Number(),
});

export const rankingController = new Elysia()
  .use(auth)
  .group("/ranking", (app) =>
    app.get(
      "/",
      async () => {
        return await GetTopFifty();
      },
      {
        response: t.Array(
          t.Object({
            username: t.String(),
            rebirthData: t.Nullable(rebirthData),
            achievements: t.Nullable(t.Array(t.String())),
            fuba: t.String(),
          }),
        ),
      },
    ),
  );
