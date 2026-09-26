import { getBaseUrl } from "@/lib/base-url";

/**
 * llms.txt — LLM-friendly site summary following the llms.txt standard.
 * Helps AI assistants (ChatGPT, Claude, Gemini, Perplexity, etc.)
 * understand MahaExam's purpose, structure, and key pages.
 *
 * @see https://llmstxt.org
 */
export async function GET() {
  const baseUrl = getBaseUrl();

  const content = `# MahaExam — Maharashtra Competitive Exam Portal

> MahaExam (mahaexam.com) is Maharashtra's leading online mock test platform for government competitive exams including Police Bharti, MPSC, Talathi, Zilla Parishad (ZP), and Saralseva Bharti. All tests are available in both Marathi (मराठी) and English with TCS/IBPS CBT exam pattern. The platform serves individual students and coaching academies with real exam-like practice, instant results, statewide rankings, and advanced analytics.

## Core Platform

- [Homepage](${baseUrl}/): Main landing page with exam catalog, features, pricing, and FAQs
- [All Exams Portal](${baseUrl}/exams): Browse and filter all available mock tests by category
- [Police Bharti Exams](${baseUrl}/exams/police-bharti): Maharashtra Police Constable recruitment mock tests
- [MPSC Exams](${baseUrl}/exams/mpsc): MPSC Prelims, Mains, and Combined exam practice
- [Talathi Exams](${baseUrl}/exams/talathi): Talathi Bharti TCS CBT pattern tests
- [ZP Bharti Exams](${baseUrl}/exams/zp-bharti): Zilla Parishad Gram Sevak, Arogya Sevak tests
- [Saralseva Exams](${baseUrl}/exams/saralseva): Saralseva Bharti and Vanrakshak tests
- [Previous Year Papers](${baseUrl}/exams/pyq): Official previous year question papers (PYQ)

## Jobs & Notifications

- [Government Jobs](${baseUrl}/jobs): Latest Maharashtra government job notifications, vacancies, and recruitment updates

## Content & Resources

- [Blog Articles](${baseUrl}/blogs): Exam preparation guides, tips, study material, and current affairs in Marathi and English

## Information Pages

- [Features](${baseUrl}/features): Platform capabilities — bilingual tests, anti-cheating, instant results, analytics
- [Pricing Plans](${baseUrl}/pricing): Free, Student Pro (₹199/year), and Coaching plans
- [For Coaching Academies](${baseUrl}/for-coaching): White-label exam platform for coaching institutes
- [FAQs](${baseUrl}/faq): Frequently asked questions about the platform

## Student Access

- [Student Registration](${baseUrl}/register): Create a free student account
- [Student Login](${baseUrl}/login): Sign in to access dashboard and exams
- [Student Dashboard](${baseUrl}/student/dashboard): Personal dashboard with exam history and progress
- [Student Exams](${baseUrl}/student/exams): Browse assigned and available exams
- [Leaderboard](${baseUrl}/student/leaderboard): Statewide rankings across all exams

## Coaching Academy Access

- [Coaching Registration](${baseUrl}/coaching/register): Register your coaching academy/class
- [Coaching Login](${baseUrl}/coaching/login): Academy admin and teacher login
- [Coaching Dashboard](${baseUrl}/coaching/dashboard): Manage students, batches, and exams

## Optional

- [Sitemap](${baseUrl}/sitemap.xml)
- [Extended LLMs Context](${baseUrl}/llms-full.txt)
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
