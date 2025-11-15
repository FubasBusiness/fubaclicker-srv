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
  usedCoupons: t.Array(t.String()),
  forus: t.Number(),
  cauldronUnlocked: t.Boolean(),
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
          const obfuscatedData = obfuscate(userData);
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
          const result = await GetUser(userId);
          if (!result[0]) throw new NotFoundError("User not found");
          const updatedUserData = result[0];
          const obfuscatedData = obfuscate(updatedUserData);
          set.status = 200;
          return { data: obfuscatedData };
        },
        {
          auth: true,
          deobfuscate: true,
          body: t.Object({
            data: t.String(),
          }),
          tags: ["user"],
          response: {
            200: t.Object({
              data: t.String(),
            }),
            400: t.Object({ error: t.Nullable(t.String()) }),
          },
        },
      ),
  );
