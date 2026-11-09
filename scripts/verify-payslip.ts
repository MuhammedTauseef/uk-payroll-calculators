/**
 * Hand-computed verification of the payslip generator maths.
 *
 * Run with:  npm run verify:payslip
 *
 * Every money case below was worked out by hand first (annualise the
 * period pay, apply the 2026/27 bands from rates.ts, divide back);
 * the script then checks calculatePayslip() against those figures.
 * Case C also proves the reuse claim in src/lib/payslip.ts: on the
 * standard code 1257L the payslip tax and NI equal calculateTakeHome()
 * exactly, at every salary including the £100,000 allowance taper.
 * Exits non-zero if any figure disagrees.
 */
import { calculatePayslip } from "../src/lib/payslip.ts";
import { calculateTakeHome } from "../src/lib/takehome.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

// Case A — monthly £2,500, code 1257L (the page's worked example).
// Annual £30,000. Allowance £12,570 → taxable £17,430, all at 20% →
// tax £3,486.00/yr. NI: 8% of £17,430 → £1,394.40/yr.
// Net £25,119.60/yr. Monthly: tax £290.50, NI £116.20, net £2,093.30.
{
  const r = calculatePayslip({
    employerName: "Example Ltd",
    employeeName: "Example",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "1257L",
  });
  check("A", "grossAnnual", r.grossAnnual, 30000);
  check("A", "incomeTaxAnnual", r.incomeTaxAnnual, 3486);
  check("A", "employeeNiAnnual", r.employeeNiAnnual, 1394.4);
  check("A", "netAnnual", r.netAnnual, 25119.6);
  check("A", "incomeTaxPerPeriod", r.incomeTaxPerPeriod, 290.5);
  check("A", "employeeNiPerPeriod", r.employeeNiPerPeriod, 116.2);
  check("A", "totalDeductionsPerPeriod", r.totalDeductionsPerPeriod, 406.7);
  check("A", "netPerPeriod", r.netPerPeriod, 2093.3);
}

// Case B — weekly £500, code 1257L.
// Annual £26,000. Taxable £13,430 → tax £2,686.00; NI 8% → £1,074.40;
// net £22,239.60. Weekly: tax £51.65, NI £20.66, total £72.31.
// Net per week is £427.69 under the display rounding rule in
// payslip.ts: the printed net is printed gross − printed total
// (£500.00 − £72.31), so the lines a reader adds up agree. (Dividing
// the unrounded annual net by 52 would give £427.68, a penny adrift
// of the printed lines.)
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "weekly",
    grossPerPeriod: 500,
    taxCode: "1257L",
  });
  check("B", "grossAnnual", r.grossAnnual, 26000);
  check("B", "incomeTaxAnnual", r.incomeTaxAnnual, 2686);
  check("B", "employeeNiAnnual", r.employeeNiAnnual, 1074.4);
  check("B", "netAnnual", r.netAnnual, 22239.6);
  check("B", "incomeTaxPerPeriod", r.incomeTaxPerPeriod, 51.65);
  check("B", "employeeNiPerPeriod", r.employeeNiPerPeriod, 20.66);
  check("B", "totalDeductionsPerPeriod", r.totalDeductionsPerPeriod, 72.31);
  check("B", "netPerPeriod", r.netPerPeriod, 427.69);
}

// Case J — weekly £600, code 1257L (the penny-out case a user spotted
// on the live payslip). Annual £31,200. Taxable £18,630 → tax
// £3,726.00/yr (£71.65/wk); NI 8% → £1,490.40/yr (£28.66/wk).
// Displayed total must be the sum of the displayed lines:
// £71.65 + £28.66 = £100.31, and net £600.00 − £100.31 = £499.69.
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "weekly",
    grossPerPeriod: 600,
    taxCode: "1257L",
  });
  check("J", "grossAnnual", r.grossAnnual, 31200);
  check("J", "incomeTaxAnnual", r.incomeTaxAnnual, 3726);
  check("J", "employeeNiAnnual", r.employeeNiAnnual, 1490.4);
  check("J", "netAnnual", r.netAnnual, 25983.6);
  check("J", "incomeTaxPerPeriod", r.incomeTaxPerPeriod, 71.65);
  check("J", "employeeNiPerPeriod", r.employeeNiPerPeriod, 28.66);
  check("J", "totalDeductionsPerPeriod", r.totalDeductionsPerPeriod, 100.31);
  check("J", "netPerPeriod", r.netPerPeriod, 499.69);
}

// Case C — standard-code equivalence with the verified take-home maths.
for (const salary of [
  0, 10000, 12570, 20000, 30000, 50270, 75000, 100000, 110000, 125140,
  150000, 250000,
]) {
  const p = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: salary / 12,
    taxCode: "1257L",
  });
  const t = calculateTakeHome({ annualSalary: salary });
  check(`C £${salary}`, "incomeTaxAnnual", p.incomeTaxAnnual, t.incomeTax);
  check(`C £${salary}`, "employeeNiAnnual", p.employeeNiAnnual, t.employeeNationalInsurance);
  check(`C £${salary}`, "netAnnual", p.netAnnual, t.netAnnual);
}

// Case D — BR code, monthly £2,500: all £30,000 at 20% → tax £6,000/yr
// (£500.00/mo). NI unchanged £116.20/mo. Net £22,605.60/yr (£1,883.80/mo).
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "BR",
  });
  check("D", "incomeTaxAnnual", r.incomeTaxAnnual, 6000);
  check("D", "incomeTaxPerPeriod", r.incomeTaxPerPeriod, 500);
  check("D", "netPerPeriod", r.netPerPeriod, 1883.8);
}

// Case E — K475, monthly £2,500: allowance −£4,750 → taxable
// £30,000 + £4,750 = £34,750, all at 20% → tax £6,950/yr (£579.17/mo).
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "K475",
  });
  check("E", "incomeTaxAnnual", r.incomeTaxAnnual, 6950);
  check("E", "incomeTaxPerPeriod", r.incomeTaxPerPeriod, 579.17);
}

// Case F — 0T, monthly £2,500: no allowance → £30,000 at 20% → £6,000/yr.
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "0T",
  });
  check("F", "incomeTaxAnnual", r.incomeTaxAnnual, 6000);
}

// Case G — NT code: no tax at all; NI still applies.
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "NT",
  });
  check("G", "incomeTaxAnnual", r.incomeTaxAnnual, 0);
  check("G", "employeeNiAnnual", r.employeeNiAnnual, 1394.4);
}

// Case I — the taper, expressed as an HMRC-issued code: at £110,000
// the tapered Personal Allowance is £12,570 − £5,000 = £7,570, issued
// as code 757L. Taxable £102,430 → £37,700 at 20% (£7,540) + £64,730
// at 40% (£25,892) = £33,432 — identical to calculateTakeHome() at
// £110,000, reached by the code route instead of the taper route.
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 110000 / 12,
    taxCode: "757L",
  });
  check("I", "incomeTaxAnnual", r.incomeTaxAnnual, 33432);
}

// Case H — unrecognised code falls back to the standard calculation.
{
  const r = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: 2500,
    taxCode: "XYZ",
  });
  check("H", "incomeTaxAnnual", r.incomeTaxAnnual, 3486);
  if (r.taxCodeRecognised) {
    failures += 1;
    console.error("FAIL H — taxCodeRecognised should be false for 'XYZ'");
  }
}

if (failures > 0) {
  console.error(`verify-payslip: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-payslip: all hand-computed cases pass");
