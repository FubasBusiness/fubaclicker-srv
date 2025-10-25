import Elysia, { NotFoundError, t } from "elysia";
import { auth } from "../auth/auth.macro";
import { GetUser } from "./use-cases/get-users.use-case";
import { UpdateUser } from "./use-cases/update-user.use-case";
import { deobfuscateMacro } from "./deobfuscate-data.macro";

const RebirthDataType = t.Object({
  rebirthCount: t.Number(),
  ascensionCount: t.Number(),
  transcendenceCount: t.Number(),
  celestialToken: t.Number(),
  hasUsedOneTimeMultiplier: t.Boolean(),
  usedCupons: t.Array(t.String()),
});

export const userController = new Elysia()
  .use(auth)
  .use(deobfuscateMacro)
  .group("/user", (app) =>
    app
      .get(
        "/",
        async ({ userId }) => {
          const result = await GetUser(userId);
          if (!result[0]) throw new NotFoundError("User not found");
          return result[0];
        },
        {
          auth: true,
          response: {
            200: t.Object({
              id: t.Number(),
              email: t.String(),
              username: t.String(),
              fuba: t.String(),
              generators: t.Nullable(t.Array(t.Number())),
              inventory: t.Nullable(t.Record(t.String(), t.Number())),
              equipped: t.Nullable(t.Array(t.String())),
              rebirthData: t.Nullable(RebirthDataType),
              achievements: t.Nullable(t.Array(t.String())),
              achievementsStats: t.Nullable(t.Record(t.String(), t.Number())),
              upgrades: t.Nullable(t.Record(t.String(), t.Number())),
            }),
          },
          tags: ["user"],
        },
      )
      .put(
        "/",
        async ({ userData, errorMessage, set, userId }) => {
          if (!userData) {
            set.status = 400;
            return { error: errorMessage };
          }
          await UpdateUser(userId, userData);
          set.status = 200;
        },
        {
          auth: true,
          deobfuscate: true,
          body: t.Object({
            data: t.String(),
          }),
          tags: ["user"],
          response: {
            200: t.Void(),
            400: t.Object({ error: t.Nullable(t.String()) }),
          },
        },
      ),
  );
