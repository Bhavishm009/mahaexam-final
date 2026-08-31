# 🚀 MahaExam Platform — Production Setup & Deployment Guide

Welcome to **MahaExam Platform** — the comprehensive online examination and test series platform for Maharashtra competitive exams (Maharashtra Police Bharti, MPSC, Talathi, Zilla Parishad, Vanrakshak, Saralseva, and TCS/IBPS patterns).

---

## 📋 Table of Contents

1. [Tech Stack & Architecture](#tech-stack--architecture)
2. [Step 1: Free PostgreSQL Database Setup (Aiven)](#step-1-free-postgresql-database-setup-aiven)
3. [Step 2: Database Migration & 2,700-Question Seeding](#step-2-database-migration--2700-question-seeding)
4. [Step 3: Deploying on Vercel](#step-3-deploying-on-vercel)
5. [Step 4: Environment Variables Reference](#step-4-environment-variables-reference)
6. [Step 5: Super Admin Access & Live Error Diagnostics](#step-5-super-admin-access--live-error-diagnostics)
7. [Step 6: Free Web Push Notification Setup](#step-6-free-web-push-notification-setup)

---

## 🛠 Tech Stack & Architecture

- **Frontend & API**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Database & ORM**: PostgreSQL (Aiven / Supabase / Neon) + Prisma ORM
- **Authentication**: JWT Cookie Session (`jose`, `bcryptjs`) with Single Unified Login & Role-Based Routing
- **Web Push**: Standard RFC 8292 VAPID Web Push (`web-push`, Service Worker) — 100% Free Forever
- **Email Delivery**: Standard SMTP / Nodemailer (Gmail, Brevo, SendGrid, Amazon SES)
- **Diagnostics**: Centralized Audit Logging & Live Super Admin Error Dashboard (`/admin/logs`)

---

## Step 1: Free PostgreSQL Database Setup (Aiven)

1. Go to [aiven.io](https://aiven.io) and create a free account.
2. Click **Create Service** $\rightarrow$ Select **PostgreSQL** $\rightarrow$ Choose the **Free Plan**.
3. Select your preferred cloud region (e.g. AWS / Google Cloud in Mumbai / Singapore / Frankfurt).
4. Once the service is running, copy the **Service URI** (e.g., `postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.aivencloud.com:PORT/defaultdb?sslmode=require`).

---

## Step 2: Database Migration & 2,700-Question Seeding

In your local project folder (or build machine), run:

```bash
# 1. Install dependencies
npm install

# 2. Update .env with your Aiven DATABASE_URL
DATABASE_URL="postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.aivencloud.com:PORT/defaultdb?sslmode=require"

# 3. Push schema to your Aiven PostgreSQL database
npx prisma db push

# 4. Seed all 27 full mock tests (2,700 questions total) & Super Admin
node prisma/seed.js
```

### What `node prisma/seed.js` Creates Automatically:

- **Super Admin Account**: `bhavishm009@gmail.com` (Password: `demo123`)
- **10 Full Maharashtra Police Bharti 2025 Mock Tests** (100 Questions each)
- **5 Maharashtra Talathi Bharti Mock Tests (TCS Pattern)** (100 Questions each)
- **2 MPSC Rajyaseva GS Paper 1 Prelims Grand Mocks** (100 Questions each)
- **2 MPSC Group B & C (Combine) Prelims Grand Mocks** (100 Questions each)
- **2 Zilla Parishad Arogya Sevak & Gramsevak Grand Tests** (100 Questions each)
- **2 Maharashtra Vanrakshak (Forest Guard) Grand Mocks** (100 Questions each)
- **2 Saralseva Marathi & GK Master Tests** (100 Questions each)
- **2 TCS / IBPS Quantitative & Reasoning Grand Mocks** (100 Questions each)
- **Scheduled Global Practice Notification** for all students

---

## Step 3: Deploying on Vercel

1. Push your code repository to **GitHub** / **GitLab** / **Bitbucket**.
2. Go to [vercel.com](https://vercel.com) and click **Add New Project** $\rightarrow$ **Import** your repository.
3. In the **Environment Variables** section of Vercel, add the variables listed below in [Step 4](#step-4-environment-variables-reference).
4. Click **Deploy**. Vercel will build and launch your production application in ~1-2 minutes!

---

## Step 4: Environment Variables Reference

Copy these into your Vercel Project Settings (**Settings** $\rightarrow$ **Environment Variables**) and local `.env`:

```env
# 1. Database (Aiven PostgreSQL)
DATABASE_URL="postgres://avnadmin:YOUR_PASSWORD@YOUR_HOST.aivencloud.com:PORT/defaultdb?sslmode=require"

# 2. Application URL
NEXT_PUBLIC_APP_URL="https://your-app.vercel.app"
NODE_ENV="production"

# 3. Security & Auth Secrets
AUTH_SECRET="mahaexam-super-secret-jwt-key-for-production-2026"
AUTH_COOKIE_NAME="mahaexam_session"
INTERNAL_CRON_SECRET="mahaexam-cron-super-secret-key-2026"

# 4. Free Web Push VAPID Keys
NEXT_PUBLIC_VAPID_PUBLIC_KEY="BBXdoA9ueuPsQgjRjbAyEPBGxd47dSZ8cV02rSadvYAuNcjQ2Ev3L_1qZbXJvQ22u5U5fgS0H1mUzE6Ym8LOMiM"
VAPID_PRIVATE_KEY="2dlok6PztFXdAYkkc1PNJY1CYqdmqimJHNniW8M0_uQ"
VAPID_SUBJECT="mailto:support@mahaexam.com"

# 5. Optional Email / SMTP (for coaching academy welcome emails)
ENABLE_EMAIL=false
EMAIL_PROVIDER="smtp"
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-gmail-app-password"
EMAIL_FROM="MahaExam <your-email@gmail.com>"
```

---

## Step 5: Super Admin Access & Live Error Diagnostics

### 1. Super Admin Login:

- URL: `https://your-app.vercel.app/login`
- **Email**: `bhavishm009@gmail.com`
- **Password**: `demo123` (You can update your password in Profile)
- Automatically redirects to the **Super Admin Console** at `/admin`.

### 2. Live Diagnostics & Error Logger (`/admin/logs`):

- Click **"सिस्टम व एरर लॉग्स (System & Error Logs)"** in the left sidebar or navigate to `/admin/logs`.
- **Features**:
  - Real-time refresh of all user events, logins, and exam submissions.
  - 🚨 **Error Monitor**: Displays client-side runtime errors, API exceptions, route paths, stack traces, and JSON payloads.
  - Filter by **Errors Only**, **Logins**, or **Exam Submissions**, with a keyword search bar.

---

## Step 6: Free Web Push Notification Setup

- Web Push works out of the box using the included VAPID credentials.
- When any student registers or logs in, they are prompted to **"Enable Alerts (सुरू करा)"**.
- Clicking **"Enable"** saves their browser push token in the database.
- Broadcast notifications can be sent to all student devices anytime using `sendWebPushNotification({ title, body, url })`.
- Clicking the notification on desktop or mobile immediately redirects the student directly to `/student/exams`.

---

## 🧪 Verification Commands

```bash
# Check code style, linting, TypeScript & Prisma validity
npm run validate

# Run local development server
npm run dev
```

_Built with pride for students of Maharashtra._ 🚩
