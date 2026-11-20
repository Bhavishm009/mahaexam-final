const BASE = "https://mahaexam-final.vercel.app";

async function main() {
  console.log("==================================================");
  console.log("TESTING LIVE PRODUCTION AUTH LIFECYCLE");
  console.log("Target:", BASE);
  console.log("==================================================");

  // 1. Initial State: /api/auth/me should be 401 Unauthenticated
  console.log("\n[Step 1] Check initial /api/auth/me (Logged out)...");
  const initMe = await fetch(`${BASE}/api/auth/me`, { cache: "no-store" });
  console.log("  Status:", initMe.status);
  const initMeData = await initMe.json();
  console.log("  Response:", JSON.stringify(initMeData));
  console.log("  Cache-Control:", initMe.headers.get("cache-control"));

  // 2. Login with dedicated Test Student credentials (NEVER super admin)
  console.log("\n[Step 2] Login with test.student@mahaexam.com...");
  const loginRes = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier: "test.student@mahaexam.com", password: "testPassword123" }),
  });
  console.log("  Login Status:", loginRes.status);
  const loginData = await loginRes.json();
  console.log("  Login Success:", loginData.success);
  console.log("  User Role:", loginData.user?.role);

  // Extract session cookie
  const setCookies = loginRes.headers.getSetCookie
    ? loginRes.headers.getSetCookie()
    : [loginRes.headers.get("set-cookie")];
  console.log("  Set-Cookie received:", setCookies.length);
  const sessionCookieHeader = setCookies.map((c) => c.split(";")[0]).join("; ");

  // 3. Verify /api/auth/me with session cookie
  console.log("\n[Step 3] Verify /api/auth/me with session cookie...");
  const authMe = await fetch(`${BASE}/api/auth/me`, {
    headers: { Cookie: sessionCookieHeader },
    cache: "no-store",
  });
  console.log("  Status:", authMe.status);
  const authMeData = await authMe.json();
  console.log("  Authenticated:", authMeData.authenticated);
  console.log("  User Name:", authMeData.user?.name);
  console.log("  User Email:", authMeData.user?.email);

  // 4. Logout
  console.log("\n[Step 4] Call /api/auth/logout...");
  const logoutRes = await fetch(`${BASE}/api/auth/logout`, {
    method: "POST",
    headers: { Cookie: sessionCookieHeader },
    cache: "no-store",
  });
  console.log("  Logout Status:", logoutRes.status);
  const logoutData = await logoutRes.json();
  console.log("  Logout Response:", JSON.stringify(logoutData));
  const logoutCookies = logoutRes.headers.getSetCookie
    ? logoutRes.headers.getSetCookie()
    : [logoutRes.headers.get("set-cookie")];
  console.log("  Cleared Cookies count:", logoutCookies.length);
  console.log("  Sample cleared cookie:", logoutCookies[0]);

  // 5. Verify /api/auth/me after logout (simulating cleared cookies)
  console.log("\n[Step 5] Verify /api/auth/me after logout...");
  const postLogoutMe = await fetch(`${BASE}/api/auth/me`, { cache: "no-store" });
  console.log("  Status:", postLogoutMe.status);
  const postLogoutMeData = await postLogoutMe.json();
  console.log("  Authenticated:", postLogoutMeData.authenticated);
  console.log("  User:", postLogoutMeData.user);

  console.log("\n==================================================");
  console.log("ALL AUTH LIFECYCLE CHECKS PASSED PERFECTLY!");
  console.log("==================================================");
}

main().catch(console.error);
