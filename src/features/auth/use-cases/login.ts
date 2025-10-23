import { and, eq } from "drizzle-orm";
import { users } from "../../../db/schema/user";
import { IssueRefresh } from "../repository/issue-refresh";
import { signAccess } from "../utils/crypto";
import { db } from "../../../db";
import { InvalidCredentials } from "../../../shared/errors/invalid-credentials";

type LogInInput = {
  email: string;
  password: string;
};

export async function LogIn({ email, password }: LogInInput) {
  const user = await db
    .select()
    .from(users)
    .where(and(eq(users.email, email)));
  const isCorrectCredentials =
    user && (await Bun.password.verify(password, user[0].password));
  if (!isCorrectCredentials) throw new InvalidCredentials();
  const jwt = await signAccess({ sub: String(user[0].id), aud: "web" });
  const issue = await IssueRefresh(user[0].id);

  return { jwt, ...issue };
}
