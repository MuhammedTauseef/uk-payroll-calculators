/**
 * Hand-computed verification of the employer National Insurance maths.
 *
 * Run with:  npm run verify:employer-ni
 *
 * Rates used (2025/26 — re-verify against GOV.UK before launch; the
 * 2026/27 rates are not yet verified): employer rate 15%, Secondary
 * Threshold £5,000/yr, upper secondary threshold for under-21s and
 * apprentices under 25 £50,270/yr, Employment Allowance £10,500/yr.
 * Pension (cases 8–10, also 2025/26): auto-enrolment employer minimum
 * 3% of qualifying earnings, band £6,240–£50,270/yr.
 *
 * Each case below was worked out by hand from those figures first; the
 * script then checks calculateEmployerNi() against the expected results.
 * Exits non-zero if any figure disagrees.
 */
import { calculateEmployerNi } from "../src/lib/employerNi.ts";
import type { EmployerNiInput, EmployerNiResult } from "../src/lib/employerNi.ts";

interface Case {
  name: string;
  input: EmployerNiInput;
  expected: Pick<
    EmployerNiResult,
    | "thresholdApplied"
    | "earningsAboveThreshold"
    | "grossEmployerNi"
    | "employmentAllowanceApplied"
    | "employerNiPerYear"
    | "employerNiPerMonth"
    | "qualifyingEarningsForPension"
    | "employerPensionPerYear"
    | "employerPensionPerMonth"
    | "totalCostPerYear"
    | "totalCostPerMonth"
  >;
}

const NO_PENSION = {
  qualifyingEarningsForPension: 0,
  employerPensionPerYear: 0,
  employerPensionPerMonth: 0,
} as const;

