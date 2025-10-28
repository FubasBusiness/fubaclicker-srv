import { describe, expect, it } from "bun:test";

describe("setup-db-mocks", () => {
  it("registers mock modules and ensures env defaults", async () => {
    const existing = process.env.FubaDB;
    const module = await import("./setup-db-mocks");

    expect(typeof module.mockPostgres).toBe("function");
    expect(typeof module.mockDrizzle).toBe("function");

    expect(process.env.FubaDB).toBe(existing ?? "postgres://unit-test");

    const postgres = await import("postgres");
    expect(postgres.default).toBe(
      module.mockPostgres as unknown as typeof postgres.default,
    );

    const drizzle = await import("drizzle-orm/postgres-js");
    expect(drizzle.drizzle).toBe(
      module.mockDrizzle as unknown as (typeof drizzle)["drizzle"],
    );
  });
});
