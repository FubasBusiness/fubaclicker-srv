import Elysia, { t } from "elysia";
import { signAccess, verifyAccess } from "./utils/crypto";
import { IssueRefresh, RotateRefresh } from "./repository";

export const auth = new Elysia({ name: "auth.macros" })
  .macro("authBase", {
    cookie: t.Cookie({
      rt: t.Optional(t.String()),
      authorization: t.Optional(t.String()),
    }),
    resolve: async ({ cookie }) => {
      const authorization = cookie.authorization.value;
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
    beforeHandle: async ({ set, cookie, auth, userId }) => {
      if (!auth) {
        set.status = 401;
        return {
          error: "Unauthorized",
          reason: "No authorization token provided on header",
        };
      }
      if (auth.exp * 1000 - Date.now() <= 120_000) {
        const newJwt = await signAccess({
          aud: "web",
          sub: String(userId!),
        });
        cookie.authorization.set({
          value: `Bearer ${newJwt}`,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: "none",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        if (!cookie.rt.value) {
          const newToken = await IssueRefresh(userId!);
          cookie.rt.set({
            value: newToken.raw,
            httpOnly: true,
            secure: Bun.env.NODE_ENV === "production",
            sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
          });
          return;
        }
        const rotate = await RotateRefresh(cookie.rt.value);
        if (!rotate) {
          set.status = 401;
          set.headers["www-authenticate"] = 'Bearer realm="api"';
          return {
            error: "Unauthorized",
            reason: "Error on rotating refresh token",
          };
        }
        cookie.rt.set({
          value: rotate.newRaw,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
      }
    },
  });
