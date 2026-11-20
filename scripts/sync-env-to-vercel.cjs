const fs = require("fs");
const path = require("path");

const TOKEN = process.env.VERCEL_TOKEN || process.env.VERCEL_AUTH_TOKEN;
const TEAM_ID = process.env.VERCEL_TEAM_ID || "team_FPRiLjEeggLvu3THMlcFoOGP";
const PROJECT_ID = process.env.VERCEL_PROJECT_ID || "mahaexam-final";

if (!TOKEN) {
  console.error("Error: VERCEL_TOKEN or VERCEL_AUTH_TOKEN environment variable is required.");
  process.exit(1);
}

async function main() {
  const envContent = fs.readFileSync(".env", "utf8");
  const lines = envContent.split(/\r?\n/);
  const vars = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    const key = trimmed.substring(0, eqIdx).trim();
    let val = trimmed.substring(eqIdx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.substring(1, val.length - 1);
    }
    vars.push({ key, value: val });
  }

  console.log(`Parsed ${vars.length} variables from .env`);

  // Fetch existing env vars
  const res = await fetch(
    `https://api.vercel.com/v9/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
    {
      headers: { Authorization: `Bearer ${TOKEN}` },
    },
  );
  const data = await res.json();
  const existingMap = new Map();
  if (data.envs) {
    for (const e of data.envs) {
      existingMap.set(e.key, e.id);
    }
  }

  for (const { key, value } of vars) {
    const existingId = existingMap.get(key);
    if (existingId) {
      const editRes = await fetch(
        `https://api.vercel.com/v9/projects/${PROJECT_ID}/env/${existingId}?teamId=${TEAM_ID}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            value,
            target: ["production", "preview", "development"],
          }),
        },
      );
      const editData = await editRes.json();
      console.log(
        `Updated ${key}:`,
        editRes.status === 200 ? "OK" : editData.error?.message || editRes.status,
      );
    } else {
      const addRes = await fetch(
        `https://api.vercel.com/v10/projects/${PROJECT_ID}/env?teamId=${TEAM_ID}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${TOKEN}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            key,
            value,
            type: "plain",
            target: ["production", "preview", "development"],
          }),
        },
      );
      const addData = await addRes.json();
      console.log(
        `Created ${key}:`,
        addRes.status === 200 ? "OK" : addData.error?.message || addRes.status,
      );
    }
  }
  console.log("All env variables synchronized to Vercel!");
}

main().catch(console.error);
