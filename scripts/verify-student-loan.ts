/**
 * Hand-computed verification of the student loan maths.
 *
 * Run with:  npm run verify:student-loan
 *
 * Thresholds and rates are GOV.UK's 2026/27 figures ("Repaying your
 * student loan — How much you repay", checked 17 November 2026):
 * Plan 1 £26,900 @ 9%, Plan 2 £29,385 @ 9%, Plan 4 £33,795 @ 9%,
 * Plan 5 £25,000 @ 9%, Postgraduate £21,000 @ 6%. One case below is
 * GOV.UK's own published example (Plan 1 on £42,000 of combined
 * income → £1,359 a year). Exits non-zero on any disagreement.
 */
import {
  calculateStudentLoan,
  type StudentLoanInput,
} from "../src/lib/student-loan.ts";

let failures = 0;

function check(
  name: string,
  input: StudentLoanInput,
  expected: { undergraduateAnnual?: number; postgraduateAnnual?: number; totalAnnual: number; totalMonthly: number },
) {
  const actual = calculateStudentLoan(input);
  const pairs: [string, number, number | undefined][] = [
    ["undergraduateAnnual", actual.undergraduateAnnual, expected.undergraduateAnnual],
    ["postgraduateAnnual", actual.postgraduateAnnual, expected.postgraduateAnnual],
    ["totalAnnual", actual.totalAnnual, expected.totalAnnual],
    ["totalMonthly", actual.totalMonthly, expected.totalMonthly],
  ];
  for (const [k, got, want] of pairs) {
    if (want === undefined) continue;
    if (Math.abs(got - want) < 0.005) {
      console.log(`ok   ${name} ${k}: ${got}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${got}, expected ${want}`);
    }
  }
}

// Plan 2 on £35,000: (£35,000 − £29,385) × 9% = £5,615 × 9% = £505.35
// a year; £505.35 ÷ 12 = £42.11 a month.
check(
  "Plan 2, £35,000",
  { annualIncome: 35000, undergraduatePlan: "plan2", hasPostgraduateLoan: false },
  { undergraduateAnnual: 505.35, postgraduateAnnual: 0, totalAnnual: 505.35, totalMonthly: 42.11 },
);

// GOV.UK's own example: Plan 1, combined income £42,000 →
// (£42,000 − £26,900) × 9% = £15,100 × 9% = £1,359 a year (£113.25/mo).
check(
  "Plan 1, £42,000 (GOV.UK example)",
  { annualIncome: 42000, undergraduatePlan: "plan1", hasPostgraduateLoan: false },
  { undergraduateAnnual: 1359, totalAnnual: 1359, totalMonthly: 113.25 },
);

// Postgraduate only, £40,000: (£40,000 − £21,000) × 6% = £1,140 a
// year; £95 a month.
check(
  "Postgraduate only, £40,000",
  { annualIncome: 40000, undergraduatePlan: null, hasPostgraduateLoan: true },
  { postgraduateAnnual: 1140, totalAnnual: 1140, totalMonthly: 95 },
);

// Both at once, £30,000: Plan 2 (£30,000 − £29,385) × 9% = £55.35
// PLUS Postgraduate (£30,000 − £21,000) × 6% = £540 → £595.35 a year.
check(
  "Plan 2 + Postgraduate, £30,000",
  { annualIncome: 30000, undergraduatePlan: "plan2", hasPostgraduateLoan: true },
  { undergraduateAnnual: 55.35, postgraduateAnnual: 540, totalAnnual: 595.35, totalMonthly: 49.61 },
);

// Below the threshold nothing is repaid: Plan 5 on £24,000.
check(
  "Plan 5, £24,000 (below threshold)",
  { annualIncome: 24000, undergraduatePlan: "plan5", hasPostgraduateLoan: false },
  { totalAnnual: 0, totalMonthly: 0 },
);

// Plan 4 on £36,000: (£36,000 − £33,795) × 9% = £2,205 × 9% = £198.45.
check(
  "Plan 4, £36,000",
  { annualIncome: 36000, undergraduatePlan: "plan4", hasPostgraduateLoan: false },
  { undergraduateAnnual: 198.45, totalAnnual: 198.45, totalMonthly: 16.54 },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll student loan checks passed");
