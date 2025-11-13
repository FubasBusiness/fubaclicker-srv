import { sql, eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema/user";
import { obfuscate } from "../../../shared/crypto/helper";

export async function GetTopFiftyInscribed() {
  const results = await db.query.users.findMany({
    columns: {
      username: true,
      rebirthData: true,
      achievements: true,
      fuba: true,
      profile: true,
    },
    where: eq(users.inscribed, true),
    orderBy: (users) => [
      sql`CASE WHEN ${users.rebirthData} IS NULL THEN 0 ELSE COALESCE((${users.rebirthData} ->> 'furuborusCount')::int, 0) END DESC`,
      sql`CASE WHEN ${users.rebirthData} IS NULL THEN 0 ELSE COALESCE((${users.rebirthData} ->> 'transcendenceCount')::int, 0) END DESC`,
      sql`CASE WHEN ${users.rebirthData} IS NULL THEN 0 ELSE COALESCE((${users.rebirthData} ->> 'ascensionCount')::int, 0) END DESC`,
      sql`CASE WHEN ${users.rebirthData} IS NULL THEN 0 ELSE COALESCE((${users.rebirthData} ->> 'rebirthCount')::int, 0) END DESC`,
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



