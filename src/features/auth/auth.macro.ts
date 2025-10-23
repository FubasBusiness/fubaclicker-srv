import Elysia, { t } from "elysia";
import { signAccess, verifyAccess } from "./utils/crypto";
import { RotateRefresh } from "./repository";

export const auth = new Elysia({ name: "auth.macros" })
  .macro("authBase", {
    headers: t.Object({
      authorization: t.Optional(t.String()),
    }),
    cookie: t.Cookie({
      rt: t.Optional(t.String()),
    }),
    resolve: async ({ headers: { authorization } }) => {
      if (!authorization) return { userId: null, auth: null };
      const auth = await verifyAccess(authorization);
      if (!auth) return { userId: null, auth: null };
      const { sub: userId } = auth;
      return { userId: Number(userId), auth };
    },
  })
  .macro("auth", {
    authBase: true,
    resolve: ({ userId }) => ({ userId: userId! }),
    beforeHandle: async ({ set, cookie, auth }) => {
      if (!auth || !cookie.rt.value) {
        set.status = 401;
        set.headers["www-authenticate"] = 'Bearer realm="api"';
        return { error: "Unauthorized" };
      }
      if (auth.exp * 1000 - Date.now() <= 120_000) {
        const rotate = await RotateRefresh(cookie.rt.value);
        if (!rotate) {
          set.status = 401;
          set.headers["www-authenticate"] = 'Bearer realm="api"';
          return { error: "Unauthorized" };
        }
        const newJwt = await signAccess({
          aud: "web",
          sub: String(rotate.userId),
        });
        set.headers["authorization"] = `Bearer ${newJwt}`;
        cookie.rt.set({ value: rotate.newRaw });
      }
    },
  });
