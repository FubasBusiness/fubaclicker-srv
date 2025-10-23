import { db } from "../../../db";
import { User, users } from "../../../db/schema/user";

export async function UpdateUser(data: Partial<User>) {
  try {
    await db.update(users).set(data);
  } catch (e) {
    throw Error("Unknown server error");
  }
}
