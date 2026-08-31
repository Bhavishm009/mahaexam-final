# MahaExam Architecture

## High-level

```text
                 Browser
                    |
                Next.js
                    |
        +-----------+-----------+
        |           |           |
      Pages       APIs       Components
        |           |
        +-----------+
                    |
                 Services
                    |
       +------------+-------------+
       |            |             |
     Auth         Exams        Payments
       |            |             |
       +------------+-------------+
                    |
                  Prisma
                    |
               PostgreSQL
                    |
                Razorpay
```

## Trust boundaries

### Browser

Untrusted.

The browser may request:

```text
start exam
save answer
submit exam
buy exam
```

It cannot decide:

```text
score
payment verification
entitlement
rank
correct answer
```

### API

Authoritative.

The API:

- authenticates
- authorizes
- validates
- executes business rules
- writes database state

### Database

Source of truth for persistent state.

### Razorpay

External payment provider.

Payment status must be reconciled through server verification/webhooks.

## Roles

```text
SUPER_ADMIN
   |
   +-- platform-wide administration
   |
COACHING_ADMIN
   |
   +-- organization management
   +-- batches
   +-- coaching exams
   +-- coaching marketplace
   |
TEACHER
   |
   +-- assigned coaching operations
   |
STUDENT
   |
   +-- own exams/results/purchases
```

## Organization isolation

Every coaching-owned resource must be scoped to:

```text
organizationId
```

This is a mandatory authorization boundary.

## Exam access

Access can originate from:

```text
FREE_GLOBAL
COACHING
PAYMENT
ADMIN
```

The final decision is made server-side.

## Result pipeline

```text
Attempt
  ↓
Submission
  ↓
Evaluation
  ↓
ExamResult
  ↓
Subject/Section Results
  ↓
Leaderboard
  ↓
Analytics
```

## Marketplace pipeline

```text
Coaching Product
      ↓
Student Purchase
      ↓
Razorpay Payment
      ↓
Server Verification
      ↓
Entitlement
      ↓
Marketplace Ledger
      ↓
Razorpay Route
      ↓
Coaching Linked Account
```

## Notifications

Notifications are persisted in the database.

This allows:

```text
read/unread
history
targeting
future email/push integrations
```

## Important design rule

Do not duplicate business rules across pages.

Bad:

```text
Student page decides access
Coaching page decides access
API decides access
```

Good:

```text
Access Service
      ↓
All APIs use the same rule
```
