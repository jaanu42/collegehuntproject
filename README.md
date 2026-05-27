# CollegeHunt

College discovery and decision platform for Indian students.

**Live:** https://collegehunt-4vqb.vercel.app/
## Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Stack

Next.js 14 · Tailwind CSS · shadcn/ui · Recharts · TypeScript

## Features

- Search and filter 22 real colleges by stream, ownership, city, and fees
- Personalised ranking via onboarding (stream → exam → priority)
- Shortlist persists in localStorage across reloads
- Smart comparison tool with live weight sliders and winner highlights
- College detail page with placement charts, fee breakdown, and recruiter list
- Admission predictor — enter your percentile, get live probability

## Structure

```
app/
  page.tsx              # Homepage — search, filters, college cards
  compare/page.tsx      # Comparison tool
  colleges/[slug]/      # College detail page
components/
  CompareTray.tsx
  OnboardingModal.tsx
  CollegeCardSkeleton.tsx
data/
  colleges.ts           # 22 seeded colleges
```