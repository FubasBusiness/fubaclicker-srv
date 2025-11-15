ALTER TABLE "users" ADD COLUMN "cauldron" jsonb;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_potion_effects" jsonb;
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "permanent_potion_multiplier" numeric DEFAULT '1.0';
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "active_potion_count" jsonb;

