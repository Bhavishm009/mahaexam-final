import { getBaseUrl } from "@/lib/base-url";

/**
 * llms-full.txt — Extended LLM context with detailed platform information.
 * Provides comprehensive details about MahaExam for deeper AI understanding.
 *
 * @see https://llmstxt.org
 */
export async function GET() {
  const baseUrl = getBaseUrl();

  const content = `# MahaExam — Full Platform Documentation for LLMs

> MahaExam (mahaexam.com) is Maharashtra's premier online mock test and exam preparation platform. It serves students preparing for Maharashtra state government competitive exams and coaching academies that conduct batch-wise online examinations.

## About MahaExam

MahaExam is a comprehensive exam preparation platform built specifically for Maharashtra (India) state-level competitive examinations. The platform provides:

- **Online Mock Tests**: TCS/IBPS CBT (Computer Based Test) pattern practice exams that mirror the real exam experience
- **Bilingual Support**: All questions available in both Marathi (मराठी) and English, switchable with one click during exams
- **Anti-Cheating System**: Secure fullscreen mode with tab-switch detection, copy-paste prevention, and automated proctoring
- **Instant Results**: Complete scorecards with accuracy breakdown, negative marking deduction, and statewide rankings immediately upon submission
- **Advanced Analytics**: Detailed performance analytics including subject-wise analysis, time management insights, and improvement tracking

## Exam Categories

### Police Bharti (पोलीस भरती)
Maharashtra Police Constable and Armed Police recruitment exams following TCS pattern with 100 MCQs, 100 marks, 90-minute duration. Covers General Knowledge, Marathi Grammar, English, Mathematics, Reasoning, and Current Affairs.

### MPSC (महाराष्ट्र लोकसेवा आयोग)
Maharashtra Public Service Commission exams including:
- MPSC Rajyaseva Prelims (राज्यसेवा पूर्व परीक्षा)
- MPSC Combined Exam (संयुक्त परीक्षा)
- MPSC Group B and Group C exams

### Talathi Bharti (तलाठी भरती)
Revenue Talathi recruitment exams conducted via TCS CBT pattern. Covers Marathi, English, Mathematics, General Knowledge, and Computer Knowledge.

### Zilla Parishad (जिल्हा परिषद)
ZP recruitment exams for positions including:
- Gram Sevak (ग्रामसेवक)
- Arogya Sevak (आरोग्य सेवक)
- Junior Engineer and other technical posts

### Saralseva Bharti (सरळसेवा भरती)
Direct recruitment exams for various state government positions including Vanrakshak (Forest Guard), Lipik, and other Group C/D posts.

### Previous Year Papers (PYQ)
Actual previous year question papers from past exams, digitized with answer keys and explanations.

## Platform Features

### For Students
1. **Free & Premium Tests**: Basic mock tests available free; unlimited premium tests with Student Pro subscription (₹199/year)
2. **Real Exam Simulation**: Timer, question navigation, marking for review — exactly like the TCS CBT interface
3. **Bilingual Toggle**: Switch between Marathi and English per-question during the exam
4. **Statewide Rankings**: Compare performance against all students across Maharashtra
5. **Detailed Review**: Post-exam review with correct answers, explanations, and time spent per question
6. **Performance Analytics**: Track progress over time with accuracy trends, subject-wise strengths/weaknesses
7. **Negative Marking**: Authentic negative marking rules as per actual exam patterns (typically -0.25 per wrong answer)

### For Coaching Academies
1. **White-Label Platform**: Coaching institutes can create and conduct exams under their own brand
2. **Paper Builder**: Create custom question papers in 5 minutes with bulk CSV import
3. **Question Bank**: Build and maintain private question banks organized by subject and topic
4. **Batch Management**: Organize students into batches, assign exams to specific batches
5. **Automated Results**: Instant results with WhatsApp result sharing capability
6. **Student Analytics**: Track individual and batch-level performance
7. **Teacher Accounts**: Multi-teacher support with role-based access control

## Pricing

| Plan | Price | Features |
|------|-------|----------|
| Free | ₹0 | Basic mock tests, instant results, bilingual questions |
| Student Pro | ₹199/year | Unlimited premium tests, statewide rank, advanced analytics, detailed explanations |
| Coaching | Custom | Unlimited students and batches, paper builder, question bank, academy branding |

## Technology

- Built with Next.js (React) for fast, SEO-optimized pages
- Progressive Web App (PWA) — installable on mobile devices
- Push notifications for new exam alerts and results
- Responsive design optimized for mobile-first usage
- Secure JWT-based authentication with MFA support

## Target Audience

1. **Students** preparing for Maharashtra state government competitive exams (age 18-35, primarily Marathi-speaking)
2. **Coaching academies** and competitive exam preparation classes across Maharashtra
3. **Teachers** who want to create and assign tests to their students digitally

## Geographic Focus

Primarily serves Maharashtra state, India. Content is optimized for:
- Maharashtra state-level competitive exams
- Marathi language support (primary) with English (secondary)
- Indian education system and recruitment patterns

## Key URLs

- Homepage: ${baseUrl}/
- All Exams: ${baseUrl}/exams
- Government Jobs: ${baseUrl}/jobs
- Blog: ${baseUrl}/blogs
- Student Registration: ${baseUrl}/register
- Coaching Registration: ${baseUrl}/coaching/register
- Pricing: ${baseUrl}/pricing
- Features: ${baseUrl}/features
- FAQs: ${baseUrl}/faq
- Sitemap: ${baseUrl}/sitemap.xml
- LLMs Summary: ${baseUrl}/llms.txt

## Contact & Social

- Website: ${baseUrl}
- Platform: MahaExam (महाएक्झाम)
- Language: Marathi (मराठी) and English
- Region: Maharashtra, India
`;

  return new Response(content, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
    },
  });
}
