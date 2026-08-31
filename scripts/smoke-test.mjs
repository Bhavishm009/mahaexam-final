const base = process.env.BASE_URL || "http://localhost:3000";
for (const path of ["/api/health", "/api/ready"]) {
  const r = await fetch(base + path);
  console.log(path, r.status, await r.text());
  if (!r.ok) {
    process.exitCode = 1;
  }
}
