import { sql } from "drizzle-orm";
import { db } from "../../../db";

export async function GetTopFifty() {
  return await db.query.users.findMany({
    columns: { username: true, rebirthData: true, achievements: true },
    orderBy: (users, { desc }) => [
      desc(sql`(${users.rebirthData} ->> 'transcendenceCount')::int`),
      desc(sql`(${users.rebirthData} ->> 'ascensionCount')::int`),
      desc(sql`(${users.rebirthData} ->> 'rebirthCount')::int`),
      desc(sql`(${users.fuba})::numeric`),
    ],
    limit: 50,
  });
}
