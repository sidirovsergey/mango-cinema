CREATE TABLE IF NOT EXISTS "_mango_schema_version" (
	"version" integer PRIMARY KEY NOT NULL,
	"applied_at" timestamp with time zone DEFAULT now() NOT NULL
);
