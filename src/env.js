import fs from "node:fs";
import path from "node:path";

export function loadEnvFile(filePath = ".env") {
  const resolvedPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(resolvedPath)) return;

  const lines = fs.readFileSync(resolvedPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;

    const separatorIndex = trimmed.indexOf("=");
    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

export function getConfig() {
  loadEnvFile();

  const supplierId = process.env.TRENDYOL_SUPPLIER_ID;
  const apiKey = process.env.TRENDYOL_API_KEY;
  const apiSecret = process.env.TRENDYOL_API_SECRET;
  const environment = process.env.TRENDYOL_ENV || "prod";
  const userAgentSuffix = process.env.TRENDYOL_USER_AGENT_SUFFIX || "SelfIntegration";

  const missing = [];
  if (!supplierId) missing.push("TRENDYOL_SUPPLIER_ID");
  if (!apiKey) missing.push("TRENDYOL_API_KEY");
  if (!apiSecret) missing.push("TRENDYOL_API_SECRET");

  return {
    supplierId,
    apiKey,
    apiSecret,
    environment,
    userAgentSuffix,
    port: Number(process.env.PORT || 3000),
    missing
  };
}
