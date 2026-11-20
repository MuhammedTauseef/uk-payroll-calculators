/**
 * Hand-computed verification of the pay rise maths.
 *
 * Run with:  npm run verify:pay-rise
 *
 * Every expected figure below was worked out by hand first
 * (research notes: research-2tools-2026-11-20) from the 2026/27
 * PAYE bands — Personal Allowance £12,570 (tapering £1 per £2 over
 * £100,000), 20% on the first £37,700 of taxable income, 40% above
 * that to £125,140, 45% beyond; employee NI 8% from £12,570 to
 * £50,270 and 2% above; Plan 2 student loan 9% above £29,385.
 * The cross-check case also asserts that with no pension and no
 * student loan the result equals the take-home calculator's net to
 * the penny — the two tools share one set of tax helpers, and this
 * is the proof. Exits non-zero if any figure disagrees.
 */
import { calculatePayRise } from "../src/lib/pay-rise.ts";
import { calculateTakeHome } from "../src/lib/takehome.ts";

let failures = 0;

function check(
  caseName: string,
  field: string,
  actual: number | null,
  expected: number,
  tolerance = 0.001,
) {
  if (actual === null || Math.abs(actual - expected) > tolerance) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

const base = {
  risePercent: 0,
  riseAmount: 0,
  targetSalary: 0,
  hoursPerWeek: 37.5,
  pensionPercent: 0,
  studentLoanPlan: null,
  postgraduateLoanToo: false,
} as const;

// Cross-check — plain case must equal the take-home calculator.
// £40,000: tax (40,000 − 12,570) × 20% = £5,486.00; NI 27,430 × 8%
// = £2,194.40; net £32,319.60. £42,000: tax £5,886.00, NI
// £2,354.40, net £33,759.60.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 40000,
    mode: "percent",
    risePercent: 5,
  });
  check("cross-check", "net at £40,000", r.currentNetAnnual, 32319.6, 0.02);
  check("cross-check", "net at £42,000", r.newNetAnnual, 33759.6, 0.02);
  check(
    "cross-check",
    "takehome lib £40,000",
    calculateTakeHome({ annualSalary: 40000 }).netAnnual,
    32319.6,
  );
  check(
    "cross-check",
    "takehome lib £42,000",
    calculateTakeHome({ annualSalary: 42000 }).netAnnual,
    33759.6,
  );
}

// Case A — percentage: £40,000 + 5% → £42,000. The whole rise sits
// in the basic band, so it keeps 72%: net rise £1,440.00 a year,
// £120.00 a month; extra tax £400.00, extra NI £160.00.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 40000,
    mode: "percent",
    risePercent: 5,
  });
  check("A percent", "new gross", r.newGrossAnnual, 42000);
  check("A percent", "gross rise", r.grossRiseAnnual, 2000);
  check("A percent", "gross rise monthly", r.grossRiseMonthly, 166.67);
  check("A percent", "gross rise weekly", r.grossRiseWeekly, 38.46);
  check("A percent", "gross rise hourly", r.grossRiseHourly, 1.03);
  check("A percent", "implied percent", r.impliedRisePercent, 5);
  check("A percent", "net rise", r.netRiseAnnual, 1440, 0.02);
  check("A percent", "net rise monthly", r.netRiseMonthly, 120, 0.02);
  check("A percent", "keep percent", r.keepPercent, 72);
  check("A percent", "extra tax", r.extraIncomeTax, 400, 0.02);
  check("A percent", "extra NI", r.extraNationalInsurance, 160, 0.02);
}

// Case B — amount: £35,000 + £3,000 → £38,000 (8.57%). Nets
// £28,719.60 → £30,879.60; net rise £2,160.00, again 72%.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 35000,
    mode: "amount",
    riseAmount: 3000,
  });
  check("B amount", "new gross", r.newGrossAnnual, 38000);
  check("B amount", "implied percent", r.impliedRisePercent, 8.57);
  check("B amount", "net before", r.currentNetAnnual, 28719.6, 0.02);
  check("B amount", "net after", r.newNetAnnual, 30879.6, 0.02);
  check("B amount", "net rise", r.netRiseAnnual, 2160, 0.02);
  check("B amount", "keep percent", r.keepPercent, 72);
}

// Case C — target, the £100,000 trap: £98,000 → £105,000. The
// Personal Allowance falls £12,570 → £10,070; nets £67,397.40 →
// £70,457.40; of the £7,000 rise only £3,060.00 (43.71%) survives;
// extra tax £3,800.00, extra NI £140.00.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 98000,
    mode: "target",
    targetSalary: 105000,
  });
  check("C trap", "allowance before", r.personalAllowanceBefore, 12570);
  check("C trap", "allowance after", r.personalAllowanceAfter, 10070);
  check("C trap", "net before", r.currentNetAnnual, 67397.4, 0.02);
  check("C trap", "net after", r.newNetAnnual, 70457.4, 0.02);
  check("C trap", "net rise", r.netRiseAnnual, 3060, 0.02);
  check("C trap", "keep percent", r.keepPercent, 43.71);
  check("C trap", "extra tax", r.extraIncomeTax, 3800, 0.02);
  check("C trap", "extra NI", r.extraNationalInsurance, 140, 0.02);
}

// Case D — pension + student loan: £50,000 + 4% → £52,000,
// pension 5% net-pay, Plan 2. NI at £50,000 is (50,000 − 12,570)
// × 8% = £2,994.40 (the main band is not yet full — an early
// hand draft of this case used £3,016 and the script caught it).
// Nets £35,663.44 → £36,947.24; net rise £1,283.80 (64.19%);
// extra pension £100.00, tax £380.00, NI £56.20, loan £180.00.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 50000,
    mode: "percent",
    risePercent: 4,
    pensionPercent: 5,
    studentLoanPlan: "plan2",
  });
  check("D pension+loan", "net before", r.currentNetAnnual, 35663.44, 0.02);
  check("D pension+loan", "net after", r.newNetAnnual, 36947.24, 0.02);
  check("D pension+loan", "net rise", r.netRiseAnnual, 1283.8, 0.02);
  check("D pension+loan", "keep percent", r.keepPercent, 64.19);
  check("D pension+loan", "extra pension", r.extraPension, 100, 0.02);
  check("D pension+loan", "extra tax", r.extraIncomeTax, 380, 0.02);
  check("D pension+loan", "extra NI", r.extraNationalInsurance, 56.2, 0.02);
  check("D pension+loan", "extra loan", r.extraStudentLoan, 180, 0.02);
}

// Case E — band crossing: £48,000 + 10% → £52,800. The rise
// straddles £50,270, so part is kept at 72% and part at 58%:
// nets £38,079.60 → £41,181.40; net rise £3,101.80 (64.62%);
// extra tax £1,466.00, extra NI £232.20.
{
  const r = calculatePayRise({
    ...base,
    currentSalary: 48000,
    mode: "percent",
    risePercent: 10,
  });
  check("E crossing", "new gross", r.newGrossAnnual, 52800);
  check("E crossing", "net before", r.currentNetAnnual, 38079.6, 0.02);
  check("E crossing", "net after", r.newNetAnnual, 41181.4, 0.02);
  check("E crossing", "net rise", r.netRiseAnnual, 3101.8, 0.02);
  check("E crossing", "keep percent", r.keepPercent, 64.62);
  check("E crossing", "extra tax", r.extraIncomeTax, 1466, 0.02);
  check("E crossing", "extra NI", r.extraNationalInsurance, 232.2, 0.02);
}

if (failures > 0) {
  console.error(`verify-pay-rise: ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify-pay-rise: all checks passed");
