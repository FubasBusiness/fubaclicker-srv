import { User } from "../../db/schema/user";
import { z } from "zod";
import { logger } from "../logger/logger";

function base64ToUint8Array(b64: string) {
  if (typeof Buffer !== "undefined" && typeof Buffer.from === "function") {
    return Uint8Array.from(Buffer.from(b64, "base64"));
  }

  const binary = atob(b64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

const potionEffectSchema = z.object({
  type: z.number().int().min(0).max(8),
  value: z.number().positive(),
  duration: z.number().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  isPermanent: z.boolean(),
});

const cauldronSchema = z.record(z.string(), z.number().int().nonnegative());

const userVerify = z.object({
  fuba: z.string().optional(),
  generators: z.array(z.number()).optional(),
  inventory: z.record(z.string(), z.number()).optional(),
  equipped: z.array(z.string()).optional(),
  rebirthData: z
    .object({
      rebirthCount: z.number({
        error: "rebirthData: Must provide 'rebirthCount'",
      }),
      ascensionCount: z.number({
        error: "rebirthData: Must provide 'ascencionCount'",
      }),
      transcendenceCount: z.number({
        error: "rebirthData: Must provide 'transcendenceCount'",
      }),
      furuborusCount: z.number().optional().default(0),
      celestialToken: z.number({
        error: "rebirthData: Must provide 'celestialToken'",
      }),
      hasUsedOneTimeMultiplier: z.boolean({
        error: "rebirthData: Must provide 'hasUsedOneTimeMultiplier'",
      }),
      usedCoupons: z.array(
        z.string({
          error: "rebirthData: Must provide 'usedCoupons'",
        }),
      ),
      forus: z.number().optional().default(0),
      cauldronUnlocked: z.boolean().optional().default(false),
    })
    .optional(),
  achievements: z.array(z.string()).optional(),
  achievementStats: z.record(z.string(), z.number()).optional(),
  upgrades: z.record(z.string(), z.number()).optional(),
  cauldron: cauldronSchema.optional(),
  activePotionEffects: z.array(potionEffectSchema).optional(),
  permanentPotionMultiplier: z.number().min(1.0).optional(),
  activePotionCount: z.record(z.string(), z.number()).optional(),
  profile: z
    .object({
      profilePicture: z.string(),
    })
    .optional(),
});

export function deobfuscate(data: string) {
  try {
    const key = Bun.env.FUBA;
    const keyBytes = new TextEncoder().encode(key);
    const dataBytes = base64ToUint8Array(data);
    const result = new Uint8Array(dataBytes.length);

    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    const decoded = new TextDecoder().decode(result);
    const obj = JSON.parse(decoded);
    const parsed = userVerify.parse(obj) as Partial<User>;

    if (parsed.rebirthData) {
      parsed.rebirthData.furuborusCount =
        parsed.rebirthData.furuborusCount ?? 0;
      parsed.rebirthData.forus = parsed.rebirthData.forus ?? 0;
      parsed.rebirthData.cauldronUnlocked =
        parsed.rebirthData.cauldronUnlocked ?? false;
    }

    if (parsed.activePotionEffects) {
      parsed.activePotionEffects = parsed.activePotionEffects.map((effect) => {
        if (!effect.isPermanent) {
          if (!effect.duration && !effect.expiresAt) {
            throw new Error(
              "activePotionEffects: Non-permanent effects must have duration or expiresAt",
            );
          }
        }
        return effect;
      });
    }

    if (parsed.permanentPotionMultiplier !== undefined) {
      if (parsed.permanentPotionMultiplier < 1.0) {
        throw new Error(
          "permanentPotionMultiplier: Must be >= 1.0",
        );
      }
    }

    logger.info("Parsed user:", parsed);
    return { userData: parsed, errorMessage: null };
  } catch (e) {
    logger.error("Error while deobfuscating:", e);
    return { userData: null, errorMessage: (e as Error).message };
  }
}
