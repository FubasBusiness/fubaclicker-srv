import { migrate } from "drizzle-orm/postgres-js/migrator";
import { db } from "./index";
import { logger } from "../shared/logger/logger";

export async function runMigrations() {
  try {
    logger.info("Running database migrations...");
    await migrate(db, { migrationsFolder: "./src/db/migrations" });
    logger.info("Migrations completed successfully");
  } catch (error) {
    logger.error("Error running migrations", error);
    throw error;
  }
}

