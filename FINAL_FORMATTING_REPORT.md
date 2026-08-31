# Final Formatting & Documentation Pass

Completed:

- Prettier configuration
- Tailwind class sorting via prettier-plugin-tailwindcss
- ESLint flat configuration
- Next.js Core Web Vitals rules
- TypeScript checking command
- Prisma formatting/validation commands
- EditorConfig
- VS Code recommended extensions/settings
- GitHub Actions quality workflow
- Root development scripts
- Coding standards documentation
- Development documentation
- Architecture documentation
- Release checklist
- Environment variable example

## Standard quality command

```bash
npm run validate
```

## CI gate

```text
npm ci
 ↓
Prisma validate
 ↓
Prettier check
 ↓
ESLint
 ↓
TypeScript
 ↓
Next.js build
```

This pass does not intentionally introduce a new product feature.
