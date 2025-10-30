import { redis } from "bun";
import Elysia from "elysia";

const WINDOW_MS = Number(Bun.env.WINDOW_MS) ?? 10000;
const LIMIT = Number(Bun.env.RATE_LIMIT) ?? 5;

export const rateLimiter = new Elysia({ name: "rate-limiter.macros" }).macro(
  "rateLimit",
  {
    async beforeHandle({ request, set }) {
      const forwardedFor = request.headers.get("x-forwarded-for");
      const ip = forwardedFor?.split(",")[0].trim() ?? "anon";
      const key = `rl:${ip}`;

      const count = await redis.incr(key);
      if (count === 1) await redis.expire(key, WINDOW_MS / 1000);

      if (count > LIMIT) {
        const ttl = await redis.ttl(key);
        set.status = 429;
        set.headers["retry-after"] = ttl.toString();
        return { error: "Too many requests" };
      }
    },
  },
);
