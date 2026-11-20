/**
 * Hand-computed verification of the Tax-Free Childcare maths.
 *
 * Run with:  npm run verify:childcare
 *
 * Every expected figure below was worked out by hand from the
 * GOV.UK scheme rules (verified 20 Nov 2026): the government adds
 * £2 for every £8 paid in — 20% of the bill — capped at £500 per
 * child per 3 months (£2,000 a year), doubled to £1,000 / £4,000
 * for a disabled child; each parent's adjusted net income must be
 * £100,000 or less; minimum earnings at April 2026 NMW (21+) are
 * £12.71 × 16h × 13 weeks = £2,643.68 per quarter. The period
 * conversion cases pin the page's weekly/quarterly bill entry:
 * a quarter holds 13 weeks, so a £250 weekly bill is £3,250 a
 * quarter. Exits non-zero if any figure disagrees.
 */
import {
  calculateChildcare,
  costToMonthly,
  type ChildcareInput,
} from "../src/lib/childcare.ts";

let failures = 0;

function check(
  caseName: string,
  field: string,
  actual: number | boolean,
  expected: number | boolean,
  tolerance = 0.001,
) {
  const ok =
    typeof expected === "boolean"
      ? actual === expected
      : Math.abs(Number(actual) - expected) <= tolerance;
  if (!ok) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const base: Omit<ChildcareInput, "children"> = {
  household: "couple",
  parent1Income: 35000,
  parent2Income: 30000,
  parentAgeBand: "21+",
};

// Case 1 — the £8 → £2 ratio itself: a £100/month bill is £300 a
// quarter; 20% is £60 of top-up on a £240 deposit (30 × £8 → 30 × £2).
{
  const r = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 100, disabled: false }],
  });
  const c = r.perChild[0];
  check("ratio", "quarterlyBill", c.quarterlyBill, 300);
  check("ratio", "quarterlyTopUp", c.quarterlyTopUp, 60);
  check("ratio", "quarterlyDeposit", c.quarterlyDeposit, 240);
  check("ratio", "annualTopUp", c.annualTopUp, 240);
  check("ratio", "unusedQuarterlyTopUp", c.unusedQuarterlyTopUp, 440);
}

// Case 2 — the page's worked example: £1,000/month is £3,000 a
// quarter; 20% would be £600, so the £500 cap binds. £2,000 a year.
{
  const r = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 1000, disabled: false }],
  });
  const c = r.perChild[0];
  check("cap", "quarterlyBill", c.quarterlyBill, 3000);
  check("cap", "quarterlyTopUp", c.quarterlyTopUp, 500);
  check("cap", "quarterlyDeposit", c.quarterlyDeposit, 2500);
  check("cap", "annualTopUp", c.annualTopUp, 2000);
  check("cap", "annualBill", c.annualBill, 12000);
  check("cap", "capPerQuarter", c.capPerQuarter, 500);
  check("cap", "totalAnnualTopUp", r.totalAnnualTopUp, 2000);
  check("cap", "effectiveMonthlyCost", r.effectiveMonthlyCost, 833.33);
}

// Case 3 — weekly entry: £250/week × 13 weeks = £3,250 a quarter,
// so the £500 cap binds exactly as in Case 2. £100/week is £1,300
// a quarter → £260 of top-up, under the cap.
{
  check("weekly", "costToMonthly(250)", costToMonthly(250, "weekly"), 3250 / 3);
  const r = calculateChildcare({
    ...base,
    children: [
      { monthlyCost: costToMonthly(250, "weekly"), disabled: false },
    ],
  });
  check("weekly", "quarterlyBill", r.perChild[0].quarterlyBill, 3250);
  check("weekly", "quarterlyTopUp", r.perChild[0].quarterlyTopUp, 500);
  const r2 = calculateChildcare({
    ...base,
    children: [
      { monthlyCost: costToMonthly(100, "weekly"), disabled: false },
    ],
  });
  check("weekly-small", "quarterlyBill", r2.perChild[0].quarterlyBill, 1300);
  check("weekly-small", "quarterlyTopUp", r2.perChild[0].quarterlyTopUp, 260);
}

