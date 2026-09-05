const { PrismaClient } = require("@prisma/client");
const { execSync } = require("child_process");

const primaryUrl = process.env.PRIMARY_DATABASE_URL || process.env.DATABASE_URL;
const secondaryUrl = process.env.SECONDARY_DATABASE_URL || process.env.SHADOW_DATABASE_URL;

async function run() {
  console.log("🚀 Starting Full Supabase Database Schema & Data Synchronization...");

  const primary = new PrismaClient({ datasources: { db: { url: primaryUrl } } });
  const secondary = new PrismaClient({ datasources: { db: { url: secondaryUrl } } });

  try {
    // Step 1: Clean Supabase Schema
    console.log("1️⃣ Wiping Supabase Public Schema...");
    await secondary.$executeRawUnsafe(`DROP SCHEMA public CASCADE;`);
    await secondary.$executeRawUnsafe(`CREATE SCHEMA public;`);
    await secondary.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO postgres;`);
    await secondary.$executeRawUnsafe(`GRANT ALL ON SCHEMA public TO public;`);
    await secondary.$disconnect();
    console.log("✅ Schema wiped.");

    // Step 2: Push Prisma Schema to Supabase
    console.log("2️⃣ Pushing Prisma Schema to Supabase...");
    execSync(
      `npx cross-env DATABASE_URL="${secondaryUrl}" npx prisma db push --skip-generate --accept-data-loss`,
      { stdio: "inherit" },
    );
    console.log("✅ Prisma Schema successfully pushed to Supabase!");

    // Reconnect secondary
    const sec = new PrismaClient({ datasources: { db: { url: secondaryUrl } } });

    // Step 3: Copy Data in Strict Dependency Order
    console.log("3️⃣ Syncing Data from Aiven to Supabase...");

    // 1. Subjects
    const subjects = await primary.subject.findMany();
    if (subjects.length > 0) {
      await sec.subject.createMany({ data: subjects, skipDuplicates: true });
      console.log(`   ✓ Synced ${subjects.length} Subjects`);
    }

    // 2. Chapters
    const chapters = await primary.chapter.findMany();
    if (chapters.length > 0) {
      await sec.chapter.createMany({ data: chapters, skipDuplicates: true });
      console.log(`   ✓ Synced ${chapters.length} Chapters`);
    }

    // 3. Topics
    const topics = await primary.topic.findMany();
    if (topics.length > 0) {
      await sec.topic.createMany({ data: topics, skipDuplicates: true });
      console.log(`   ✓ Synced ${topics.length} Topics`);
    }

    // 4. Organizations
    const orgs = await primary.organization.findMany();
    if (orgs.length > 0) {
      await sec.organization.createMany({ data: orgs, skipDuplicates: true });
      console.log(`   ✓ Synced ${orgs.length} Organizations`);
    }

    // 5. Users
    const users = await primary.user.findMany();
    if (users.length > 0) {
      await sec.user.createMany({ data: users, skipDuplicates: true });
      console.log(`   ✓ Synced ${users.length} Users`);
    }

    // 6. StudentProfiles
    const studentProfiles = await primary.studentProfile.findMany();
    if (studentProfiles.length > 0) {
      await sec.studentProfile.createMany({ data: studentProfiles, skipDuplicates: true });
      console.log(`   ✓ Synced ${studentProfiles.length} Student Profiles`);
    }

    // 7. SubscriptionPlans
    const plans = await primary.subscriptionPlan.findMany();
    if (plans.length > 0) {
      await sec.subscriptionPlan.createMany({ data: plans, skipDuplicates: true });
      console.log(`   ✓ Synced ${plans.length} Subscription Plans`);
    }

    // 8. Exams
    const exams = await primary.exam.findMany();
    if (exams.length > 0) {
      await sec.exam.createMany({ data: exams, skipDuplicates: true });
      console.log(`   ✓ Synced ${exams.length} Exams`);
    }

    // 9. Questions (in chunks of 200)
    const questions = await primary.question.findMany();
    console.log(`   Syncing ${questions.length} Questions...`);
    const CHUNK_SIZE = 200;
    for (let i = 0; i < questions.length; i += CHUNK_SIZE) {
      const chunk = questions.slice(i, i + CHUNK_SIZE);
      await sec.question.createMany({ data: chunk, skipDuplicates: true });
    }
    console.log(`   ✓ Synced ${questions.length} Questions`);

    // 10. QuestionOptions (in chunks of 500)
    const options = await primary.questionOption.findMany();
    console.log(`   Syncing ${options.length} Question Options...`);
    for (let i = 0; i < options.length; i += CHUNK_SIZE * 2.5) {
      const chunk = options.slice(i, i + CHUNK_SIZE * 2.5);
      await sec.questionOption.createMany({ data: chunk, skipDuplicates: true });
    }
    console.log(`   ✓ Synced ${options.length} Question Options`);

    // 11. ExamQuestions
    const examQuestions = await primary.examQuestion.findMany();
    if (examQuestions.length > 0) {
      for (let i = 0; i < examQuestions.length; i += CHUNK_SIZE) {
        const chunk = examQuestions.slice(i, i + CHUNK_SIZE);
        await sec.examQuestion.createMany({ data: chunk, skipDuplicates: true });
      }
      console.log(`   ✓ Synced ${examQuestions.length} Exam Questions`);
    }

    // 12. Jobs
    const jobs = await primary.job.findMany();
    if (jobs.length > 0) {
      await sec.job.createMany({ data: jobs, skipDuplicates: true });
      console.log(`   ✓ Synced ${jobs.length} Jobs`);
    }

    // 13. SeoSettings
    const seos = await primary.seoSetting.findMany();
    if (seos.length > 0) {
      await sec.seoSetting.createMany({ data: seos, skipDuplicates: true });
      console.log(`   ✓ Synced ${seos.length} SEO Settings`);
    }

    console.log("\n🎉 FULL DATABASE SYNC COMPLETED SUCCESSFULLY!");

    // Verification Counts
    const pCount = await primary.question.count();
    const sCount = await sec.question.count();
    console.log(`📊 Primary Aiven Questions: ${pCount} | Secondary Supabase Questions: ${sCount}`);

    await sec.$disconnect();
  } catch (err) {
    console.error("❌ Sync failed with error:", err);
  } finally {
    await primary.$disconnect();
  }
}

run();
