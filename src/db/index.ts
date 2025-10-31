import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "./schema/user";
import { refreshTokens } from "./schema/refresh-tokens";
import postgres from "postgres";

const client = postgres(Bun.env.FubaDB!, {
  ssl: true,
});

export const db = drizzle({
  client,
  schema: { users, refreshTokens },
});
