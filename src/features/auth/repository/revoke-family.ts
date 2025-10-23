import { and, eq } from "drizzle-orm";
import { db } from "../../../db";
import { refreshTokens } from "../../../db/schema/refresh-tokens";

export async function RevokeFamily(userId: number, familyId: string) {
  await db
    .update(refreshTokens)
    .set({
      revoked: true,
    })
    .where(
      and(
        eq(refreshTokens.user_id, userId),
        eq(refreshTokens.family_id, familyId),
      ),
    );
}