const cases: Case[] = [
  {
    // Hand maths: (£30,000 − £5,000) × 15% = £25,000 × 15% = £3,750/yr;
    // ÷ 12 = £312.50/mo. Total cost £30,000 + £3,750 = £33,750/yr
    // (£2,812.50/mo). No Employment Allowance claimed, pension off.
    name: "Case 1 — £30,000 salary, standard, no allowance",
    input: {
      annualGrossSalary: 30000,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 25000,
      grossEmployerNi: 3750,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 3750,
      employerNiPerMonth: 312.5,
      ...NO_PENSION,
      totalCostPerYear: 33750,
      totalCostPerMonth: 2812.5,
    },
  },
  {
    // Hand maths: NICs before allowance are £3,750 (as Case 1). The
    // £10,500 allowance covers the whole bill: £3,750 − £3,750 = £0
    // (floored at £0, never negative). Total cost is the salary alone.
    name: "Case 2 — £30,000 salary, standard, with Employment Allowance (bill wiped out)",
    input: {
      annualGrossSalary: 30000,
      reducedRateCategory: false,
      employmentAllowanceEligible: true,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 25000,
      grossEmployerNi: 3750,
      employmentAllowanceApplied: 3750,
      employerNiPerYear: 0,
      employerNiPerMonth: 0,
      ...NO_PENSION,
      totalCostPerYear: 30000,
      totalCostPerMonth: 2500,
    },
  },
  {
    // Hand maths: (£60,000 − £5,000) × 15% = £55,000 × 15% = £8,250/yr;
    // ÷ 12 = £687.50/mo. Total cost £68,250/yr (£5,687.50/mo).
    name: "Case 3 — £60,000 salary, standard, no allowance",
    input: {
      annualGrossSalary: 60000,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 55000,
      grossEmployerNi: 8250,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 8250,
      employerNiPerMonth: 687.5,
      ...NO_PENSION,
      totalCostPerYear: 68250,
      totalCostPerMonth: 5687.5,
    },
  },
  {
    // Hand maths: (£100,000 − £5,000) × 15% = £95,000 × 15% = £14,250.
    // Allowance takes off the full £10,500: £14,250 − £10,500 = £3,750/yr
    // (£312.50/mo). Total cost £103,750/yr (£8,645.83/mo).
    name: "Case 4 — £100,000 salary, standard, with Employment Allowance (partial cover)",
    input: {
      annualGrossSalary: 100000,
      reducedRateCategory: false,
      employmentAllowanceEligible: true,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 95000,
      grossEmployerNi: 14250,
      employmentAllowanceApplied: 10500,
      employerNiPerYear: 3750,
      employerNiPerMonth: 312.5,
      ...NO_PENSION,
      totalCostPerYear: 103750,
      totalCostPerMonth: 8645.83,
    },
  },
  {
    // Hand maths: an under-21 salary of £40,000 is below the £50,270
    // upper secondary threshold, so the 0% band covers all of it:
    // earnings above threshold £0, NICs £0. Total cost = the salary.
    name: "Case 5 — £40,000 salary, under-21 category (fully inside the 0% band)",
    input: {
      annualGrossSalary: 40000,
      reducedRateCategory: true,
      employmentAllowanceEligible: false,
    },
    expected: {
      thresholdApplied: 50270,
      earningsAboveThreshold: 0,
      grossEmployerNi: 0,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 0,
      employerNiPerMonth: 0,
      ...NO_PENSION,
      totalCostPerYear: 40000,
      totalCostPerMonth: 3333.33,
    },
  },
  {
    // Hand maths: (£60,000 − £50,270) × 15% = £9,730 × 15% = £1,459.50/yr;
    // ÷ 12 = £121.63/mo (121.625 rounded). Total cost £61,459.50/yr
    // (£5,121.63/mo).
    name: "Case 6 — £60,000 salary, under-21 category (main rate above £50,270 only)",
    input: {
      annualGrossSalary: 60000,
      reducedRateCategory: true,
      employmentAllowanceEligible: false,
    },
    expected: {
      thresholdApplied: 50270,
      earningsAboveThreshold: 9730,
      grossEmployerNi: 1459.5,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 1459.5,
      employerNiPerMonth: 121.63,
      ...NO_PENSION,
      totalCostPerYear: 61459.5,
      totalCostPerMonth: 5121.63,
    },
  },
  {
    // Hand maths (edge): a £4,500 salary is below the £5,000 Secondary
    // Threshold, so nothing is charged: earnings above threshold £0,
    // NICs £0. Total cost = the salary (£375/mo).
    name: "Case 7 — £4,500 salary, standard (below the Secondary Threshold)",
    input: {
      annualGrossSalary: 4500,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 0,
      grossEmployerNi: 0,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 0,
      employerNiPerMonth: 0,
      ...NO_PENSION,
      totalCostPerYear: 4500,
      totalCostPerMonth: 375,
    },
  },
  {
    // Hand maths (pension on): NICs as Case 1 = £3,750/yr. Qualifying
    // earnings = £30,000 − £6,240 = £23,760; pension = £23,760 × 3% =
    // £712.80/yr (£59.40/mo). Total cost = £30,000 + £3,750 + £712.80 =
    // £34,462.80/yr (£2,871.90/mo).
    name: "Case 8 — £30,000 salary, standard, with employer pension (inside the band)",
    input: {
      annualGrossSalary: 30000,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
      includeEmployerPension: true,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 25000,
      grossEmployerNi: 3750,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 3750,
      employerNiPerMonth: 312.5,
      qualifyingEarningsForPension: 23760,
      employerPensionPerYear: 712.8,
      employerPensionPerMonth: 59.4,
      totalCostPerYear: 34462.8,
      totalCostPerMonth: 2871.9,
    },
  },
  {
    // Hand maths (pension on, band-capped): NICs as Case 3 = £8,250/yr.
    // Qualifying earnings are capped at the top of the band: £50,270 −
    // £6,240 = £44,030; pension = £44,030 × 3% = £1,320.90/yr
    // (£110.075/mo, shown as £110.07 with penny rounding). Total cost =
    // £60,000 + £8,250 + £1,320.90 = £69,570.90/yr (£5,797.58/mo).
    name: "Case 9 — £60,000 salary, standard, with employer pension (band-capped)",
    input: {
      annualGrossSalary: 60000,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
      includeEmployerPension: true,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 55000,
      grossEmployerNi: 8250,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 8250,
      employerNiPerMonth: 687.5,
      qualifyingEarningsForPension: 44030,
      employerPensionPerYear: 1320.9,
      employerPensionPerMonth: 110.07,
      totalCostPerYear: 69570.9,
      totalCostPerMonth: 5797.58,
    },
  },
  {
    // Hand maths (pension on, below the band): NICs = (£6,000 − £5,000)
    // × 15% = £150/yr (£12.50/mo). The £6,000 salary is below the
    // £6,240 bottom of the qualifying-earnings band, so qualifying
    // earnings are £0 and the pension is £0. Total = £6,150/yr.
    name: "Case 10 — £6,000 salary, standard, with employer pension (below the band)",
    input: {
      annualGrossSalary: 6000,
      reducedRateCategory: false,
      employmentAllowanceEligible: false,
      includeEmployerPension: true,
    },
    expected: {
      thresholdApplied: 5000,
      earningsAboveThreshold: 1000,
      grossEmployerNi: 150,
      employmentAllowanceApplied: 0,
      employerNiPerYear: 150,
      employerNiPerMonth: 12.5,
      qualifyingEarningsForPension: 0,
      employerPensionPerYear: 0,
      employerPensionPerMonth: 0,
      totalCostPerYear: 6150,
      totalCostPerMonth: 512.5,
    },
  },
];

let failures = 0;

for (const c of cases) {
  const actual = calculateEmployerNi(c.input);
  const keys = Object.keys(c.expected) as (keyof Case["expected"])[];
  const mismatches = keys.filter((k) => actual[k] !== c.expected[k]);
  if (mismatches.length === 0) {
    console.log(`PASS  ${c.name}`);
    console.log(
      `      NICs ${actual.employerNiPerYear}/yr (${actual.employerNiPerMonth}/mo), ` +
        `pension ${actual.employerPensionPerYear}/yr, ` +
        `total cost ${actual.totalCostPerYear}/yr`,
    );
  } else {
    failures++;
    console.log(`FAIL  ${c.name}`);
    for (const k of mismatches) {
      console.log(`      ${k}: expected ${c.expected[k]}, got ${actual[k]}`);
    }
  }
}

if (failures > 0) {
  console.log(`\n${failures} case(s) FAILED`);
  process.exit(1);
}
console.log("\nAll employer NI maths cases passed.");
