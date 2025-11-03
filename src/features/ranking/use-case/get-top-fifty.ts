import { sql } from "drizzle-orm";
import { db } from "../../../db";

export async function GetTopFifty() {
  const results = await db.query.users.findMany({
    columns: {
      username: true,
      rebirthData: true,
      achievements: true,
      fuba: true,
    },
    orderBy: (users) => [
      sql`COALESCE((${users.rebirthData} ->> 'forus')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'transcendenceCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'ascensionCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'rebirthCount')::int, 0) DESC`,
      sql`(${users.fuba})::numeric DESC NULLS LAST`,
    ],
    limit: 50,
  });

  return results.map((user) => ({
    ...user,
    fuba: String(user.fuba),
    rebirthData: user.rebirthData
      ? {
          rebirthCount: user.rebirthData.rebirthCount ?? 0,
          ascensionCount: user.rebirthData.ascensionCount ?? 0,
          transcendenceCount: user.rebirthData.transcendenceCount ?? 0,
          furuborusCount: user.rebirthData.furuborusCount ?? 0,
          celestialToken: user.rebirthData.celestialToken ?? 0,
          hasUsedOneTimeMultiplier:
            user.rebirthData.hasUsedOneTimeMultiplier ?? false,
          usedCoupons: Array.isArray(user.rebirthData.usedCoupons)
            ? user.rebirthData.usedCoupons
            : [],
          forus: user.rebirthData.forus ?? 0,
        }
      : null,
  }));
}
