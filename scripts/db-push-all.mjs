import { execSync } from "child_process";
import dotenv from "dotenv";

dotenv.config();

console.log("=== Supabase Database Schema Push & Client Generation ===");

const primaryUrl = process.env.DATABASE_URL;

if (!primaryUrl) {
  console.error("❌ DATABASE_URL is not set in environment.");
  process.exit(1);
}

// 1. Push to Supabase Database
console.log("\n1️⃣  Pushing Prisma schema to Supabase Database...");
try {
  execSync("npx prisma db push --skip-generate", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: primaryUrl },
  });
  console.log("✅ Supabase Database schema push completed successfully!");
} catch (err) {
  console.error("❌ Failed to push schema to Supabase Database:", err.message);
  process.exit(1);
}

// 2. Generate Prisma Client
console.log("\n2️⃣  Generating Prisma Client...");
try {
  execSync("npx prisma generate", { stdio: "inherit" });
  console.log("✅ Prisma Client generated successfully!");
} catch (err) {
  console.error("❌ Failed to generate Prisma Client:", err.message);
  process.exit(1);
}

console.log("\n🎉 Database Schema Push & Prisma Generation Complete!");
