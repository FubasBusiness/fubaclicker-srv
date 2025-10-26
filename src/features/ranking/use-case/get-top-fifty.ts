import { sql } from "drizzle-orm";
import { db } from "../../../db";

export async function GetTopFifty() {
  return await db.query.users.findMany({
    columns: { username: true, rebirthData: true, achievements: true },
    orderBy: (users) => [
      sql`COALESCE((${users.rebirthData} ->> 'transcendenceCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'ascensionCount')::int, 0) DESC`,
      sql`COALESCE((${users.rebirthData} ->> 'rebirthCount')::int, 0) DESC`,
      sql`(${users.fuba})::numeric DESC NULLS LAST`,
    ],
    limit: 50,
  });
}
