# MahaExam Development Guide

## Stack

```text
Next.js
JavaScript
React
Tailwind CSS
shadcn/ui
Prisma
PostgreSQL
Razorpay
```

## First setup

```bash
git clone <repository>
cd mahaexam

npm install

cp .env.example .env.local
```

Configure the required local environment variables.

Then:

```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

Open:

```text
http://localhost:3000
```

## Daily development

Start:

```bash
npm run dev
```

Before committing:

```bash
npm run format
npm run lint
npm run typecheck
npm run prisma:validate
```

Or:

```bash
npm run validate
```

## Formatting

Format everything:

```bash
npm run format
```

Check formatting without changing files:

```bash
npm run format:check
```

## Prisma

Format:

```bash
npm run prisma:format
```

Validate:

```bash
npm run prisma:validate
```

Generate:

```bash
npm run prisma:generate
```

## Build

```bash
npm run build
```

Run production build:

```bash
npm run start
```

## Directory conventions

Recommended structure:

```text
src/
  app/
    api/
    admin/
    coaching/
    student/
  components/
    ui/
    shared/
  lib/
    auth/
    exam/
    payments/
    analytics/
    notifications/
  hooks/
  types/
```

Keep business logic out of large page components.

Move reusable business logic into `src/lib`.

## Adding an API

Use:

```text
src/app/api/<resource>/route.js
```

For nested resources:

```text
src/app/api/coaching/batches/[id]/students/route.js
```

Every protected API should authenticate and authorize before querying sensitive data.

## Adding a page

Prefer:

```text
src/app/student/exams/page.js
```

Use shared layout/navigation components rather than creating a separate navbar for every page.

## UI components

Prefer shadcn/ui components for common UI:

```text
Button
Input
Label
Dialog
DropdownMenu
Select
Tabs
Table
Card
Sheet
Toast
```

Keep visual styles consistent.

## Responsive design

Use mobile-first Tailwind classes:

```text
base → sm → md → lg → xl
```

Example:

```jsx
<div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
```

## Git workflow

Recommended:

```text
main
  ↑
develop
  ↑
feature/<name>
```

Example:

```bash
git checkout develop
git checkout -b feature/exam-marketplace
```

Commit messages:

```text
feat: add coaching marketplace
fix: prevent duplicate exam submission
refactor: simplify exam access service
docs: update development guide
test: add payment webhook tests
chore: update formatting rules
```

## CI

GitHub Actions runs:

```text
npm ci
     ↓
Prisma validation
     ↓
Prettier check
     ↓
ESLint
     ↓
TypeScript
     ↓
Next.js build
```

A PR should not be merged if the quality workflow fails.
