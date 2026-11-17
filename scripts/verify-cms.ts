/**
 * Hand-computed verification of the CMS (Child Maintenance Service)
 * calculator maths.
 *
 * Run with:  npm run verify:cms
 *
 * The first six cases are the worked examples in the verified rates
 * file (cms-rates-verification-2026-11-14: GOV.UK +
 * legislation.gov.uk, Child Support Act 1991 Sch 1). The rest are
 * boundary checks worked out by hand from the same sources, including
 * SI 2012/2677 regulation 43 for the reduced rate. Exits non-zero if
 * any figure disagrees.
 */
import { calculateCms, type CmsInput } from "../src/lib/cms.ts";

let failures = 0;

function check(name: string, input: CmsInput, expectedWeekly: number) {
  const actual = calculateCms(input).weekly;
  if (Math.abs(actual - expectedWeekly) < 0.005) {
    console.log(`ok   ${name}: £${actual}/week`);
  } else {
    failures++;
    console.error(`FAIL ${name}: got £${actual}/week, expected £${expectedWeekly}`);
  }
}

const base: CmsInput = {
  grossWeeklyIncome: 0,
  qualifyingChildren: 1,
  otherChildren: 0,
  receivesBenefits: false,
  sharedCareNights: 0,
  collectAndPay: false,
};

// --- Worked examples from the verified rates file (14 Nov 2026) ---
// £500/wk, 1 child: 12% × £500 = £60
check("£500/wk, 1 child", { ...base, grossWeeklyIncome: 500 }, 60);
// £500/wk, 2 children: 16% × £500 = £80
check(
  "£500/wk, 2 children",
  { ...base, grossWeeklyIncome: 500, qualifyingChildren: 2 },
  80,
);
// £1,000/wk, 1 child: 12% × £800 + 9% × £200 = £96 + £18 = £114
check("£1,000/wk, 1 child", { ...base, grossWeeklyIncome: 1000 }, 114);
// £50/wk: flat rate £7
check("£50/wk flat rate", { ...base, grossWeeklyIncome: 50 }, 7);
// £5/wk: nil rate £0
check("£5/wk nil rate", { ...base, grossWeeklyIncome: 5 }, 0);
// £500/wk, 1 child, 52–103 shared-care nights: £60 × (1 − 1/7) ≈ £51.43
check(
  "£500/wk, 1 child, 80 shared-care nights",
  { ...base, grossWeeklyIncome: 500, sharedCareNights: 80 },
  51.43,
);

// --- Boundary checks from the legislation (hand-computed) ---
// £1,000/wk, 2 children: 16% × £800 + 12% × £200 = £128 + £24 = £152
check(
  "£1,000/wk, 2 children",
  { ...base, grossWeeklyIncome: 1000, qualifyingChildren: 2 },
  152,
);
// £200/wk exactly, 3+ children: 19% × £200 = £38 (basic starts at £200)
check(
  "£200/wk, 3 children",
  { ...base, grossWeeklyIncome: 200, qualifyingChildren: 3 },
  38,
);
// Reduced rate, £150/wk, 1 child, 0 other: £7 + 17% × £50 = £15.50
check("£150/wk reduced, 1 child", { ...base, grossWeeklyIncome: 150 }, 15.5);
// Reduced rate, £150/wk, 2 children, 1 other: £7 + 21.2% × £50 = £17.60
check(
  "£150/wk reduced, 2 children, 1 other",
  {
    ...base,
    grossWeeklyIncome: 150,
    qualifyingChildren: 2,
    otherChildren: 1,
  },
  17.6,
);
// Reduced rate meets basic at £200: £199.99, 1 child: £7 + 17% × £99.99 ≈ £24
check(
  "£199.99/wk reduced, 1 child",
  { ...base, grossWeeklyIncome: 199.99 },
  24,
);
// Other children, basic: £500, 1 child, 1 other: income −11% = £445; 12% = £53.40
check(
  "£500/wk, 1 child, 1 other child",
  { ...base, grossWeeklyIncome: 500, otherChildren: 1 },
  53.4,
);
// Other children above £800: £1,000, 2 children, 2 others: −14% = £860;
// 16% × £800 + 12% × £60 = £128 + £7.20 = £135.20
check(
  "£1,000/wk, 2 children, 2 others",
  {
    ...base,
    grossWeeklyIncome: 1000,
    qualifyingChildren: 2,
    otherChildren: 2,
  },
  135.2,
);
// Shared care 175+ nights: £500, 2 children: £80 → half = £40 − £14 = £26
check(
  "£500/wk, 2 children, 200 nights",
  { ...base, grossWeeklyIncome: 500, qualifyingChildren: 2, sharedCareNights: 200 },
  26,
);
// Shared-care floor: £200, 1 child, 175+ nights: £24 → £12 − £7 = £5 → £7 floor
check(
  "£200/wk, 1 child, 175 nights (floor)",
  { ...base, grossWeeklyIncome: 200, sharedCareNights: 175 },
  7,
);
// Benefits: flat £7 at any income; £0 with 52+ shared-care nights
check(
  "benefits, £300/wk",
  { ...base, grossWeeklyIncome: 300, receivesBenefits: true },
  7,
);
check(
  "benefits, £300/wk, 60 nights",
  { ...base, grossWeeklyIncome: 300, receivesBenefits: true, sharedCareNights: 60 },
  0,
);
// Income cap: £4,000/wk, 1 child → treated as £3,000:
// 12% × £800 + 9% × £2,200 = £96 + £198 = £294
check("£4,000/wk capped, 1 child", { ...base, grossWeeklyIncome: 4000 }, 294);

// Collect & Pay on £60/week: payer pays £72.00, receiver gets £57.60
{
  const r = calculateCms({
    ...base,
    grossWeeklyIncome: 500,
    collectAndPay: true,
  });
  const payer = r.collectAndPayPayerWeekly ?? -1;
  const receiver = r.collectAndPayReceiverWeekly ?? -1;
  if (Math.abs(payer - 72) < 0.005 && Math.abs(receiver - 57.6) < 0.005) {
    console.log(`ok   Collect & Pay on £60: payer £${payer}, receiver £${receiver}`);
  } else {
    failures++;
    console.error(
      `FAIL Collect & Pay: payer £${payer}, receiver £${receiver} (expected 72 / 57.6)`,
    );
  }
}

// Monthly/annual conversions on £60/week: £260.00 / £3,120.00
{
  const r = calculateCms({ ...base, grossWeeklyIncome: 500 });
  if (Math.abs(r.monthly - 260) < 0.005 && Math.abs(r.annual - 3120) < 0.005) {
    console.log(`ok   £60/week conversions: £${r.monthly}/month, £${r.annual}/year`);
  } else {
    failures++;
    console.error(
      `FAIL conversions: £${r.monthly}/month, £${r.annual}/year (expected 260 / 3120)`,
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll CMS checks passed");
