import * as t from "drizzle-orm/pg-core";

interface Inventory {
  [x: string]: number;
}

interface RebirthData {
  rebirthCount: number;
  ascensionCount: number;
  transcendenceCount: number;
  furuborusCount: number;
  celestialToken: number;
  hasUsedOneTimeMultiplier: boolean;
  usedCoupons: string[];
  forus: number;
  cauldronUnlocked: boolean;
}

interface AchievementStats {
  [x: string]: number;
}

interface Upgrades {
  [x: string]: number;
}

interface Cauldron {
  red: number;
  blue: number;
  green: number;
  yellow: number;
  purple: number;
  orange: number;
  cyan: number;
  pink: number;
  white: number;
  black: number;
}

export interface PotionEffect {
  type: number;
  value: number;
  duration: number | null;
  expiresAt: string | null;
  isPermanent: boolean;
}

interface ActivePotionCount {
  [x: string]: number;
}

export interface User {
  fuba: string;
  generators: number[];
  inventory: Inventory;
  equipped: string[];
  rebirthData: RebirthData;
  achievements: string[];
  achievementStats: AchievementStats;
  upgrades: Upgrades;
  cauldron: Cauldron;
  activePotionEffects: PotionEffect[];
  permanentPotionMultiplier: number;
  activePotionCount: ActivePotionCount;
}

export interface Profile {
  profilePicture: string;
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
    rebirthData: t.jsonb("rebirth_data").$type<RebirthData>(),
    achievements: t.varchar("achievements").array(),
    achievementsStats: t.jsonb("achievements_stats").$type<AchievementStats>(),
    upgrades: t.jsonb("upgrades").$type<Upgrades>(),
    profile: t.jsonb("profile").$type<Profile>(),
    ip: t.varchar("ip"),
    inscribed: t.boolean("inscribed").default(false).notNull(),
    cauldron: t.jsonb("cauldron").$type<Cauldron>(),
    activePotionEffects: t.jsonb("active_potion_effects").$type<PotionEffect[]>(),
    permanentPotionMultiplier: t.numeric("permanent_potion_multiplier").$type<number>(),
    activePotionCount: t.jsonb("active_potion_count").$type<ActivePotionCount>(),
  },
  (table) => [t.uniqueIndex("email_idx").on(table.email)],
);
