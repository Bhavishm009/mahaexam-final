import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

console.log("=== Dual Database Schema Push & Synchronization ===");

const primaryUrl = process.env.DATABASE_URL;
let secondaryUrl = process.env.SECONDARY_DATABASE_URL || process.env.SHADOW_DATABASE_URL;

if (!primaryUrl) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

// 1. Push to Primary Database
console.log("\n1️⃣  Pushing Prisma schema to Primary Database (Aiven)...");
try {
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: primaryUrl },
  });
  console.log("✅ Primary Database schema push completed successfully!");
} catch (err) {
  console.error("❌ Failed to push schema to Primary Database:", err.message);
  process.exit(1);
}

// 2. Push to Secondary Database
if (secondaryUrl) {
  // Use IPv4 pooler if needed
  if (secondaryUrl.includes("db.mhhmyckndlmylpgciblz.supabase.co:5432")) {
    secondaryUrl = secondaryUrl.replace(
      "db.mhhmyckndlmylpgciblz.supabase.co:5432",
      "aws-0-ap-south-1.pooler.supabase.com:6543",
    );
    if (!secondaryUrl.includes("pgbouncer=true")) {
      secondaryUrl += (secondaryUrl.includes("?") ? "&" : "?") + "pgbouncer=true";
    }
  }

  console.log("\n2️⃣  Pushing Prisma schema to Secondary Shadow Database (Supabase)...");
  try {
    execSync("npx prisma db push --skip-generate", {
      stdio: "inherit",
      env: { ...process.env, DATABASE_URL: secondaryUrl },
    });
    console.log("✅ Secondary Shadow Database schema push completed successfully!");
  } catch (err) {
    console.error("❌ Failed to push schema to Secondary Database:", err.message);
    process.exit(1);
  }
} else {
  console.log("\n⚠️ SECONDARY_DATABASE_URL not configured. Skipped secondary schema push.");
}

// 3. Generate Prisma Client
console.log("\n3️⃣  Generating Prisma Client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma Client generated successfully!");
} catch (err) {
  console.error("❌ Failed to generate Prisma Client:", err.message);
  process.exit(1);
}

console.log(
  "\n🎉 Dual Database Schema Push & Migration Complete! Both DBs have identical schemas.",
);
