/**
 * Hand-computed verification of the Texas paycheck maths.
 *
 * Run with:  npm run verify:texas-paycheck
 *
 * Every case below was worked out by hand first from IRS sources
 * (re-read 9 November 2026):
 *   - Pub. 15-T (2026), Worksheet 1A + the STANDARD Percentage
 *     Method Tables for Automated Payroll Systems: annualise the
 *     taxable wages, subtract $12,900 (married filing jointly) or
 *     $8,600 (otherwise) for the Step 2 box not checked, apply the
 *     annual table, subtract Step 3 credits, divide by periods.
 *   - Pub. 15 (2026) / SSA: Social Security 6.2% up to the 2026
 *     wage base of $184,500; Medicare 1.45% on all wages plus 0.9%
 *     Additional Medicare Tax on wages over $200,000.
 *   - Texas has no state income tax: the state line is $0.
 * Money lines are rounded to the cent and totals are built from
 * the rounded lines (the house display rule).
 * Exits non-zero if any figure disagrees.
 */
import { calculateTexasPaycheck } from "../src/lib/texas-paycheck.ts";
import type { TexasPaycheckInput } from "../src/lib/texas-paycheck.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.005) {
    failures++;
    console.log(`FAIL ${label}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`ok   ${label}: ${actual}`);
  }
}

function runCase(
  name: string,
  input: TexasPaycheckInput,
  expected: Record<string, number>,
) {
  console.log(`\n— ${name}`);
  const r = calculateTexasPaycheck(input);
  for (const [key, value] of Object.entries(expected)) {
    check(key, (r as unknown as Record<string, number>)[key], value);
  }
}

// Case 1: $60,000 salary, single, biweekly, nothing else.
//   Adjusted wage = 60,000 − 8,600 = 51,400 → Single table:
//   1,240 + 12% × (51,400 − 19,900) = 1,240 + 3,780 = 5,020 a year.
//   SS 60,000 × 6.2% = 3,720; Medicare 60,000 × 1.45% = 870.
runCase(
  "Case 1 — $60,000, single, biweekly",
  {
    payType: "salary",
    annualSalary: 60000,
    hourlyRate: 0,
    hoursPerWeek: 0,
    frequency: "biweekly",
    filingStatus: "single",
    dependentCreditsAnnual: 0,
    preTaxPerPeriod: 0,
  },
  {
    grossAnnual: 60000,
    grossPerPeriod: 2307.69,
    federalAnnual: 5020,
    federalPerPeriod: 193.08,
    socialSecurityAnnual: 3720,
    socialSecurityPerPeriod: 143.08,
    medicareAnnual: 870,
    medicarePerPeriod: 33.46,
    statePerPeriod: 0,
    totalDeductionsPerPeriod: 369.62,
    netPerPeriod: 1938.07,
    totalDeductionsAnnual: 9610,
    netAnnual: 50390,
    effectiveTaxRatePercent: 16.02,
  },
);

// Case 2: $25/hour × 40 hours, single, weekly.
//   Gross = 25 × 40 × 52 = 52,000. Adjusted = 52,000 − 8,600 =
//   43,400 → 1,240 + 12% × 23,500 = 4,060 a year.
//   SS 3,224; Medicare 754.
runCase(
  "Case 2 — $25/hr × 40 hrs, single, weekly",
  {
    payType: "hourly",
    annualSalary: 0,
    hourlyRate: 25,
    hoursPerWeek: 40,
    frequency: "weekly",
    filingStatus: "single",
    dependentCreditsAnnual: 0,
    preTaxPerPeriod: 0,
  },
  {
    grossAnnual: 52000,
    grossPerPeriod: 1000,
    federalAnnual: 4060,
    federalPerPeriod: 78.08,
    socialSecurityAnnual: 3224,
    socialSecurityPerPeriod: 62,
    medicareAnnual: 754,
    medicarePerPeriod: 14.5,
    totalDeductionsPerPeriod: 154.58,
    netPerPeriod: 845.42,
    totalDeductionsAnnual: 8038,
    netAnnual: 43962,
    effectiveTaxRatePercent: 15.46,
  },
);

// Case 3: $120,000, married filing jointly, monthly, $2,000 of
//   Step 3 dependent credits.
//   Adjusted wage = 120,000 − 12,900 = 107,100 → MFJ table:
//   2,480 + 12% × (107,100 − 44,100) = 2,480 + 7,560 = 10,040;
//   less credits 2,000 → 8,040 a year → 670 a month.
//   SS 7,440; Medicare 1,740.
runCase(
  "Case 3 — $120,000, married, monthly, $2,000 credits",
  {
    payType: "salary",
    annualSalary: 120000,
    hourlyRate: 0,
    hoursPerWeek: 0,
    frequency: "monthly",
    filingStatus: "married",
    dependentCreditsAnnual: 2000,
    preTaxPerPeriod: 0,
  },
  {
    grossPerPeriod: 10000,
    federalAnnual: 8040,
    federalPerPeriod: 670,
    socialSecurityAnnual: 7440,
    socialSecurityPerPeriod: 620,
    medicareAnnual: 1740,
    medicarePerPeriod: 145,
    totalDeductionsPerPeriod: 1435,
    netPerPeriod: 8565,
    totalDeductionsAnnual: 17220,
    netAnnual: 102780,
    effectiveTaxRatePercent: 14.35,
  },
);

// Case 4: $250,000, single, monthly — the Social Security cap and
//   the Additional Medicare Tax both bite.
//   Adjusted wage = 250,000 − 8,600 = 241,400 → Single table:
//   41,024 + 32% × (241,400 − 209,275) = 41,024 + 10,280 = 51,304.
//   SS capped: 184,500 × 6.2% = 11,439.
//   Medicare: 250,000 × 1.45% + 50,000 × 0.9% = 3,625 + 450 = 4,075.
runCase(
  "Case 4 — $250,000, single, monthly (SS cap + extra Medicare)",
  {
    payType: "salary",
    annualSalary: 250000,
    hourlyRate: 0,
    hoursPerWeek: 0,
    frequency: "monthly",
    filingStatus: "single",
    dependentCreditsAnnual: 0,
    preTaxPerPeriod: 0,
  },
  {
    grossPerPeriod: 20833.33,
    federalAnnual: 51304,
    federalPerPeriod: 4275.33,
    socialSecurityAnnual: 11439,
    socialSecurityPerPeriod: 953.25,
    medicareAnnual: 4075,
    medicarePerPeriod: 339.58,
    totalDeductionsPerPeriod: 5568.16,
    netPerPeriod: 15265.17,
    totalDeductionsAnnual: 66818,
    netAnnual: 183182,
    effectiveTaxRatePercent: 26.73,
  },
);

// Case 5: $80,000, single, semimonthly, $200 a period into a
//   401(k). The 401(k) cuts the federal tax wages only:
//   taxable 80,000 − 4,800 = 75,200; adjusted 75,200 − 8,600 =
//   66,600 → 5,800 + 22% × (66,600 − 57,900) = 5,800 + 1,914 =
//   7,714. FICA still runs on the full 80,000: SS 4,960,
//   Medicare 1,160.
runCase(
  "Case 5 — $80,000, single, semimonthly, $200/period 401(k)",
  {
    payType: "salary",
    annualSalary: 80000,
    hourlyRate: 0,
    hoursPerWeek: 0,
    frequency: "semimonthly",
    filingStatus: "single",
    dependentCreditsAnnual: 0,
    preTaxPerPeriod: 200,
  },
  {
    grossPerPeriod: 3333.33,
    preTaxAnnual: 4800,
    federalAnnual: 7714,
    federalPerPeriod: 321.42,
    socialSecurityAnnual: 4960,
    socialSecurityPerPeriod: 206.67,
    medicareAnnual: 1160,
    medicarePerPeriod: 48.33,
    totalDeductionsPerPeriod: 776.42,
    netPerPeriod: 2556.91,
    totalDeductionsAnnual: 18634,
    netAnnual: 61366,
    effectiveTaxRatePercent: 17.29,
  },
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll Texas paycheck checks passed.");
