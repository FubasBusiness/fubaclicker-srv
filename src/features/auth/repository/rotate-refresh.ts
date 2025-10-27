import { and, eq, gt } from "drizzle-orm";
import { sha256Base16 } from "../utils/crypto";
import { newOpaqueToken } from "../utils/new-opaque-token";
import moment from "moment";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema/refresh-tokens";

export async function RotateRefresh(raw: string) {
  const hash = await sha256Base16(raw);

  const old = await db.query.refreshTokens.findFirst({
    where: (table, { and, eq, gt }) =>
      and(
        eq(table.token_hash, hash),
        eq(table.revoked, false),
        gt(table.expires_at, moment().toDate()),
      ),
  });
  if (!old) return null;

  const newRaw = newOpaqueToken();
  const newHash = await sha256Base16(newRaw);
  const newNow = moment();

  let remaining = moment(old.expires_at).diff(newNow);

  if (remaining < 0) remaining = 0;
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const newExpires = newNow.clone().add(remaining || ONE_DAY * 30, "ms");

  await db
    .update(refreshTokens)
    .set({
      token_hash: newHash,
      expires_at: newExpires.toDate(),
      created_at: newNow.toDate(),
      revoked: false,
      replaced_by: null,
    })
    .where(eq(refreshTokens.id, old.id));

  return {
    userId: old.user_id,
    newRaw,
    expires_at: newExpires,
    family_id: old.family_id,
  };
}
