import { jwtVerify, SignJWT } from "jose";

const enc = new TextEncoder();
const jwtSecret = Bun.env.JWT_SECRET;
if (!jwtSecret && Bun.env.NODE_ENV === "production") {
  throw new Error("JWT_SECRET environment variable is required in production");
}
const secret = enc.encode(jwtSecret ?? "dev-secret");

export type AccessClaims = { sub: string; aud: "web" | "cli"; role?: string };
export async function signAccess(claims: AccessClaims, ttl = "45m") {
  return await new SignJWT(claims)
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setIssuer("milky-portfolio-blog-server")
    .setAudience(claims.aud)
    .setSubject(claims.sub)
    .setIssuedAt()
    .setExpirationTime(ttl)
    .sign(secret);
}

export async function verifyAccess(token: string) {
  try {
    const tokenDesgraca = token.replace(/^Bearer\s+/i, "").trim();
    const { payload } = await jwtVerify(tokenDesgraca, secret, {
      issuer: "milky-portfolio-blog-server",
      audience: ["web", "cli"],
    });
    return payload as AccessClaims & { exp: number; iat: number };
  } catch (e) {
    console.log(e);
    return null;
  }
}

export async function sha256Base16(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", enc.encode(s));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
