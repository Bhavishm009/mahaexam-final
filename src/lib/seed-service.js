import bcrypt from "bcryptjs";
import { generateFull2000QuestionBank } from "./question-generator.js";

export async function runCompleteDatabaseSeed(prismaClient) {
  console.warn("🌱 Starting Enterprise Production Database Seeding with 2000+ Verified Questions...");

  // 1. Organization
  const org = await prismaClient.organization.upsert({
    where: { slug: "shivneri-academy" },
    update: {},
    create: {
      name: "Shivneri Competitive Academy",
      slug: "shivneri-academy",
      email: "academy@example.com",
      phone: "9876543210",
      district: "Pune",
      state: "Maharashtra",
      subscriptionPlan: "PROFESSIONAL",
    },
  });

  const passwordHash = await bcrypt.hash("demo123", 12);

  // 2. Primary Super Admin (Bhavish)
  const bhavishAdmin = await prismaClient.user.upsert({
    where: { email: "bhavishm009@gmail.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      name: "Bhavish (Super Admin)",
      email: "bhavishm009@gmail.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });
  console.warn(`✅ Super Admin configured: ${bhavishAdmin.email}`);

  // Fallback Admin
  await prismaClient.user.upsert({
    where: { email: "admin@example.com" },
    update: { role: "SUPER_ADMIN", passwordHash },
    create: {
      name: "Platform Admin",
      email: "admin@example.com",
      passwordHash,
      role: "SUPER_ADMIN",
    },
  });

  // Coaching Admin & Student
  await prismaClient.user.upsert({
    where: { email: "academy@example.com" },
    update: { passwordHash, organizationId: org.id },
    create: {
      name: "Prof. Rajesh Deshmukh",
      email: "academy@example.com",
      passwordHash,
      role: "COACHING_ADMIN",
      organizationId: org.id,
    },
  });

  await prismaClient.user.upsert({
    where: { email: "student@example.com" },
    update: { passwordHash },
    create: {
      name: "Rahul Patil",
      email: "student@example.com",
      passwordHash,
      role: "STUDENT",
      studentProfile: {
        create: {
          targetExam: "Maharashtra Police Bharti & Talathi",
          education: "Graduate",
          district: "Pune",
          taluka: "Haveli",
        },
      },
    },
  });

  // 3. Setup Subjects
  const subjectsData = [
    { name: "History of Maharashtra & India", nameMr: "इतिहास (महाराष्ट्राचा व भारताचा इतिहास)", slug: "history" },
    { name: "Geography of Maharashtra & India", nameMr: "भूगोल (महाराष्ट्राचा व भारताचा भूगोल)", slug: "geography" },
    { name: "Indian Polity & Constitution", nameMr: "भारतीय राज्यघटना व नागरिकशास्त्र", slug: "constitution" },
    { name: "Marathi Grammar", nameMr: "मराठी व्याकरण व शब्दसंग्रह", slug: "marathi" },
    { name: "English Language & Grammar", nameMr: "इंग्रजी व्याकरण (English Language)", slug: "english" },
    { name: "Mathematics & Quantitative Aptitude", nameMr: "अंकगणित व संख्यात्मक अभियोग्यता", slug: "mathematics" },
    { name: "Logical Reasoning & Mental Ability", nameMr: "बुद्धिमत्ता चाचणी व तर्कक्षमता", slug: "reasoning" },
    { name: "General Science", nameMr: "सामान्य विज्ञान (भौतिक, रसायन व जीवशास्त्र)", slug: "science" },
    { name: "Economics & Budget", nameMr: "अर्थव्यवस्था व शासकीय योजना", slug: "economics" },
    { name: "Current Affairs & Static GK", nameMr: "चालू घडामोडी व सामान्य ज्ञान", slug: "general-knowledge" },
  ];

  const subjectMap = {};
  for (const s of subjectsData) {
    const rec = await prismaClient.subject.upsert({
      where: { slug: s.slug },
      update: { name: s.name, nameMr: s.nameMr },
      create: { name: s.name, nameMr: s.nameMr, slug: s.slug },
    });
    subjectMap[s.slug] = rec.id;
  }

  // 4. Generate the full question bank (>= 200 unique questions per topic)
  const fullBank = generateFull2000QuestionBank();
  const createdQuestionBank = {};

  console.warn("📦 Creating Question Bank in database (200+ unique questions per topic)...");

  for (const [slug, qList] of Object.entries(fullBank)) {
    const subjectId = subjectMap[slug] || subjectMap["general-knowledge"];
    createdQuestionBank[slug] = [];

    console.warn(`  ↳ Creating ${qList.length} questions for topic: [${slug}]`);

    for (const q of qList) {
      const createdQ = await prismaClient.question.create({
        data: {
          subjectId,
          questionText: q.qText,
          questionTextMr: q.qTextMr,
          explanation: q.expMr,
          explanationMr: q.expMr,
          difficulty: "MEDIUM",
          marks: 1,
          negativeMarks: 0,
          status: "PUBLISHED",
          createdBy: bhavishAdmin.id,
          options: {
            create: q.options.map((opt, optIdx) => ({
              optionText: opt.text,
              optionTextMr: opt.text,
              isCorrect: opt.isCorrect,
              optionOrder: optIdx + 1,
            })),
          },
        },
        include: {
          options: true,
        },
      });

      createdQuestionBank[slug].push({
        ...createdQ,
        subjectSlug: slug,
        expMr: q.expMr,
      });
    }
  }

  // 5. Setup 27 Exams: 10 LIVE + 17 DRAFT
  const examsMeta = [
    // --- 10 LIVE EXAMS ---
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 01 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०१)",
      slug: "police-bharti-mock-01",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०१ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 02 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०२)",
      slug: "police-bharti-mock-02",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०२ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 03 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०३)",
      slug: "police-bharti-mock-03",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०३ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "Maharashtra Police Bharti 2025 Grand Mega Mock 04 (महाराष्ट्र पोलीस शिपाई सराव परीक्षा - ०४)",
      slug: "police-bharti-mock-04",
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "महाराष्ट्र पोलीस शिपाई व चालक भरती २०२५ सराव संच क्रमांक ०४ - १०० गुणांची मोफत ऑनलाइन लाइव्ह टेस्ट.",
    },
    {
      title: "MPSC Rajyaseva GS Paper 1 Prelims Grand Mock 01 (राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन - ०१)",
      slug: "mpsc-rajyaseva-mock-01",
      examType: "MPSC_RAJYASEVA",
      durationMinutes: 120,
      passingMarks: 50,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन १०० वस्तुनिष्ठ प्रश्न - संच ०१.",
    },
    {
      title: "MPSC Rajyaseva GS Paper 1 Prelims Grand Mock 02 (राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन - ०२)",
      slug: "mpsc-rajyaseva-mock-02",
      examType: "MPSC_RAJYASEVA",
      durationMinutes: 120,
      passingMarks: 50,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी राज्यसेवा पूर्व परीक्षा सामान्य अध्ययन १०० वस्तुनिष्ठ प्रश्न - संच ०२.",
    },
    {
      title: "MPSC Group B & C (Combine) Prelims Grand Mock 01 (संयुक्त पूर्व परीक्षा गट ब व क - ०१)",
      slug: "mpsc-combine-mock-01",
      examType: "MPSC_COMBINE",
      durationMinutes: 60,
      passingMarks: 45,
      negativeMarks: 0.25,
      status: "LIVE",
      description: "एमपीएससी गट ब व गट क संयुक्त पूर्व परीक्षेसाठी १०० प्रश्नांची सराव टेस्ट ०१.",
    },
    {
      title: "Maharashtra Talathi Bharti Grand Mock Test 01 (तलाठी भरती सराव परीक्षा - ०१)",
      slug: "talathi-mock-01",
      examType: "TALATHI",
      durationMinutes: 120,
      passingMarks: 45,
      negativeMarks: 0,
      status: "LIVE",
      description: "TCS पॅटर्ननुसार तलाठी भरती १०० प्रश्नांचा संपूर्ण सराव पेपर ०१.",
    },
    {
      title: "Zilla Parishad (ZP) Arogya Sevak & Gramsevak Grand Test 01 (जिल्हा परिषद भरती विशेष - ०१)",
      slug: "zp-gramsevak-mock-01",
      examType: "ZILLA_PARISHAD",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "LIVE",
      description: "जिल्हा परिषद अंतर्गत आरोग्य सेवक व ग्रामसेवक १०० प्रश्नांचा सराव संच ०१.",
    },
    {
      title: "Maharashtra Vanrakshak (Forest Guard) Grand CBT Mock 01 (वनरक्षक भरती सराव परीक्षा - ०१)",
      slug: "vanrakshak-mock-01",
      examType: "VANRAKSHAK",
      durationMinutes: 90,
      passingMarks: 45,
      negativeMarks: 0,
      status: "LIVE",
      description: "वनरक्षक भरती १०० प्रश्न - पर्यावरण, वने, जैवविविधता व भूगोल - संच ०१.",
    },

    // --- 17 DRAFT EXAMS ---
    ...Array.from({ length: 6 }, (_, i) => ({
      title: `Maharashtra Police Bharti 2025 Grand Mock Test ${String(i + 5).padStart(2, "0")} (पोलीस भरती संच - ${String(i + 5).padStart(2, "0")})`,
      slug: `police-bharti-mock-${String(i + 5).padStart(2, "0")}`,
      examType: "POLICE_BHARTI",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: `महाराष्ट्र पोलीस भरती १०० गुणांचा सराव संच ${i + 5} (मसुदा / Draft).`,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      title: `Maharashtra Talathi Bharti Grand Mock Test ${String(i + 2).padStart(2, "0")} (तलाठी भरती संच - ${String(i + 2).padStart(2, "0")})`,
      slug: `talathi-mock-${String(i + 2).padStart(2, "0")}`,
      examType: "TALATHI",
      durationMinutes: 120,
      passingMarks: 45,
      negativeMarks: 0,
      status: "DRAFT",
      description: `TCS पॅटर्न तलाठी भरती १०० प्रश्नांचा सराव संच ${i + 2} (Draft).`,
    })),
    {
      title: "MPSC Group B & C (Combine) Prelims Grand Mock 02 (संयुक्त पूर्व परीक्षा - ०२)",
      slug: "mpsc-combine-mock-02",
      examType: "MPSC_COMBINE",
      durationMinutes: 60,
      passingMarks: 45,
      negativeMarks: 0.25,
      status: "DRAFT",
      description: "एमपीएससी गट ब व गट क संयुक्त पूर्व परीक्षा १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Zilla Parishad (ZP) Arogya Sevak & Gramsevak Grand Test 02 (जिल्हा परिषद संच - ०२)",
      slug: "zp-gramsevak-mock-02",
      examType: "ZILLA_PARISHAD",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "जिल्हा परिषद भरती १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Maharashtra Vanrakshak (Forest Guard) Grand CBT Mock 02 (वनरक्षक संच - ०२)",
      slug: "vanrakshak-mock-02",
      examType: "VANRAKSHAK",
      durationMinutes: 90,
      passingMarks: 45,
      negativeMarks: 0,
      status: "DRAFT",
      description: "वनरक्षक भरती १०० प्रश्न संच ०२ (Draft).",
    },
    {
      title: "Saralseva Marathi Grammar & GK 100-Question Master Test 01 (सरळसेवा विशेष - ०१)",
      slug: "saralseva-gk-marathi-01",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "सरळसेवा भरती १०० गुणांचा मास्टर सराव पेपर ०१ (Draft).",
    },
    {
      title: "Saralseva Marathi Grammar & GK 100-Question Master Test 02 (सरळसेवा विशेष - ०२)",
      slug: "saralseva-gk-marathi-02",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "सरळसेवा भरती १०० गुणांचा मास्टर सराव पेपर ०२ (Draft).",
    },
    {
      title: "TCS / IBPS Quantitative Aptitude & Reasoning 100-Question Grand Mock 01 (अंकगणित व बुद्धिमत्ता - ०१)",
      slug: "tcs-ibps-maths-reasoning-01",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "TCS/IBPS पॅटर्न अंकगणित व बुद्धिमत्ता १०० प्रश्न संच ०१ (Draft).",
    },
    {
      title: "TCS / IBPS Quantitative Aptitude & Reasoning 100-Question Grand Mock 02 (अंकगणित व बुद्धिमत्ता - ०२)",
      slug: "tcs-ibps-maths-reasoning-02",
      examType: "SARALSEVA",
      durationMinutes: 90,
      passingMarks: 40,
      negativeMarks: 0,
      status: "DRAFT",
      description: "TCS/IBPS पॅटर्न अंकगणित व बुद्धिमत्ता १०० प्रश्न संच ०२ (Draft).",
    },
  ];

  console.warn(`🚀 Assembling 27 Exams with 100 Unique Questions Each (NO DUPLICATES within any exam)...`);

  for (let idx = 0; idx < examsMeta.length; idx++) {
    const meta = examsMeta[idx];

    // Select 100 unique questions from across the 10 topics without any duplicate
    const examQuestions = [];
    const usedQIds = new Set();

    const topicDistribution = [
      { slug: "marathi", count: 15 },
      { slug: "history", count: 12 },
      { slug: "geography", count: 12 },
      { slug: "constitution", count: 12 },
      { slug: "mathematics", count: 12 },
      { slug: "reasoning", count: 12 },
      { slug: "science", count: 10 },
      { slug: "economics", count: 8 },
      { slug: "general-knowledge", count: 7 },
    ];

    for (const dist of topicDistribution) {
      const list = createdQuestionBank[dist.slug] || [];
      const offset = (idx * dist.count) % list.length;
      let added = 0;
      let scanIdx = offset;

      while (added < dist.count && added < list.length) {
        const item = list[scanIdx % list.length];
        if (!usedQIds.has(item.id)) {
          usedQIds.add(item.id);
          examQuestions.push(item);
          added++;
        }
        scanIdx++;
      }
    }

    console.warn(`📚 [${idx + 1}/${examsMeta.length}] Configuring ${meta.slug} (${examQuestions.length} unique questions) [Status: ${meta.status}]`);

    const exam = await prismaClient.exam.upsert({
      where: { slug: meta.slug },
      update: {
        title: meta.title,
        status: meta.status,
        isFree: true,
        visibilityMode: "FREE_GLOBAL",
        price: 0,
        durationMinutes: meta.durationMinutes,
        passingScore: meta.passingMarks,
        totalQuestions: examQuestions.length,
        totalMarks: examQuestions.length,
        negativeMarks: meta.negativeMarks,
        examType: meta.examType,
        description: meta.description,
      },
      create: {
        title: meta.title,
        slug: meta.slug,
        examType: meta.examType,
        durationMinutes: meta.durationMinutes,
        totalQuestions: examQuestions.length,
        totalMarks: examQuestions.length,
        passingScore: meta.passingMarks,
        negativeMarks: meta.negativeMarks,
        isFree: true,
        price: 0,
        visibilityMode: "FREE_GLOBAL",
        status: meta.status,
        createdBy: bhavishAdmin.id,
        description: meta.description,
      },
    });

    await prismaClient.examQuestion.deleteMany({
      where: { examId: exam.id },
    });
    await prismaClient.examQuestionSnapshot.deleteMany({
      where: { examId: exam.id },
    });

    for (let qIdx = 0; qIdx < examQuestions.length; qIdx++) {
      const q = examQuestions[qIdx];
      const correctOption = q.options.find((o) => o.isCorrect);

      await prismaClient.examQuestion.create({
        data: {
          examId: exam.id,
          questionId: q.id,
          questionOrder: qIdx + 1,
          marks: 1,
          negativeMarks: meta.negativeMarks,
        },
      });

      await prismaClient.examQuestionSnapshot.create({
        data: {
          examId: exam.id,
          sourceQuestionId: q.id,
          position: qIdx + 1,
          marks: 1,
          negativeMarks: meta.negativeMarks,
          snapshot: {
            id: q.id,
            questionText: q.questionText,
            questionTextMr: q.questionTextMr,
            explanation: q.explanation,
            explanationMr: q.explanationMr,
            marks: 1,
            negativeMarks: meta.negativeMarks,
            subject: q.subjectSlug,
            correctOptionId: correctOption?.id || null,
            options: q.options.map((o) => ({
              id: o.id,
              text: o.optionText,
              textMr: o.optionTextMr,
              order: o.optionOrder,
              isCorrect: o.isCorrect,
            })),
          },
        },
      });
    }
  }

  console.warn("🎉 Database Seeding Finished: 2,000+ unique questions seeded, 10 LIVE and 17 Draft Exams created with 0 duplicates!");
  return { success: true };
}
