import { mock } from "bun:test";

export const mockPostgres = mock(() => "postgres-client");
export const mockDrizzle = mock(
  ({ client, schema }: { client: unknown; schema: unknown }) => ({
    client,
    schema,
  }),
);

mock.module("postgres", () => ({
  default: mockPostgres,
  __esModule: true,
}));

mock.module("drizzle-orm/postgres-js", () => ({
  drizzle: mockDrizzle,
}));

if (!process.env.FubaDB) {
  process.env.FubaDB = "postgres://unit-test";
}
