const TARGET_BASE = process.env.TEST_URL || "https://mahaexam-final.vercel.app";

const pagesToTest = [
  { path: "/", name: "Homepage" },
  { path: "/exams", name: "Exams Directory" },
  { path: "/exams/police-bharti", name: "Category: Police Bharti" },
  { path: "/exams/talathi", name: "Category: Talathi" },
  { path: "/exams/mpsc", name: "Category: MPSC" },
  { path: "/jobs", name: "Jobs Directory" },
  { path: "/jobs/police-constable-recruitment-2026", name: "Job Detail: Police Constable" },
  { path: "/blogs", name: "Blogs Knowledge Hub" },
  { path: "/pricing", name: "Pricing & Plans" },
  { path: "/features", name: "Features" },
  { path: "/faq", name: "FAQ Helpdesk" },
  { path: "/for-coaching", name: "For Coaching Academies" },
  { path: "/exam/police-01", name: "Exam Detail: Police Mock 01" },
  { path: "/login", name: "Login Portal" },
  { path: "/register", name: "Register Portal" },
];

async function checkPage({ path, name }) {
  const fullUrl = `${TARGET_BASE}${path}`;
  console.log(`\n======================================================================`);
  console.log(`Testing: ${name} (${path})`);
  console.log(`Full URL: ${fullUrl}`);

  try {
    const res = await fetch(fullUrl, { cache: "no-store" });
    if (!res.ok) {
      console.log(`  [WARN] Page returned HTTP ${res.status}`);
      return { path, name, pageStatus: res.status, ogStatus: 0, ogUrl: null, ok: false };
    }
    const html = await res.text();
    const ogMatch = html.match(/<meta property=["']og:image["']\s+content=["']([^"']+)["']/i);
    const twMatch = html.match(/<meta name=["']twitter:image["']\s+content=["']([^"']+)["']/i);

    const ogUrl = ogMatch ? ogMatch[1] : null;
    const twUrl = twMatch ? twMatch[1] : null;

    console.log(`  og:image      : ${ogUrl || "NONE"}`);
    console.log(`  twitter:image : ${twUrl || "NONE"}`);

    if (!ogUrl) {
      console.log(`  [FAIL] No og:image tag found in HTML!`);
      return { path, name, pageStatus: res.status, ogStatus: 0, ogUrl: null, ok: false };
    }

    const imgRes = await fetch(ogUrl, { cache: "no-store" });
    const contentType = imgRes.headers.get("content-type") || "";
    const size = (await imgRes.arrayBuffer()).byteLength;
    console.log(
      `  -> Image Status: ${imgRes.status} | Content-Type: ${contentType} | Size: ${size} bytes`,
    );

    const isOk = imgRes.status === 200 && contentType.includes("image");
    return {
      path,
      name,
      pageStatus: res.status,
      ogStatus: imgRes.status,
      contentType,
      size,
      ogUrl,
      ok: isOk,
    };
  } catch (err) {
    console.error(`  [ERROR] ${err.message}`);
    return { path, name, error: err.message, ok: false };
  }
}

async function main() {
  console.log(`Starting Comprehensive Dynamic OG Image Verification...`);
  console.log(`Target: ${TARGET_BASE}`);

  const results = [];
  for (const page of pagesToTest) {
    const r = await checkPage(page);
    results.push(r);
  }

  console.log(`\n======================================================================`);
  console.log(`DYNAMIC OG IMAGES SUMMARY MATRIX`);
  console.log(`======================================================================`);
  console.table(
    results.map((r) => ({
      Page: r.name,
      Route: r.path,
      "Page HTTP": r.pageStatus || "ERR",
      "OG Image HTTP": r.ogStatus || "ERR",
      "Content-Type": r.contentType || "-",
      "Size (bytes)": r.size || 0,
      Pass: r.ok ? "YES" : "NO",
    })),
  );

  const passed = results.filter((r) => r.ok).length;
  console.log(`\nResult: ${passed}/${results.length} pages verified successfully.`);
  if (passed !== results.length) {
    process.exit(1);
  }
}

main().catch((e) => {
  console.error("Fatal check error:", e);
  process.exit(1);
});
