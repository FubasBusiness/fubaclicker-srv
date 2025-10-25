import Elysia, { t } from "elysia";
import { signAccess, verifyAccess } from "./utils/crypto";
import { IssueRefresh, RotateRefresh } from "./repository";

export const auth = new Elysia({ name: "auth.macros" })
  .macro("authBase", {
    headers: t.Object({
      authorization: t.Optional(t.String()),
      refresh_token: t.Optional(t.String()),
    }),
    resolve: async ({ headers: { authorization, refresh_token } }) => {
      if (!authorization || !refresh_token)
        return { userId: null, auth: null, refresh_token: null };
      const auth = await verifyAccess(authorization);
      if (!auth) return { userId: null, auth: null, refresh_token };
      const { sub: userId } = auth;
      return { userId: Number(userId), auth, refresh_token };
    },
  })
  .macro("auth", {
    authBase: true,
    resolve: ({ userId }) => ({ userId: userId! }),
    beforeHandle: async ({ set, auth, refresh_token, userId }) => {
      if (!auth) {
        set.status = 401;
        set.headers["www-authenticate"] = 'Bearer realm="api"';
        return { error: "Unauthorized" };
      }
      if (auth.exp * 1000 - Date.now() <= 120_000) {
        const newJwt = await signAccess({
          aud: "web",
          sub: String(userId!),
        });
        set.headers["authorization"] = `Bearer ${newJwt}`;
        if (!refresh_token) {
          const newToken = await IssueRefresh(userId!);
          set.status = 200;
          set.headers["refresh_token"] = newToken.raw;
          return;
        }
        const rotate = await RotateRefresh(refresh_token);
        if (!rotate) {
          set.status = 401;
          set.headers["www-authenticate"] = 'Bearer realm="api"';
          return { error: "Unauthorized" };
        }
        set.headers["refresh_token"] = rotate.newRaw;
      }
    },
  });
