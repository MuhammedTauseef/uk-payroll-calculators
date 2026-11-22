/**
 * Verification of the teacher-pay take-home engine.
 *
 * Run with:  node scripts/verify-teacher-pay.ts
 *
 * Benchmarks: the published 2026/27 take-home table for every
 * main/upper pay point in all four regions (full-time, tax code
 * 1257L, TPS member, no student loan), cross-checked between two
 * independent published calculators that both build on the STPCD
 * 2026 scales — the engine must reproduce every monthly figure
 * to the penny. Plus hand-computed cases for part-time, a TLR
 * payment, a Plan 2 loan, and the line-by-line worked example
 * (M1: pension £2,521.11, tax £3,795.58, NI £1,719.92).
 */
import {
  calculateTeacherPay,
  pointSalary,
  type RegionId,
} from "../src/lib/teacher-pay.ts";

let failures = 0;

function expect(name: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) < 0.015) {
    console.log(`ok   ${name}: ${actual}`);
  } else {
    failures++;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected}`);
  }
}

// Published monthly take-home, 2026/27: [point, rest, fringe, outer, inner]
const BENCH: [string, number, number, number, number][] = [
  ["M1", 2169.37, 2253.78, 2412.5, 2549.45],
  ["M2", 2278.01, 2328.75, 2523.33, 2656.72],
  ["M3", 2369.46, 2454.83, 2639.96, 2768.85],
  ["M4", 2506.84, 2591.84, 2762.69, 2886.39],
  ["M5", 2646.77, 2730.08, 2912.18, 3000.84],
  ["M6", 2831.19, 2914.4, 3092.82, 3203.2],
  ["U1", 2917.06, 2998.45, 3198.29, 3449.7],
  ["U2", 3017.78, 3104.56, 3311.29, 3575.98],
  ["U3", 3127.51, 3214.71, 3383.79, 3666.59],
];
const REGIONS: RegionId[] = ["rest", "fringe", "outer", "inner"];

for (const [point, ...expected] of BENCH) {
  const scale = point.startsWith("M") ? "main" : "upper";
  REGIONS.forEach((region, i) => {
    const salary = pointSalary("2026-27", scale, point, region);
    const r = calculateTeacherPay({
      year: "2026-27",
      fteSalary: salary,
      fteFraction: 1,
      tlrAnnual: 0,
      senAnnual: 0,
      pensionMember: true,
      avcMonthly: 0,
      taxCode: "1257L",
      loanPlan: "none",
      postgraduateLoan: false,
    });
    expect(`${point} ${region} net monthly`, r.netMonthly, expected[i]);
  });
}

// Worked example, line by line: M1 Rest of England, full-time.
const m1 = calculateTeacherPay({
  year: "2026-27",
  fteSalary: 34069,
  fteFraction: 1,
  tlrAnnual: 0,
  senAnnual: 0,
  pensionMember: true,
  avcMonthly: 0,
  taxCode: "1257L",
  loanPlan: "none",
  postgraduateLoan: false,
});
expect("M1 pension", m1.pensionAnnual, 2521.11);
expect("M1 tax", m1.incomeTaxAnnual, 3795.58);
expect("M1 NI", m1.niAnnual, 1719.92);
expect("M1 net annual", m1.netAnnual, 26032.39);
expect("M1 employer pension", m1.employerPensionAnnual, 9770.99);
expect("M1 CARE accrual", m1.careAccrualAnnual, 597.7);

// Part-time: M3 Rest at 0.6 FTE — tier set on actual pay (7.4%).
const pt = calculateTeacherPay({
  year: "2026-27",
  fteSalary: 38400,
  fteFraction: 0.6,
  tlrAnnual: 0,
  senAnnual: 0,
  pensionMember: true,
  avcMonthly: 0,
  taxCode: "1257L",
  loanPlan: "none",
  postgraduateLoan: false,
});
expect("PT gross", pt.grossAnnual, 23040);
expect("PT pension rate", pt.pensionRate, 0.074);
expect("PT net annual", pt.netAnnual, 18744.43);

// TLR: M6 Rest + £5,000 TLR2, full-time — tier rises to 9.9%.
const tlr = calculateTeacherPay({
  year: "2026-27",
  fteSalary: 46940,
  fteFraction: 1,
  tlrAnnual: 5000,
  senAnnual: 0,
  pensionMember: true,
  avcMonthly: 0,
  taxCode: "1257L",
  loanPlan: "none",
  postgraduateLoan: false,
});
expect("TLR gross", tlr.grossAnnual, 51940);
expect("TLR net annual", tlr.netAnnual, 36902.95);

// Plan 2 loan: U1 Rest, full-time, 2026/27 threshold £29,385.
const loan = calculateTeacherPay({
  year: "2026-27",
  fteSalary: 49134,
  fteFraction: 1,
  tlrAnnual: 0,
  senAnnual: 0,
  pensionMember: true,
  avcMonthly: 0,
  taxCode: "1257L",
  loanPlan: "plan2",
  postgraduateLoan: false,
});
expect("Plan2 deduction", loan.studentLoanAnnual, 1777.41);
expect("Plan2 net annual", loan.netAnnual, 33227.25);

// 2025/26 scale sanity: M1 Rest £32,916 — hand-computed.
// TPS 7.4% = 2,435.78; taxable 30,480.22 − 12,570 = 17,910.22 ×20% = 3,582.04;
// NI (32,916−12,570) ×8% = 1,627.68; net = 32,916 − 2,435.78 − 3,582.04 − 1,627.68 = 25,270.50.
const last = calculateTeacherPay({
  year: "2025-26",
  fteSalary: 32916,
  fteFraction: 1,
  tlrAnnual: 0,
  senAnnual: 0,
  pensionMember: true,
  avcMonthly: 0,
  taxCode: "1257L",
  loanPlan: "none",
  postgraduateLoan: false,
});
expect("2025/26 M1 net annual", last.netAnnual, 25270.5);

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll teacher-pay checks passed.");
