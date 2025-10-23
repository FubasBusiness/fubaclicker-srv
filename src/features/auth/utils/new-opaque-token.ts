import { randomBytes } from "crypto";

export function newOpaqueToken() {
  return Buffer.from(randomBytes(32)).toString("base64url");
}
