import * as t from "drizzle-orm/pg-core";
import { users } from "./user";

export const refreshTokens = t.pgTable(
  "refresh_tokens",
  {
    id: t.integer("id").generatedByDefaultAsIdentity().primaryKey(),
    user_id: t
      .integer("user_id")
      .notNull()
      .references(() => users.id),
    token_hash: t.varchar("token_hash").notNull().unique(),
    family_id: t.varchar("family_id").notNull(),
    created_at: t
      .timestamp("created_at", { withTimezone: true, mode: "date" })
      .notNull()
      .defaultNow(),
    expires_at: t
      .timestamp("expires_at", { withTimezone: true, mode: "date" })
      .notNull(),
    replaced_by: t.integer("replaced_by"),
    revoked: t.boolean("revoked").notNull().default(false),
  },
  (table) => [t.index("user_idx").on(table.user_id)],
);
