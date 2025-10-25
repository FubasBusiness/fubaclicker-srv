import { db } from "../../../db";
import { User, users } from "../../../db/schema/user";

export async function UpdateUser(data: Partial<User>) {
  await db.update(users).set(data);
}
