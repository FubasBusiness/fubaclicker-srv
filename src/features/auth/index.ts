import Elysia, { t } from "elysia";
import { auth } from "./auth.macro";
import { LogIn, Register } from "./use-cases";

export const authController = new Elysia().group("/auth", (app) =>
  app
    .post(
      "/login",
      async ({ body: { email, password }, set, cookie }) => {
        const { jwt, raw } = await LogIn({ email, password });
        cookie.rt.set({
          value: raw,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        cookie.authorization.set({
          value: `Bearer ${jwt}`,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        set.status = 200;
        return { jwt, raw };
      },
      {
        body: t.Object({
          email: t.String({
            format: "email",
            error: "Must provide a email",
          }),
          password: t.String({
            error: "Must provide a password",
          }),
        }),
        response: t.Object({
          jwt: t.String(),
          raw: t.String(),
        }),
        detail: {
          summary: "Sign in user",
          tags: ["authentication"],
        },
      },
    )
    .post(
      "/register",
      async ({ set, cookie, body }) => {
        const result = await Register(body);
        set.headers["authorization"] = `Bearer ${result.jwt}`;
        cookie.rt.set({
          value: result.rawRefreshToken,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        cookie.authorization.set({
          value: `Bearer ${result.jwt}`,
          httpOnly: true,
          secure: Bun.env.NODE_ENV === "production",
          sameSite: Bun.env.NODE_ENV === "production" ? "none" : "lax",
          path: "/",
          maxAge: 60 * 60 * 24 * 30,
        });
        set.status = 200;
        return;
      },
      {
        body: t.Object({
          email: t.String({ format: "email", error: "Must provide a email" }),
          username: t.String({ error: "Must provide a username" }),
          password: t.String({ error: "Must provide a password" }),
        }),
        detail: {
          summary: "Register user",
          tags: ["authentication"],
        },
      },
    ),
);
