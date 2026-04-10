import { spawnSync } from "node:child_process";

const schemaUrl = process.env.OPENAPI_SCHEMA_URL;

if (!schemaUrl) {
  console.error("OPENAPI_SCHEMA_URL is required to generate src/shared/api/generated/schema.ts");
  process.exit(1);
}

const result = spawnSync(
  "npx",
  ["openapi-typescript", schemaUrl, "-o", "src/shared/api/generated/schema.ts"],
  {
    stdio: "inherit",
    shell: process.platform === "win32"
  }
);

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}

process.exit(result.status ?? 1);
