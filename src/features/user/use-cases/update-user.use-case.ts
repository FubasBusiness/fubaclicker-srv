import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { User, users } from "../../../db/schema/user";

export async function UpdateUser(userId: number, data: Partial<User>) {
  await db.update(users).set(data).where(eq(users.id, userId));
}
