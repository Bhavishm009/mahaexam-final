# MahaExam Release Checklist

## Before release

### Code quality

```bash
npm run format:check
npm run lint
npm run typecheck
npm run prisma:validate
npm run build
```

All must pass.

### Database

- [ ] Migration reviewed
- [ ] Migration tested on staging
- [ ] Backup confirmed
- [ ] Production migration plan prepared

### Authentication

- [ ] Signup
- [ ] Login
- [ ] Logout
- [ ] Password handling
- [ ] Role redirection
- [ ] Unauthorized route handling

### Authorization

- [ ] Super Admin isolation
- [ ] Coaching organization isolation
- [ ] Student ownership
- [ ] Payment ownership
- [ ] Exam entitlement

### Exam

- [ ] Start
- [ ] Resume
- [ ] Timer
- [ ] Save answer
- [ ] Mark for review
- [ ] Submit
- [ ] Auto-submit
- [ ] Result

### Payments

- [ ] Razorpay Test Mode
- [ ] Signature verification
- [ ] Webhook signature
- [ ] Duplicate webhook
- [ ] Failed payment
- [ ] Refund
- [ ] Entitlement revocation

### Marketplace

- [ ] Coaching product
- [ ] Price
- [ ] Platform fee
- [ ] Coaching share
- [ ] Ledger
- [ ] Linked Account
- [ ] Transfer
- [ ] Transfer webhook
- [ ] Reconciliation

### UI

Check:

```text
320px
375px
390px
430px
768px
1024px
1280px
1440px
```

Test:

- [ ] Navigation
- [ ] Forms
- [ ] Tables
- [ ] Dialogs
- [ ] Exam screen
- [ ] Question palette
- [ ] Dashboard
- [ ] Checkout

### Production

- [ ] HTTPS
- [ ] Environment variables
- [ ] Database backups
- [ ] Monitoring
- [ ] Error tracking
- [ ] Razorpay Live credentials
- [ ] Razorpay Live webhook
- [ ] Domain
- [ ] DNS
- [ ] Health check
- [ ] Rollback plan
