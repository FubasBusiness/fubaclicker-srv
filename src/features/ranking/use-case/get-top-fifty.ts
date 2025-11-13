import { sql } from "drizzle-orm";
import { db } from "../../../db";
import { obfuscate } from "../../../shared/crypto/helper";

export async function GetTopFifty() {
  const results = await db.query.users.findMany({
    columns: {
      username: true,
      rebirthData: true,
      achievements: true,
      fuba: true,
      profile: true,
    },
    orderBy: (users) => [
      sql`COALESCE((${users.rebirthData} ->> 'furuborusCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'transcendenceCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'ascensionCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'rebirthCount')::int, 0) DESC`,
      sql`(${users.fuba})::numeric DESC NULLS LAST`,
    ],
    limit: 50,
  });

  return results.map((user) => {
    return {
      username: user.username,
      data: obfuscate({
        fuba: String(user.fuba),
        rebirthData: user.rebirthData ?? undefined,
        achievements: user.achievements ?? undefined,
        profile: user.profile ?? undefined,
      } as any),
    };
  });
}
