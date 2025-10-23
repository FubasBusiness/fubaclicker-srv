import Elysia, { t } from "elysia";
import { deobfuscate } from "../../shared/crypto/crypto";

export const deobfuscateMacro = new Elysia().macro("deobfuscate", {
  body: t.Object({
    data: t.String(),
  }),
  async resolve({ body: { data } }) {
    return { userData: deobfuscate(data) };
  },
});
