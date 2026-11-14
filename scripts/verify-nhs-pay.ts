/**
 * Hand-computed verification of the NHS pay calculator maths.
 *
 * Run with:  npm run verify:nhs-pay
 *
 * Pay figures are the official Agenda for Change 2025/26 (England)
 * values from NHS Employers; the pension tiers are the NHSBSA 2025/26
 * member rates. Case 1 was worked out by hand first:
 *   Band 5 entry: £31,049. Pension 8.3% × 31,049 = £2,577.07.
 *   Taxable pay 31,049 − 2,577.07 = £28,471.93; less the £12,570
 *   personal allowance = £15,901.93 at 20% = £3,180.39.
 *   NI: (31,049 − 12,570) × 8% = £1,478.32.
 *   Net: 31,049 − 2,577.07 − 3,180.39 − 1,478.32 = £23,813.23/yr.
 * Exits non-zero if any figure disagrees.
 */
import {
  calculateNhsPay,
  nhsPensionRateFor,
} from "../src/lib/nhs-pay.ts";

let failures = 0;

function check(name: string, actual: number, expected: number) {
  const ok = Math.abs(actual - expected) < 0.005;
  if (!ok) {
    failures++;
    console.error(`FAIL ${name}: got ${actual}, expected ${expected}`);
  } else {
    console.log(`ok   ${name}: ${actual}`);
  }
}

// Pension tier boundaries (NHSBSA 2025/26).
check("tier £13,259", nhsPensionRateFor(13259), 5.2);
check("tier £13,260", nhsPensionRateFor(13260), 6.5);
check("tier £31,049", nhsPensionRateFor(31049), 8.3);
check("tier £33,869", nhsPensionRateFor(33869), 9.8);
check("tier £65,190", nhsPensionRateFor(65190), 10.7);
check("tier £65,191", nhsPensionRateFor(65191), 12.5);

// Case 1 — Band 5 entry, full time, 8.3% pension (hand maths above).
const c1 = calculateNhsPay({
  bandIndex: 3, // Band 5
  stepIndex: 0,
  hoursPerWeek: 37.5,
  pensionRatePercent: 8.3,
});
check("B5 entry gross/yr", c1.grossAnnual, 31049);
check("B5 entry gross/mo", c1.grossMonthly, 2587.42);
check("B5 entry gross/wk", c1.grossWeekly, 597.1);
check("B5 entry hourly (official)", c1.hourlyRate, 15.88);
check("B5 entry pension/yr", c1.pensionAnnual, 2577.07);
check("B5 entry tax/yr", c1.incomeTax, 3180.39);
check("B5 entry NI/yr", c1.employeeNationalInsurance, 1478.32);
check("B5 entry net/yr", c1.netAnnual, 23813.23);
check("B5 entry net/mo", c1.netMonthly, 1984.44);

// Case 2 — Band 2 spot rate, full time: one step, £24,465, £12.51/hr.
const c2 = calculateNhsPay({
  bandIndex: 0, // Band 2
  stepIndex: 0,
  hoursPerWeek: 37.5,
  pensionRatePercent: 6.5,
});
check("B2 gross/yr", c2.grossAnnual, 24465);
check("B2 hourly (official)", c2.hourlyRate, 12.51);
check("B2 full-time annual", c2.fullTimeAnnual, 24465);

// Case 3 — Band 7 top at 30 hours (0.8 FTE): 54,710 × 0.8 = £43,768.
const c3 = calculateNhsPay({
  bandIndex: 5, // Band 7
  stepIndex: 2,
  hoursPerWeek: 30,
  pensionRatePercent: 9.8,
});
check("B7 top 30h gross/yr", c3.grossAnnual, 43768);
check("B7 top 30h gross/mo", c3.grossMonthly, 3647.33);
check("B7 top hourly (official)", c3.hourlyRate, 27.98);
check("B7 top full-time annual", c3.fullTimeAnnual, 54710);

// Case 4 — Band 9 top, full time: top of the whole scale.
const c4 = calculateNhsPay({
  bandIndex: 10, // Band 9
  stepIndex: 2,
  hoursPerWeek: 37.5,
  pensionRatePercent: 12.5,
});
check("B9 top gross/yr", c4.grossAnnual, 125637);
check("B9 top hourly (official)", c4.hourlyRate, 64.25);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll NHS pay checks passed");
