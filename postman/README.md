# MahaExam Postman API Collection & Environment

This directory contains the ready-to-import Postman collection and environment files for testing all MahaExam APIs locally or in staging/production.

---

## Files Included

1. **`MahaExam_API.postman_collection.json`**
   - Comprehensive v2.1.0 Postman collection containing all platform endpoints organized into logical modules:
     - **01 - Health & System** (`/api/health`, `/api/ready`)
     - **02 - Authentication** (Student Login, Coaching Login, Admin Login, Session Me, Register, Profile, Change Password, OTP, Logout)
     - **03 - Student Portal** (Dashboard, Exams List, Attempt Start/Answer/Violations/Submit, Results History & Breakdown, Analytics, Leaderboard, Review)
     - **04 - Coaching Academy Portal** (Dashboard, Batches CRUD, Assign Students & Exams, Paper Builder, Questions Bank, Analytics, Payout Account)
     - **05 - Admin Portal** (Overview Stats, Analytics, Users, Transactions, Subscription Plans, Organizations, Payouts, Audit & Error Logs)
     - **06 - Payments & Subscriptions** (Public Plans, Create Order, Verify Signature, Razorpay Webhook)
     - **07 - Question Bank** (Search, Chapters, Topics, Bulk Import & Validation)

2. **`MahaExam_Environment.postman_environment.json`**
   - Environment configuration containing preset variables:
     - `baseUrl`: `http://localhost:3000`
     - `studentEmail`: `student@example.com`
     - `studentPassword`: `demo123`
     - `coachingEmail`: `academy@example.com`
     - `coachingPassword`: `demo123`
     - `adminEmail`: `admin@example.com`
     - `adminPassword`: `demo123`
     - `authToken`: (Auto-populated by login requests)
     - `examId`: `police-01`
     - `attemptId`: (Auto-populated when starting an exam attempt)
     - `batchId`: (Auto-populated when creating a batch)

---

## How to Import into Postman

1. Open **Postman**.
2. In the top-left corner, click **Import**.
3. Drag & drop or browse to select:
   - `postman/MahaExam_API.postman_collection.json`
   - `postman/MahaExam_Environment.postman_environment.json`
4. In the top-right environment dropdown in Postman, select **`MahaExam Local & Production Env`**.

---

## Automated Authentication & Token Capture

The collection is pre-configured with Postman Test Scripts:
- When you execute **`Login - Student`**, **`Login - Coaching Admin`**, or **`Login - Platform Admin`**, Postman will automatically extract `token` from the response JSON and save it to the `authToken` environment variable.
- All requests in the collection inherit **Bearer Authentication** with `{{authToken}}` or use the session cookie automatically maintained by Postman.
- When you execute **`Start Exam Attempt`**, Postman automatically captures the new `attemptId` so subsequent calls to `/answer`, `/event`, `/submit`, and `/results/{{attemptId}}` work seamlessly without manual copying!
- When you execute **`Create Batch`**, Postman automatically saves `batchId` for batch student/exam assignment endpoints.

---

## Testing Local Server

Ensure your Next.js application is running before executing requests:
```bash
npm run dev
```
Then run **`01 - Health & System -> Health Check`** to verify connectivity (`http://localhost:3000/api/health`).

