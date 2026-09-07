const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const aiven = new PrismaClient({
  datasources: { db: { url: process.env.DATABASE_URL } }
});

const supabase = new PrismaClient({
  datasources: { db: { url: process.env.SECONDARY_DATABASE_URL } }
});

async function syncTable(modelName) {
  try {
    const aivenCount = await aiven[modelName].count();
    const supaCount = await supabase[modelName].count();
    
    if (aivenCount === 0) {
      console.log(`   - ${modelName}: 0 rows in Aiven, skipping.`);
      return;
    }

    if (aivenCount <= supaCount && (modelName === 'question' || modelName === 'questionOption')) {
      console.log(`   ✓ ${modelName}: already in sync (${aivenCount} rows), skipping bulk fetch.`);
      return;
    }

    console.log(`Syncing ${modelName} (Aiven: ${aivenCount}, Supabase: ${supaCount})...`);
    const aivenRows = await aiven[modelName].findMany();
    
    const CHUNK_SIZE = 250;
    let addedCount = 0;

    for (let i = 0; i < aivenRows.length; i += CHUNK_SIZE) {
      const chunk = aivenRows.slice(i, i + CHUNK_SIZE);
      const res = await supabase[modelName].createMany({
        data: chunk,
        skipDuplicates: true,
      });
      addedCount += res.count;
    }

    const totalSupabase = await supabase[modelName].count();
    console.log(`   ✓ ${modelName}: inserted ${addedCount} missing records, total in Supabase: ${totalSupabase}`);
  } catch (err) {
    console.error(`   ✗ Error syncing ${modelName}:`, err.message);
  }
}

async function main() {
  console.log('🚀 Starting targeted smart Aiven -> Supabase data transfer...\n');

  // 1. Independent & Master Tables
  await syncTable('subject');
  await syncTable('chapter');
  await syncTable('topic');
  await syncTable('organization');
  await syncTable('user');
  await syncTable('studentProfile');
  await syncTable('teacherProfile');
  await syncTable('subscriptionPlan');
  await syncTable('subscription');
  await syncTable('payment');
  await syncTable('paymentOrder');

  // 2. Questions & Options (checks counts first)
  await syncTable('question');
  await syncTable('questionOption');

  // 3. Exams & Exam Questions
  await syncTable('exam');
  await syncTable('examQuestion');
  await syncTable('examQuestionSnapshot');
  await syncTable('examEntitlement');
  await syncTable('examPurchase');
  await syncTable('globalExamNotification');

  // 4. Attempts & Results
  await syncTable('examAttempt');
  await syncTable('examAttemptEvent');
  await syncTable('examAttemptAnswer');
  await syncTable('examResult');
  await syncTable('examResultSubject');
  await syncTable('examResultSummary');
  await syncTable('subjectResult');

  // 5. Batches, Invites & Logs
  await syncTable('coachingBatch');
  await syncTable('coachingInvite');
  await syncTable('batch');
  await syncTable('batchMembership');
  await syncTable('blogPost');
  await syncTable('notification');
  await syncTable('studentNotification');
  await syncTable('auditLog');

  console.log('\n🎉 Targeted Aiven -> Supabase data transfer completed successfully!');
  await aiven.$disconnect();
  await supabase.$disconnect();
}

main().catch(console.error);
