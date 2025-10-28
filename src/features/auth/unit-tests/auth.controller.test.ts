import "./setup-db-mocks";

import { beforeEach, describe, expect, it, mock } from "bun:test";
import { Elysia } from "elysia";

type LogInResult = { jwt: string; raw: string };
type RegisterResult = { jwt: string; rawRefreshToken: string };
type LogInInput = { email: string; password: string };
type RegisterInput = { email: string; username: string; password: string };

let logInResult: LogInResult = {
  jwt: "login-jwt",
  raw: "login-refresh",
};
let registerResult: RegisterResult = {
  jwt: "register-jwt",
  rawRefreshToken: "register-refresh",
};

const logInMock = mock(async (_input: LogInInput) => logInResult);
const registerMock = mock(async (_input: RegisterInput) => registerResult);

mock.module("../use-cases", () => ({
  LogIn: logInMock,
  Register: registerMock,
}));

const readSetCookies = (response: Response) => {
  const headers = response.headers as Headers & {
    getSetCookie?: () => string[];
  };
  if (typeof headers.getSetCookie === "function") {
    return headers.getSetCookie();
  }
  const single = headers.get("set-cookie");
  return single ? [single] : [];
};

async function createAuthApp() {
  const { authController } = await import("../index");
  return new Elysia().use(authController);
}

beforeEach(() => {
  logInMock.mockClear();
  registerMock.mockClear();
  logInResult = {
    jwt: "login-jwt",
    raw: "login-refresh",
  };
  registerResult = {
    jwt: "register-jwt",
    rawRefreshToken: "register-refresh",
  };
});

describe("auth controller", () => {
  it("returns credentials and cookies for login", async () => {
    const app = await createAuthApp();

    const response = await app.handle(
      new Request("http://localhost/auth/login", {
        method: "POST",
        body: JSON.stringify({ email: "user@example.com", password: "secret" }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(logInMock.mock.calls.length).toBe(1);
    expect(logInMock.mock.calls[0][0]).toEqual({
      email: "user@example.com",
      password: "secret",
    });
    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual(logInResult);
    const cookies = readSetCookies(response);
    expect(cookies.some((cookie) => cookie.includes("rt=login-refresh"))).toBe(
      true,
    );
    expect(
      cookies.some((cookie) => cookie.includes("authorization=")),
    ).toBe(true);
  });

  it("sets authorization header and cookies for register", async () => {
    const app = await createAuthApp();

    const response = await app.handle(
      new Request("http://localhost/auth/register", {
        method: "POST",
        body: JSON.stringify({
          email: "new@example.com",
          username: "new-user",
          password: "secret",
        }),
        headers: {
          "content-type": "application/json",
        },
      }),
    );

    expect(registerMock.mock.calls.length).toBe(1);
    expect(registerMock.mock.calls[0][0]).toEqual({
      email: "new@example.com",
      username: "new-user",
      password: "secret",
    });
    expect(response.status).toBe(200);
    expect(response.headers.get("authorization")).toBe(
      `Bearer ${registerResult.jwt}`,
    );
    const text = await response.text();
    expect(text).toBe("");
    const cookies = readSetCookies(response);
    expect(
      cookies.some((cookie) => cookie.includes("authorization=")),
    ).toBe(true);
    expect(
      cookies.some((cookie) =>
        cookie.includes(`rt=${registerResult.rawRefreshToken}`),
      ),
    ).toBe(true);
  });
});
