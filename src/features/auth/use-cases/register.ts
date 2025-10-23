import { SQLiteError } from "bun:sqlite";
import { users } from "../../../db/schema/user";
import { signAccess } from "../utils/crypto";
import { IssueRefresh } from "../repository";
import { db } from "../../../db";
import { Conflict } from "../../../shared/errors/conflict";

type RegisterInput = {
  email: string;
  username: string;
  password: string;
};

export async function Register({
  email,
  username,
  password: rawPassword,
}: RegisterInput) {
  try {
    const password = await Bun.password.hash(rawPassword);
    const result = await db
      .insert(users)
      .values({ email, password, fuba: "0", username })
      .returning();
    const jwt = await signAccess({ aud: "web", sub: String(result[0].id) });
    const refresh = await IssueRefresh(result[0].id);
    return { jwt, rawRefreshToken: refresh.raw };
  } catch (e) {
    if (e instanceof SQLiteError) {
      switch (e.code) {
        case "SQLITE_CONSTRAINT":
          if (e.message.includes("UNIQUE")) throw new Conflict("email");
          break;
        default:
          throw e;
      }
    }
    throw e;
  }
}
