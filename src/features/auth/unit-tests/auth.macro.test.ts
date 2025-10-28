import "./setup-db-mocks";

import {
  beforeEach,
  describe,
  expect,
  it,
  mock,
} from "bun:test";
import { Elysia } from "elysia";
import { signAccess } from "../utils/crypto";

type IssueRefreshResult = {
  raw: string;
  expires_at: Date;
  id: number;
  family_id: string;
};

type RotateRefreshResult =
  | {
      userId: number;
      newRaw: string;
      expires_at: Date;
      family_id: string;
    }
  | null;

let issueRefreshResult: IssueRefreshResult = {
  raw: "issued-refresh",
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  id: 1,
  family_id: "family",
};
let rotateRefreshResult: RotateRefreshResult = {
  userId: 1,
  newRaw: "rotated-refresh",
  expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  family_id: "family",
};

const issueRefreshMock = mock(async (_userId: number) => issueRefreshResult);
const rotateRefreshMock = mock(async (_raw: string) => rotateRefreshResult);

mock.module("../repository", () => ({
  IssueRefresh: issueRefreshMock,
  RotateRefresh: rotateRefreshMock,
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

async function createApp(handler?: Parameters<Elysia["get"]>[1]) {
  const { auth } = await import("../auth.macro");
  return new Elysia()
    .use(auth)
    .get(
      "/protected",
      handler ??
        (({ userId }) => ({
          userId,
        })),
      { auth: true },
    );
}

beforeEach(() => {
  issueRefreshMock.mockClear();
  rotateRefreshMock.mockClear();
  issueRefreshResult = {
    raw: "issued-refresh",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    id: 1,
    family_id: "family",
  };
  rotateRefreshResult = {
    userId: 1,
    newRaw: "rotated-refresh",
    expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    family_id: "family",
  };
});

describe("auth macro", () => {
  it("rejects requests without an authorization cookie", async () => {
    const app = await createApp();

    const response = await app.handle(new Request("http://localhost/protected"));

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Unauthorized",
      reason: "No authorization token provided on header",
    });
  });

  it("allows requests with a valid authorization cookie", async () => {
    const app = await createApp();

    const jwt = await signAccess({ aud: "web", sub: "1" }, "5m");
    const cookieHeader = `authorization=${encodeURIComponent(`Bearer ${jwt}`)}`;

    const response = await app.handle(
      new Request("http://localhost/protected", {
        headers: {
          Cookie: cookieHeader,
        },
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ userId: 1 });
    expect(issueRefreshMock.mock.calls.length).toBe(0);
    expect(rotateRefreshMock.mock.calls.length).toBe(0);
    expect(readSetCookies(response)).toHaveLength(0);
  });

  it("issues a new refresh token when near expiry and no refresh cookie is present", async () => {
    const app = await createApp();

    const jwt = await signAccess({ aud: "web", sub: "1" }, "1s");
    const cookieHeader = `authorization=${encodeURIComponent(`Bearer ${jwt}`)}`;

    const response = await app.handle(
      new Request("http://localhost/protected", {
        headers: {
          Cookie: cookieHeader,
        },
      }),
    );

    expect(response.status).toBe(200);
    const cookies = readSetCookies(response);
    expect(cookies.some((cookie) => cookie.includes("authorization="))).toBe(
      true,
    );
    expect(cookies.some((cookie) => cookie.includes("rt="))).toBe(true);
    expect(issueRefreshMock.mock.calls.length).toBe(1);
    expect(issueRefreshMock.mock.calls[0][0]).toBe(1);
    expect(rotateRefreshMock.mock.calls.length).toBe(0);
  });

  it("rotates refresh token when near expiry and refresh cookie is present", async () => {
    const app = await createApp();

    const jwt = await signAccess({ aud: "web", sub: "1" }, "1s");
    const authorizationCookie = `authorization=${encodeURIComponent(`Bearer ${jwt}`)}`;
    const refreshCookie = `rt=existing-refresh`;
    const response = await app.handle(
      new Request("http://localhost/protected", {
        headers: {
          Cookie: `${authorizationCookie}; ${refreshCookie}`,
        },
      }),
    );

    expect(response.status).toBe(200);
    const body = await response.json();
    expect(body).toEqual({ userId: 1 });
    const cookies = readSetCookies(response);
    expect(cookies.some((cookie) => cookie.includes("authorization="))).toBe(
      true,
    );
    expect(
      cookies.some((cookie) => cookie.includes("rt=rotated-refresh")),
    ).toBe(true);
    expect(issueRefreshMock.mock.calls.length).toBe(0);
    expect(rotateRefreshMock.mock.calls.length).toBe(1);
    expect(rotateRefreshMock.mock.calls[0][0]).toBe("existing-refresh");
  });

  it("rejects the request if refresh rotation fails", async () => {
    rotateRefreshResult = null;
    const app = await createApp();

    const jwt = await signAccess({ aud: "web", sub: "1" }, "1s");
    const authorizationCookie = `authorization=${encodeURIComponent(`Bearer ${jwt}`)}`;
    const refreshCookie = `rt=stale`;

    const response = await app.handle(
      new Request("http://localhost/protected", {
        headers: {
          Cookie: `${authorizationCookie}; ${refreshCookie}`,
        },
      }),
    );

    expect(response.status).toBe(401);
    const body = await response.json();
    expect(body).toEqual({
      error: "Unauthorized",
      reason: "Error on rotating refresh token",
    });
    expect(issueRefreshMock.mock.calls.length).toBe(0);
    expect(rotateRefreshMock.mock.calls.length).toBe(1);
  });
});
