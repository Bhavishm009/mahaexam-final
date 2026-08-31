# MahaExam Finalization QA

This pass is a cleanup/finalization pass only. No new product feature was intentionally added.

## Completed cleanup

- Consolidated duplicate Prisma model declarations.
- Consolidated duplicate Prisma enum declarations.
- De-duplicated repeated model fields/relations.
- Preserved the existing application source files.
- Added standard package scripts for Prisma validation, Prisma generation and TypeScript checking.
- Added final QA documentation.

## Required local verification

Run:

```bash
npm install
npm run prisma:validate
npx prisma generate
npm run typecheck
npm run build
```

Then run the database migration workflow:

```bash
npx prisma migrate dev --name initial_production_schema
```

For production:

```bash
npx prisma migrate deploy
```

## Functional smoke test

Test these flows manually after the build succeeds:

1. Super Admin signup/login.
2. Coaching login/redirection.
3. Student login/redirection.
4. Super Admin creates a free exam.
5. Student sees the free exam.
6. Student starts/submits an exam.
7. Result is calculated.
8. Leaderboard updates.
9. Coaching creates a batch.
10. Coaching adds a student.
11. Coaching assigns an exam to the batch.
12. Batch student can access the exam.
13. Unrelated coaching student cannot access it.
14. Coaching publishes a free practice paper.
15. All students can discover the free paper.
16. Coaching publishes a paid paper.
17. Student creates a Razorpay order in Test Mode.
18. Payment signature is verified.
19. Entitlement becomes ACTIVE.
20. Razorpay webhook is accepted and idempotent.
21. Marketplace ledger records gross/platform/coaching share.
22. Super Admin sees financial records.
23. Coaching sees payout status.

## Important limitation

Automated `npm install`/`npm build` validation depends on network/package availability in the execution environment. This ZIP should not be described as production-certified until the commands above have been run successfully in the target environment.

## No new feature

This version intentionally stops feature development. The next decision should be based on the QA results rather than adding another version.
