import { drizzle } from "drizzle-orm/postgres-js";
import { users } from "./schema/user";
import { refreshTokens } from "./schema/refresh-tokens";
import postgres from "postgres";

const ca = Bun.file("/etc/ssl/certs/ca-certificates.crt", { type: "utf8" });
const client = postgres(
  Bun.env.FubaDB!.includes("?")
    ? Bun.env.FubaDB! + "&sslmode=require"
    : Bun.env.FubaDB! + "?sslmode=require",
  {
    idle_timeout: 1200,
    ssl: { ca },
  },
);

export const db = drizzle({
  client,
  schema: { users, refreshTokens },
});
