import { and, eq, gt, isNotNull } from "drizzle-orm";
import { sha256Base16 } from "../utils/crypto";
import { newOpaqueToken } from "../utils/new-opaque-token";
import moment from "moment";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema/refresh-tokens";

export async function RotateRefresh(raw: string) {
  const hash = await sha256Base16(raw);

  const old = await db
    .select()
    .from(refreshTokens)
    .where(
      and(
        eq(refreshTokens.token_hash, hash),
        eq(refreshTokens.revoked, false),
        gt(refreshTokens.expires_at, moment().toDate()),
      ),
    );
  if (!old[0]) return null;
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.id, old[0].id));

  const newRaw = newOpaqueToken();
  const newHash = await sha256Base16(newRaw);
  const newNow = moment();

  let remaining = moment(old[0].expires_at).diff(newNow);

  if (remaining < 0) remaining = 0;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const newExpires = newNow.clone().add(remaining || ONE_DAY * 30, "ms");

  const newToken = await db
    .insert(refreshTokens)
    .values({
      user_id: old[0].user_id,
      token_hash: newHash,
      family_id: old[0].family_id,
      expires_at: newExpires.toDate(),
    })
    .returning();
  if (newToken.length <= 0) return;
  await db.update(refreshTokens).set({ replaced_by: newToken[0].id });
  return {
    userId: old[0].user_id,
    newRaw,
    expires_at: newExpires,
    family_id: old[0].family_id,
  };
}