// Case 4 — quarterly and monthly entry: £2,400 per quarter is £800
// a month → £2,400 quarterly bill → £480 top-up. Monthly passes
// through untouched.
{
  check("quarterly", "costToMonthly(2400)", costToMonthly(2400, "quarterly"), 800);
  check("monthly", "costToMonthly(750)", costToMonthly(750, "monthly"), 750);
  const r = calculateChildcare({
    ...base,
    children: [
      { monthlyCost: costToMonthly(2400, "quarterly"), disabled: false },
    ],
  });
  check("quarterly", "quarterlyBill", r.perChild[0].quarterlyBill, 2400);
  check("quarterly", "quarterlyTopUp", r.perChild[0].quarterlyTopUp, 480);
}

// Case 5 — tracker arithmetic: one child at the cap every quarter
// uses 4 × £500 = £2,000 of the £2,000 the year offers.
{
  const r = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 1000, disabled: false }],
  });
  const yearCap = r.perChild.reduce((s, c) => s + c.capPerQuarter, 0) * 4;
  check("tracker", "totalQuarterlyTopUp", r.totalQuarterlyTopUp, 500);
  check("tracker", "4 quarters of top-up", r.totalQuarterlyTopUp * 4, 2000);
  check("tracker", "yearCap", yearCap, 2000);
  check("tracker", "annualTopUp equals yearCap", r.totalAnnualTopUp, yearCap);
}

// Case 6 — disabled child: the cap doubles. £1,000/month earns the
// full uncapped £600 a quarter; £2,000/month hits the £1,000 cap
// and reaches £4,000 a year.
{
  const r = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 1000, disabled: true }],
  });
  check("disabled", "quarterlyTopUp", r.perChild[0].quarterlyTopUp, 600);
  check("disabled", "capPerQuarter", r.perChild[0].capPerQuarter, 1000);
  const r2 = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 2000, disabled: true }],
  });
  check("disabled-cap", "quarterlyTopUp", r2.perChild[0].quarterlyTopUp, 1000);
  check("disabled-cap", "annualTopUp", r2.perChild[0].annualTopUp, 4000);
}

// Case 7 — two children: £500 (capped) + £480 = £980 a quarter,
// £3,920 a year.
{
  const r = calculateChildcare({
    ...base,
    children: [
      { monthlyCost: 1000, disabled: false },
      { monthlyCost: 800, disabled: false },
    ],
  });
  check("two-children", "totalQuarterlyTopUp", r.totalQuarterlyTopUp, 980);
  check("two-children", "totalAnnualTopUp", r.totalAnnualTopUp, 3920);
  check("two-children", "totalMonthlyBill", r.totalMonthlyBill, 1800);
}

// Case 8 — eligibility: minimum earnings at 21+ are £2,643.68 a
// quarter; £100,001 for either parent stops the whole claim; a
// £5,000 income is above zero but below the minimum-earnings line.
{
  const r = calculateChildcare({
    ...base,
    children: [{ monthlyCost: 1000, disabled: false }],
  });
  check("eligibility", "minimumEarningsPerQuarter", r.minimumEarningsPerQuarter, 2643.68);
  check("eligibility", "eligible", r.eligible, true);
  check("eligibility", "overIncomeLimit", r.overIncomeLimit, false);
  const over = calculateChildcare({
    ...base,
    parent2Income: 100001,
    children: [{ monthlyCost: 1000, disabled: false }],
  });
  check("eligibility-over", "overIncomeLimit", over.overIncomeLimit, true);
  check("eligibility-over", "eligible", over.eligible, false);
  const low = calculateChildcare({
    household: "single",
    parent1Income: 5000,
    parent2Income: 0,
    parentAgeBand: "21+",
    children: [{ monthlyCost: 1000, disabled: false }],
  });
  check("eligibility-low", "belowMinimumEarnings", low.belowMinimumEarnings, true);
}

if (failures > 0) {
  console.error(`verify:childcare — ${failures} check(s) failed`);
  process.exit(1);
}
console.log("verify:childcare — all checks passed");
