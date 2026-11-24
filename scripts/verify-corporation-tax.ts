/**
 * Hand-computed verification of the Corporation Tax engine, the
 * taxable-profit builder and the deadline dates.
 *
 * Run with:  npm run verify:corporation-tax
 *
 * Every expected figure below was worked by hand from the
 * 2026/27 rules (19% small profits rate to £50,000, 25% main
 * rate from £250,000, Marginal Relief (upper limit − profit) ×
 * 3/200 between the two, both limits divided by the number of
 * associated companies; pay 9 months and 1 day after the
 * accounting period ends, file the CT600 12 months after;
 * quarterly instalments over £1.5m of taxable profit) — the
 * rates and deadlines as published by GOV.UK ("Corporation Tax
 * rates, expenses and reliefs", "Marginal Relief for Corporation
 * Tax", "Company Tax Returns"), checked 23 November 2026 —
 * before the engines were run. Exits non-zero on any
 * disagreement.
 */
import {
  buildTaxableProfit,
  calculateCorporationTax,
  corporationTaxDates,
} from "../src/lib/corporation-tax.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  const ok = Math.abs(actual - expected) < 0.005;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function checkTol(
  label: string,
  actual: number,
  expected: number,
  tol: number,
) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ~${expected} (±${tol})`,
  );
}

function checkStr(label: string, actual: string, expected: string) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function checkTrue(label: string, cond: boolean) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
}

// Case 1 — the small profits band in full: £50,000 × 19% =
// £9,500, no relief, £40,500 left, £791.67 a month to set aside.
{
  console.log("\n--- Case 1: £50,000 (small profits) ---");
  const r = calculateCorporationTax({ profit: 50000 });
  check("tax", r.tax, 9500);
  check("marginal relief", r.marginalRelief, 0);
  check("profit after tax", r.profitAfterTax, 40500);
  check("effective rate %", r.effectiveRatePercent, 19);
  check("monthly set-aside", r.monthlySetAside, 791.67);
  checkStr("regime", r.regime, "small");
}

// Case 2 — GoFile's live-verified figure (23 Nov 2026): £80,000.
// 25% × £80,000 = £20,000, less (£250,000 − £80,000) × 3/200 =
// £2,550 of Marginal Relief = £17,450; effective 21.81%.
{
  console.log("\n--- Case 2: £80,000 (competitor cross-check) ---");
  const r = calculateCorporationTax({ profit: 80000 });
  check("tax", r.tax, 17450);
  check("marginal relief", r.marginalRelief, 2550);
  check("profit after tax", r.profitAfterTax, 62550);
  check("effective rate %", r.effectiveRatePercent, 21.81);
  check("monthly set-aside", r.monthlySetAside, 1454.17);
  checkStr("regime", r.regime, "marginal");
}

// Case 3 — ContractorCalculator's live-verified total (23 Nov
// 2026): £100,000 → £25,000 − (£150,000 × 3/200 = £2,250) =
// £22,750.
{
  console.log("\n--- Case 3: £100,000 (competitor cross-check) ---");
  const r = calculateCorporationTax({ profit: 100000 });
  check("tax", r.tax, 22750);
  check("marginal relief", r.marginalRelief, 2250);
  check("effective rate %", r.effectiveRatePercent, 22.75);
}

// Case 4 — the main rate, flat: £300,000 × 25% = £75,000.
{
  console.log("\n--- Case 4: £300,000 (main rate) ---");
  const r = calculateCorporationTax({ profit: 300000 });
  check("tax", r.tax, 75000);
  check("marginal relief", r.marginalRelief, 0);
  check("effective rate %", r.effectiveRatePercent, 25);
  checkStr("regime", r.regime, "main");
}

// Case 5 — limits divided: £80,000 with 2 associated companies.
// Limits £25,000 / £125,000; tax = £20,000 − (£125,000 −
// £80,000) × 3/200 = £20,000 − £675 = £19,325.
{
  console.log("\n--- Case 5: £80,000 with 2 associated companies ---");
  const r = calculateCorporationTax({
    profit: 80000,
    associatedCompanies: 2,
  });
  check("small limit", r.smallProfitsLimit, 25000);
  check("main limit", r.mainRateLimit, 125000);
  check("marginal relief", r.marginalRelief, 675);
  check("tax", r.tax, 19325);
  check("profit after tax", r.profitAfterTax, 60675);
}

// Case 6 — GOV.UK's own division example ("Marginal Relief for
// Corporation Tax": 3 other associated companies divide the
// limits by 4): £12,500 and £62,500. Profit at the divided
// upper limit pays the full main rate: £62,500 × 25% = £15,625.
{
  console.log("\n--- Case 6: GOV.UK division example (4 companies) ---");
  const r = calculateCorporationTax({
    profit: 62500,
    associatedCompanies: 4,
  });
  check("small limit", r.smallProfitsLimit, 12500);
  check("main limit", r.mainRateLimit, 62500);
  check("tax at the divided upper limit", r.tax, 15625);
  checkStr("regime", r.regime, "main");
}

// Case 7 — the builder, worked by hand: £95,000 in the accounts
// + £2,400 entertaining + £6,000 depreciation − £9,400 capital
// allowances − £4,000 losses = £90,000 taxable. CT: £22,500 −
// (£160,000 × 3/200 = £2,400) = £20,100; effective 22.33%.
{
  console.log("\n--- Case 7: taxable-profit builder ---");
  const b = buildTaxableProfit({
    accountingProfit: 95000,
    addBackEntertaining: 2400,
    addBackDepreciation: 6000,
    capitalAllowances: 9400,
    lossesBroughtForward: 4000,
  });
  check("total add-backs", b.totalAddBacks, 8400);
  check("total deductions", b.totalDeductions, 13400);
  check("taxable profit", b.taxableProfit, 90000);
  check("unused deductions", b.unusedDeductions, 0);
  check("steps recorded (start+2 adds+2 deducts+result)", b.steps.length, 6);
  const ct = calculateCorporationTax({ profit: b.taxableProfit });
  check("CT on the built profit", ct.tax, 20100);
  check("marginal relief on the built profit", ct.marginalRelief, 2400);
  check("effective rate %", ct.effectiveRatePercent, 22.33);
}

// Case 8 — the builder floor: deductions the profit cannot
// absorb. £10,000 of profit less £15,000 of capital allowances:
// taxable profit is £0 (never negative), £5,000 unused, tax £0.
{
  console.log("\n--- Case 8: builder floor at £0 ---");
  const b = buildTaxableProfit({
    accountingProfit: 10000,
    capitalAllowances: 15000,
  });
  check("taxable profit before floor", b.taxableProfitBeforeFloor, -5000);
  check("taxable profit", b.taxableProfit, 0);
  check("unused deductions", b.unusedDeductions, 5000);
  check(
    "CT on £0",
    calculateCorporationTax({ profit: b.taxableProfit }).tax,
    0,
  );
}

// Case 9 — the dates: a period ending 31 March 2026 is paid by
// 1 January 2027 (9 months + 1 day) and filed by 31 March 2027
// (12 months) — GOV.UK's own worked pair of dates.
{
  console.log("\n--- Case 9: deadlines for a 31 March 2026 year end ---");
  const d = corporationTaxDates("2026-03-31", 80000);
  checkStr("payment deadline", d.paymentDeadline, "2027-01-01");
  checkStr("filing deadline", d.filingDeadline, "2027-03-31");
  checkTrue("not a large company", !d.largeCompany);
}

// Case 10 — the large-company regime: £1,600,000 of taxable
// profit pays a flat £400,000 and leaves the single-date
// timetable for quarterly instalments.
{
  console.log("\n--- Case 10: £1,600,000 (instalments) ---");
  const r = calculateCorporationTax({ profit: 1600000 });
  check("tax", r.tax, 400000);
  const d = corporationTaxDates("2026-03-31", 1600000);
  checkTrue("large company", d.largeCompany);
  check("instalment threshold", d.instalmentThreshold, 1500000);
}

// Case 11 — the 26.5% marginal rate inside the taper: one extra
// £1 at £100,000 adds 25p of main-rate tax and withdraws 1.5p
// of relief — 26.5p in all (the 2dp rounding of the two bills
// can move the difference by half a penny, hence the tolerance).
{
  console.log("\n--- Case 11: the 26.5% marginal rate ---");
  const at = calculateCorporationTax({ profit: 100000 }).tax;
  const above = calculateCorporationTax({ profit: 100001 }).tax;
  checkTol("tax on the extra £1", above - at, 0.265, 0.01);
}

console.log(
  failures === 0
    ? "\nAll corporation tax checks passed."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
