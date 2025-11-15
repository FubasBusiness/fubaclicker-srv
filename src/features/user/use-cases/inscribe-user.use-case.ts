import { eq } from "drizzle-orm";
import { db } from "../../../db";
import { users } from "../../../db/schema/user";

export async function InscribeUser(userId: number) {
  await db
    .update(users)
    .set({
      inscribed: true,
      fuba: "0",
      generators: null,
      inventory: null,
      equipped: null,
      rebirthData: null,
      achievements: null,
      achievementsStats: null,
      upgrades: null,
      cauldron: null,
      activePotionEffects: null,
      activePotionCount: null,
      permanentPotionMultiplier: null,
    })
    .where(eq(users.id, userId));
}





