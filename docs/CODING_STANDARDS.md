# MahaExam Coding & Formatting Standards

## 1. Purpose

MahaExam uses a consistent JavaScript/Next.js/Tailwind/Prisma style so that code remains readable as the platform grows.

The automated tools are:

- **Prettier** — formatting
- **ESLint** — JavaScript/React/Next.js quality rules
- **TypeScript** — static type checking
- **Prisma** — schema formatting and validation
- **Tailwind Prettier plugin** — deterministic Tailwind class ordering

## 2. Required commands

Before opening a PR:

```bash
npm run format
npm run prisma:format
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
```

Fast all-in-one validation:

```bash
npm run validate
```

CI runs the quality checks automatically.

## 3. Formatting rules

Prettier is the source of truth.

```text
Indentation:       2 spaces
Line width:        100
Semicolons:        yes
Quotes:            double
Trailing commas:   always
Arrow parens:      always
Line endings:      LF
```

Do not manually fight Prettier.

If a file is formatted differently, run:

```bash
npm run format
```

## 4. Imports

Keep imports at the top of the file.

Prefer:

```js
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
```

Avoid duplicate imports from the same module.

ESLint reports duplicate imports.

## 5. React / Next.js

Use Server Components by default.

Add:

```js
"use client";
```

only when the component needs browser/client behavior such as:

- `useState`
- `useEffect`
- browser APIs
- interactive event handlers

Do not make an entire page a Client Component unnecessarily.

## 6. API routes

API routes must:

1. Authenticate the request.
2. Authorize the role/organization.
3. Validate input.
4. Perform the operation.
5. Return a consistent response.
6. Avoid leaking sensitive errors.

Example:

```js
const session = await getSession();

if (!session) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Never trust authorization information supplied by the browser.

## 7. Role isolation

The platform has different trust boundaries:

```text
SUPER_ADMIN
COACHING_ADMIN
TEACHER
STUDENT
```

A coaching user must always be scoped to their `organizationId`.

Never fetch:

```js
prisma.exam.findMany();
```

for a coaching API when the data should belong only to that coaching.

Prefer:

```js
prisma.exam.findMany({
  where: {
    organizationId: session.organizationId,
  },
});
```

## 8. Student data

Students must not be able to access another student's:

- answers
- result details
- payment information
- notifications
- entitlements
- private analytics

Ownership must be checked server-side.

## 9. Exam security

The client is never the source of truth for:

- score
- correct answers
- timer expiry
- entitlement
- payment state
- result
- rank

These are server-controlled.

## 10. Database / Prisma

After changing `schema.prisma`:

```bash
npm run prisma:format
npm run prisma:validate
npx prisma generate
```

During development:

```bash
npx prisma migrate dev --name describe_the_change
```

Production:

```bash
npx prisma migrate deploy
```

Never edit an already-applied production migration.

## 11. Naming

Use:

```text
camelCase       JavaScript variables/functions
PascalCase      React components/classes
UPPER_SNAKE     environment constants when appropriate
```

Database names should follow the existing Prisma convention.

Use descriptive names:

```js
getExamAccess();
createPaymentOrder();
rebuildStudentPerformance();
```

Avoid:

```js
doIt();
process();
data();
thing();
```

## 12. Tailwind

Use Tailwind utilities rather than creating one-off CSS whenever practical.

Responsive-first example:

```jsx
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
```

Design for:

```text
Mobile
  ↓
Tablet
  ↓
Desktop
```

Do not assume a 1440px desktop screen.

## 13. Mobile requirements

Every new page must be checked at approximately:

```text
320px
375px
390px
430px
768px
1024px
1280px+
```

Pay special attention to:

- tables
- forms
- navigation
- exam question palette
- timers
- dialogs
- buttons
- long text
- horizontal overflow

Never introduce intentional horizontal page scrolling.

## 14. Tables

Tables should have a mobile strategy.

Use:

```jsx
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

For dense mobile data, consider converting rows into cards instead of forcing a huge table.

## 15. Forms

Forms should have:

- visible labels
- useful error messages
- keyboard accessibility
- disabled/loading state
- mobile-friendly controls
- server-side validation

Never rely only on browser validation.

## 16. Error handling

Do not expose stack traces to users.

Bad:

```js
return NextResponse.json({ error: error.stack });
```

Good:

```js
console.error(error);

return NextResponse.json({ error: "Unable to complete the request." }, { status: 500 });
```

## 17. Logging

`console.error` and `console.warn` are allowed.

Avoid noisy production logging.

Never log:

- passwords
- API secrets
- Razorpay secret
- session tokens
- full payment payloads containing sensitive information
- private student data unnecessarily

## 18. Environment variables

Never commit:

```text
.env
.env.local
.env.production
```

Commit only:

```text
.env.example
```

Public browser variables must use `NEXT_PUBLIC_`.

Secrets must never use `NEXT_PUBLIC_`.

## 19. Pull request checklist

Before creating a PR:

```text
[ ] npm run format
[ ] npm run lint
[ ] npm run typecheck
[ ] npm run prisma:validate
[ ] npm run build
[ ] Mobile checked
[ ] Desktop checked
[ ] Authorization checked
[ ] Error states checked
[ ] Loading states checked
[ ] No secrets committed
[ ] Database migration included if schema changed
```

## 20. Definition of done

A change is not complete merely because the main path works.

It must also have:

```text
Functionality
+ Validation
+ Authorization
+ Error handling
+ Loading state
+ Responsive UI
+ Accessibility basics
+ Formatting
+ Lint
+ Typecheck
+ Build
```
