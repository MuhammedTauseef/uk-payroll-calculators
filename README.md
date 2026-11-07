# SSP Hub — UK employer & payroll calculator site

A UK-facing calculator hub anchored on a Statutory Sick Pay (SSP) calculator.
Built with the house stack: Next.js (App Router) + TypeScript + Tailwind CSS,
npm. No paid services or APIs. All statutory rates live in one config file.

## What is built (Steps 1–3)

- **Home page** (`/`) — hub introduction and links to all four calculators.
- **SSP calculator** (`/ssp-calculator`) — the anchor tool, targeting the
  keyword "ssp calculator". Inputs: average weekly earnings, qualifying days
  per week, qualifying days absent, and linked previous sickness (yes/no +
  days already paid). Output is a worked breakdown from the visitor's own
  numbers: weekly amount (and which rule produced it), daily rate, days
  payable, 28-week entitlement position, and the total.
- **Notice period calculator** (`/notice-period-calculator`) — targeting the
  keyword "notice period calculator uk". Inputs: who is giving notice
  (employer/employee), employment start date, date notice is given, and the
  contract notice period (weeks or months; months convert at 52/12). Output
  is a worked breakdown: statutory minimum under Employment Rights Act 1996
  s.86, contract notice, the effective notice (the longer of the two, and
  why), and the earliest last working day (notice runs from the day after
  notice is given). Employer statutory minimum: none under 1 month's
  service, 1 week to 2 years, then 1 week per complete year capped at 12
  weeks; employee minimum: 1 week from 1 month's service.
- **Pro-rata salary calculator** (`/pro-rata-salary-calculator`) —
  targeting the keyword "pro rata salary calculator". Inputs: full-time
  salary, and the part-time fraction measured by hours per week or days
  per week. Output: pro-rata annual, monthly and weekly pay, the FTE
  fraction (e.g. 0.6 FTE), the worked formula, and — separately from pay —
  pro-rata statutory holiday in days (5.6 weeks × part-time days per
  week, e.g. 3 days/week = 16.8 days).
- **Employer National Insurance calculator**
  (`/employer-national-insurance-calculator`) — targeting the keyword
  "employers national insurance calculator". Inputs: gross salary (per
  year or per month), employee category (standard, or under 21 /
  apprentice under 25), and an Employment Allowance toggle. Output:
  employer Class 1 NICs per year and per month, the worked breakdown
  (threshold, earnings above it, rate, allowance), and the total cost of
  employing (salary + employer NICs). The page also carries the guide
  section for "employer ni rates 2026/27". **Rates dating:** the
  calculator uses the 2025/26 figures (15% above a £5,000/yr Secondary
  Threshold; 0% up to £50,270/yr for under-21s and apprentices under 25;
  Employment Allowance £10,500), labelled as 2025/26 everywhere — the
  2026/27 rates must be re-verified against GOV.UK before launch and are
  NOT claimed anywhere on the page.
- **Rates config** (`src/lib/rates.ts`) — the single source of truth for all
  statutory rates: SSP, SMP, redundancy caps, Employment Allowance, and
  employer NI (2025/26 figures, separately dated — see above).
- **SSP maths** (`src/lib/ssp.ts`) — pure, testable calculation module.
- **Notice maths** (`src/lib/notice.ts`) — pure, testable module for the
  s.86 statutory notice rules (rules of law, not rates, so not in rates.ts).
- **Pro-rata maths** (`src/lib/prorata.ts`) — pure, testable module; the
  5.6-week statutory holiday rule lives here (a rule of law, not a rate).
- **Employer NI maths** (`src/lib/employerNi.ts`) — pure, testable module
  reading its rates from `rates.ts`.
- Shared layout and design shell built on the licensed
  ixartz/Next-js-Boilerplate template (see "Design template & licence"
  below): sticky header with active-page navigation, a hero-led home
  page, and card-based calculator pages in a deep-green brand palette.

## The April 2026 SSP rules implemented

- Weekly SSP = the **lower of £123.25/week or 80% of average weekly earnings**.
- Payable from the **first full day of sickness** — no waiting days.
- **No lower earnings limit.**
- Daily rate = weekly amount ÷ qualifying days in the employee's week.
- Maximum 28 weeks per period of incapacity; spells 8 weeks or less apart
  are linked and share the 28-week entitlement.

Rates are dated "April 2026 rules" in `src/lib/rates.ts` and must be
**re-verified against GOV.UK before launch**.

## Run it

```bash
npm install
npm run dev        # local dev server
npm run build      # production build (must pass clean)
npm run verify:ssp # hand-computed maths checks for the SSP calculator
npm run verify:notice # hand-computed maths checks for the notice calculator
npm run verify:prorata # hand-computed maths checks for the pro-rata calculator
npm run verify:employer-ni # hand-computed maths checks for the employer NI calculator
```

## Design template & licence

The site's design foundation is **ixartz/Next-js-Boilerplate**
(https://github.com/ixartz/Next-js-Boilerplate), chosen by the owner and
verified MIT-licensed (its LICENSE file was read on 2026-11-07; a copy
ships in this project root as `LICENSE`, and the footer carries a credit
line). The template runs the same stack as this project (Next.js 16.4 +
React 19 + TypeScript + Tailwind CSS v4), so its foundation was adopted
without a framework change:

- **Taken from the template:** the project layout conventions
  (`src/templates/`, `src/utils/`, `src/styles/`); the `BaseTemplate`
  shell pattern (navigation passed in as props around header / main /
  footer) rebuilt as `src/templates/BaseTemplate.tsx`; the centralised
  `AppConfig` site-config convention (`src/utils/AppConfig.ts`); and
  Tailwind v4 CSS-first theme tokens in `src/styles/global.css`.
- **Palette:** one accent colour — deep green (Tailwind emerald scale,
  exposed as `brand-*` theme tokens) — on white/slate, applied to the
  header, buttons, cards, links and calculator results. Inter is the
  site font. The polish target was the nextjs/saas-starter demo look:
  clean light background, strong hero, rounded cards with subtle
  borders/shadows.
- **Stripped (not used):** Clerk authentication, next-intl i18n /
  Crowdin, Sentry, Arcjet, Drizzle ORM / database, Storybook, Playwright
  / Vitest wiring, sponsors and demo content. The finished site builds
  with `npm run build` with no environment variables and no external
  services; all four calculators' content, routes, metadata, FAQs and
  JSON-LD are unchanged — only the visual shell was upgraded.

## What remains

1. **GitHub repo + Vercel project** and deployment (not yet created).
2. **GOV.UK rate re-verification at launch** (SSP £123.25 / 80% rule,
   SMP £187.18, redundancy caps £751 / £22,530, Employment Allowance £10,500)
   — plus the **employer NI 2026/27 rates**, which are currently the
   2025/26 figures (15% / £5,000 threshold / £50,270 young-worker
   threshold) recorded in `rates.ts` under a re-verify flag.
3. Later phases from the research record: maternity/paternity (long-tail
   pages), redundancy and holiday support pages, and the take-home pay
   long-tail attack — in that order, and only after launch traction.

Research record: `~/workspace/goals/uk-statutory-sick-pay-hub-keyword-research-and-build-decision/files/ssp-hub-full-research-2026-11-06.md`
