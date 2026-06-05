# Academic Scheduler MVP

## Tech Stack
- Next.js 14 (App Router) + TypeScript
- Prisma + SQLite (`dev.db`)
- NextAuth v5 (Credentials only)
- Tailwind + minimal shadcn/ui-style components (`Button`, `Form`, `Select`, `Table`, `Dialog`, `Card`)

## Quick Start
```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Seed Data
```bash
npm run db:seed
```

Test accounts:
- `teacher@example.com / teacher123`
- `ta@example.com / ta123`
- `student@example.com / student123`

## Scripts
- `npm run dev`
- `npm run lint`
- `npm run test`
- `npm run build`
- `npm run db:migrate`
- `npm run db:studio`

## Docker
```bash
docker build -t meet .
docker run -p 3000:3000 -e AUTH_SECRET=replace-me meet
```
