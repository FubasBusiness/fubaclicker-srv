import moment from "moment";
import { sha256Base16 } from "../utils/crypto";
import { newOpaqueToken } from "../utils/new-opaque-token";
import { and, eq, gte } from "drizzle-orm";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema/refresh-tokens";

export async function IssueRefresh(userId: number, days = 30) {
  const raw = newOpaqueToken();
  const now = moment();
  const expires_at = now.add(days, "days").toDate();
  const token_hash = await sha256Base16(raw);
  const family_id = Bun.randomUUIDv7();

  const result = await db
    .insert(refreshTokens)
    .values({
      user_id: userId,
      token_hash,
      family_id,
      expires_at,
    })
    .returning({ id: refreshTokens.id });
  return { raw, id: result[0].id, family_id, expires_at };
}
