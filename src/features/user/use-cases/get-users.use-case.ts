import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema/user";

export async function GetUser(userId: number) {
  try {
    return (
      await db
        .select({
          id: users.id,
          email: users.email,
          username: users.username,
          fuba: users.fuba,
          generators: users.generators,
          inventory: users.inventory,
          equipped: users.equipped,
          rebirth_data: users.rebirth_data,
          achievements: users.achievements,
          achievements_stats: users.achievement_stats,
          upgrades: users.upgrades,
        })
        .from(users)
        .where(eq(users.id, userId))
    ).map((u) => ({
      ...u,
      rebirth_data: u.rebirth_data
        ? {
            rebirthCount: u.rebirth_data.rebirthCount ?? 0,
            ascensionCount: u.rebirth_data.ascensionCount ?? 0,
            transcendenceCount: u.rebirth_data.transcendenceCount ?? 0,
            celestialToken: u.rebirth_data.celestialToken ?? 0,
            hasUsedOneTimeMultiplier:
              u.rebirth_data.hasUsedOneTimeMultiplier ?? false,
            usedCupons: Array.isArray(u.rebirth_data.usedCupons)
              ? u.rebirth_data.usedCupons
              : Array.from(u.rebirth_data.usedCupons ?? []),
          }
        : null,
    }));
  } catch (e) {
    throw new Error("Unknown server error");
  }
}
