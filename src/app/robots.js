export default function robots() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://mahaexam.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/coaching/", "/student/", "/auth/", "/_next/", "/private/"],
      },
      // Explicitly allow all prominent AI crawlers & search assistants
      // This enables ChatGPT, Claude, Perplexity, Gemini, and Copilot to index and cite MahaExam pages
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "ClaudeBot",
          "Claude-Web",
          "PerplexityBot",
          "Google-Extended",
          "Applebot",
          "Applebot-Extended",
          "Bingbot",
          "Bytespider",
          "CCBot",
          "cohere-ai",
          "Diffbot",
          "FacebookBot",
          "meta-externalagent",
          "YouBot",
          "DuckAssistBot",
        ],
        allow: "/",
        disallow: ["/admin/", "/api/", "/coaching/", "/student/", "/auth/", "/_next/", "/private/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
