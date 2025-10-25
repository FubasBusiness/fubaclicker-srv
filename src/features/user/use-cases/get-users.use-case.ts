import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema/user";
import { logger } from "../../../shared/logger/logger";

export async function GetUser(userId: number) {
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
        rebirthData: users.rebirthData,
        achievements: users.achievements,
        achievementsStats: users.achievementsStats,
        upgrades: users.upgrades,
      })
      .from(users)
      .where(eq(users.id, userId))
  ).map((u) => ({
    ...u,
    fuba: String(u.fuba),
    rebirthData: u.rebirthData
      ? {
          rebirthCount: u.rebirthData.rebirthCount ?? 0,
          ascensionCount: u.rebirthData.ascensionCount ?? 0,
          transcendenceCount: u.rebirthData.transcendenceCount ?? 0,
          celestialToken: u.rebirthData.celestialToken ?? 0,
          hasUsedOneTimeMultiplier:
            u.rebirthData.hasUsedOneTimeMultiplier ?? false,
          usedCupons: Array.isArray(u.rebirthData.usedCupons)
            ? u.rebirthData.usedCupons
            : (Array.from(u.rebirthData.usedCupons ?? []) as string[]),
        }
      : null,
  }));
}
