import Elysia, { NotFoundError, t } from "elysia";
import { auth } from "../auth/auth.macro";
import { GetUser } from "./use-cases/get-users.use-case";
import { UpdateUser } from "./use-cases/update-user.use-case";
import { InscribeUser } from "./use-cases/inscribe-user.use-case";
import { deobfuscateMacro } from "./deobfuscate-data.macro";
import { obfuscate } from "../../shared/crypto/helper";

const RebirthDataType = t.Object({
  rebirthCount: t.Number(),
  ascensionCount: t.Number(),
  transcendenceCount: t.Number(),
  furuborusCount: t.Number(),
  celestialToken: t.Number(),
  hasUsedOneTimeMultiplier: t.Boolean(),
  usedCupons: t.Array(t.String()),
  forus: t.Number(),
});

export const userController = new Elysia()
  .use(auth)
  .use(deobfuscateMacro)
  .post(
    "/inscribe",
    async ({ userId, set }) => {
      await InscribeUser(userId);
      set.status = 200;
    },
    {
      auth: true,
      tags: ["user"],
      response: {
        200: t.Void(),
      },
    },
  )
  .group("/user", (app) =>
    app
      .get(
        "/",
        async ({ userId }) => {
          const result = await GetUser(userId);
          if (!result[0]) throw new NotFoundError("User not found");
          const userData = result[0];
          const normalizedData = {
            fuba: userData.fuba,
            generators: userData.generators ?? undefined,
            inventory: userData.inventory ?? undefined,
            equipped: userData.equipped ?? undefined,
            rebirthData: userData.rebirthData
              ? {
                  rebirthCount: userData.rebirthData.rebirthCount,
                  ascensionCount: userData.rebirthData.ascensionCount,
                  transcendenceCount: userData.rebirthData.transcendenceCount,
                  furuborusCount: userData.rebirthData.furuborusCount,
                  celestialToken: userData.rebirthData.celestialToken,
                  hasUsedOneTimeMultiplier:
                    userData.rebirthData.hasUsedOneTimeMultiplier,
                  usedCoupons: userData.rebirthData.usedCupons,
                  forus: userData.rebirthData.forus,
                }
              : undefined,
            achievements: userData.achievements ?? undefined,
            achievementStats: userData.achievementsStats ?? undefined,
            upgrades: userData.upgrades ?? undefined,
          };
          const obfuscatedData = obfuscate(normalizedData);
          return { data: obfuscatedData };
        },
        {
          auth: true,
          response: {
            200: t.Object({
              data: t.String(),
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
