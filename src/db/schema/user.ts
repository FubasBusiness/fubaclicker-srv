import * as t from "drizzle-orm/pg-core";

interface Inventory {
  [x: string]: number;
}

interface RebirthData {
  rebirthCount: number;
  ascensionCount: number;
  transcendenceCount: number;
  celestialToken: number;
  hasUsedOneTimeMultiplier: boolean;
  usedCupons: string[];
}

interface AchievementStats {
  [x: string]: number;
}
interface Upgrades {
  [x: string]: number;
}

export interface User {
  fuba: string;
  generators: number[];
  inventory: Inventory;
  equipped: string[];
  rebirth_data: RebirthData;
  achievements: string[];
  achievementStats: AchievementStats;
  upgrades: Upgrades;
}

export const users = t.pgTable(
  "users",
  {
    id: t.integer("id").generatedByDefaultAsIdentity().primaryKey(),
    email: t.varchar("email").notNull(),
    username: t.varchar("username").notNull(),
    password: t.varchar("password").notNull(),
    fuba: t.numeric("fuba").$type<string>().notNull(),
    generators: t.integer("generators").array(),
    inventory: t.jsonb("inventory").$type<Inventory>(),
    equipped: t.varchar("equipped").array(),
    rebirth_data: t.jsonb("rebirth_data").$type<RebirthData>(),
    achievements: t.varchar("achievements").array(),
    achievements_stats: t.jsonb("achievements_stats").$type<AchievementStats>(),
    upgrades: t.jsonb("upgrades").$type<Upgrades>(),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)],
);
