import { db } from "../../../db";

export async function GetTopFifty() {
  return await db.query.users.findMany({
    columns: { username: true },
    orderBy: (users, { desc }) => [desc(users.fuba)],
    limit: 50,
  });
}
