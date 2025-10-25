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

const userVerify = z.object({
  fuba: z.string().optional(),
  generators: z.array(z.number()).optional(),
  inventory: z.record(z.string(), z.number()).optional(),
  equipped: z.array(z.string()).optional(),
  rebirthData: z
    .object({
      rebirthCount: z.number({
        error: "rebirth_data: Must provide 'rebirthCount'",
      }),
      ascensionCount: z.number({
        error: "rebirth_data: Must provide 'ascencionCount'",
      }),
      transcendenceCount: z.number({
        error: "rebirth_data: Must provide 'transcendenceCount'",
      }),
      celestialToken: z.number({
        error: "rebirth_data: Must provide 'celestialToken'",
      }),
      hasUsedOneTimeMultiplier: z.boolean({
        error: "rebirth_data: Must provide 'hasUsedOneTimeMultiplier'",
      }),
      usedCupons: z.array(
        z.string({
          error: "rebirth_data: Must provide 'usedCupons'",
        }),
      ),
    })
    .optional(),
  achievements: z.array(z.string()).optional(),
  achievementStats: z.record(z.string(), z.number()).optional(),
  upgrades: z.record(z.string(), z.number()).optional(),
});

export function deobfuscate(data: string) {
  try {
    const key = "fuba_secret_key_2024";
    const keyBytes = new TextEncoder().encode(key);
    const dataBytes = base64ToUint8Array(data);
    const result = new Uint8Array(dataBytes.length);

    for (let i = 0; i < dataBytes.length; i++) {
      result[i] = dataBytes[i] ^ keyBytes[i % keyBytes.length];
    }

    const decoded = new TextDecoder().decode(result);
    const obj = JSON.parse(decoded);
    const parsed = userVerify.parse(obj) as Partial<User>;
    return { userData: parsed, errorMessage: null };
  } catch (e) {
    logger.error("Error while deobfuscating:", e);
    return { userData: null, errorMessage: (e as Error).message };
  }
}
