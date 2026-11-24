/**
 * Hand-computed verification of the dividend tax maths, the
 * shared Corporation Tax engine and the salary/dividend
 * optimiser.
 *
 * Run with:  npm run verify:dividend-tax
 *
 * Every expected figure below was worked by hand from the
 * 2026/27 rules (Personal Allowance £12,570, tapered £1 per £2
 * over £100,000; salary bands 20% to £37,700 of taxable income,
 * 40% to £125,140, 45% above; dividend allowance £500 inside the
 * bands, then 10.75% / 35.75% / 39.35%; employee NI 8% between
 * £12,570 and £50,270, 2% above; employer NI 15% over £5,000;
 * Plan 2 loan 9% over £29,385 of TOTAL income; Corporation Tax
 * 19% to £50,000, 25% over £250,000, Marginal Relief 3/200
 * between) before the engines were run. Exits non-zero on any
 * disagreement.
 */
import { calculateCorporationTax } from "../src/lib/corporation-tax.ts";
import {
  calculateDividendTax,
  optimiseSalaryDividend,
  salaryDividendSplitFor,
  type DividendTaxInput,
} from "../src/lib/dividend-tax.ts";

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

function checkTrue(label: string, cond: boolean) {
  if (!cond) failures += 1;
  console.log(`${cond ? "PASS" : "FAIL"}  ${label}`);
}

function run(label: string, input: DividendTaxInput) {
  console.log(`\n--- ${label} ---`);
  return calculateDividendTax(input);
}

// Case 1 — THE cross-check (the best competitor's live-verified
// figures, 23 Nov 2026): salary £12,570 + dividends £30,000.
// The allowance covers the salary exactly; employee NI is £0
// (salary = its own threshold). Dividends: no allowance left,
// £500 at 0%, then £29,500 all inside the basic band (taxable
// stack £0 + £500 + £29,500 = £30,000 < £37,700) at 10.75% =
// £3,171.25. (The competitor displayed £3,171 and £39,399 — the
// whole-pound roundings of £3,171.25 and £39,398.75.)
// Employer NI: (£12,570 − £5,000) × 15% = £1,135.50.
{
  const r = run("Case 1: £12,570 salary + £30,000 dividends", {
    salary: 12570,
    dividends: 30000,
  });
  check("dividend tax", r.dividendTax, 3171.25);
  check("salary tax", r.nonDividendTax, 0);
  check("employee NI", r.employeeNi, 0);
  check("employer NI (company side)", r.employerNi, 1135.5);
  check("take-home / year", r.takeHomeAnnual, 39398.75);
  check("take-home / month", r.takeHomeMonthly, 3283.23);
  check("SA set-aside / year", r.selfAssessmentSetAsideAnnual, 3171.25);
  check("SA set-aside / month", r.selfAssessmentSetAsideMonthly, 264.27);
}

// Case 2 — GOV.UK's own worked example ("Tax on dividends",
// checked 23 Nov 2026): £29,570 wages + £3,000 dividends.
// Taxable wages £17,000 at 20% = £3,400; NI £17,000 × 8% =
// £1,360; dividends £500 at 0% then £2,500 at 10.75% = £268.75 —
// GOV.UK's published figure.
{
  const r = run("Case 2: GOV.UK example £29,570 + £3,000", {
    salary: 29570,
    dividends: 3000,
  });
  check("salary tax", r.nonDividendTax, 3400.0);
  check("dividend tax (GOV.UK's £268.75)", r.dividendTax, 268.75);
  check("employee NI", r.employeeNi, 1360.0);
  check("take-home", r.takeHomeAnnual, 27541.25);
}

// Case 3 — basic rate only: salary £20,000 + dividends £5,000.
// Salary tax (£7,430 × 20%) £1,486; NI £594.40. Allowance used
// up by the salary, so dividends: £500 at 0%, £4,500 at 10.75%
// (stack position £7,430 + £500, all basic) = £483.75.
{
  const r = run("Case 3: £20,000 + £5,000", {
    salary: 20000,
    dividends: 5000,
  });
  check("salary tax", r.nonDividendTax, 1486.0);
  check("dividend tax", r.dividendTax, 483.75);
  check("employee NI", r.employeeNi, 594.4);
  check("take-home", r.takeHomeAnnual, 22435.85);
}

// Case 4 — dividends straddle the basic/higher boundary:
// salary £40,000 + dividends £20,000. Salary taxable £27,430,
// tax £5,486, NI £2,194.40. Dividends start at £27,430: £500
// allowance, then £9,770 of basic band left at 10.75%
// (£1,050.275) and £9,730 at 35.75% (£3,478.475) — total
// £4,528.75 on the unrounded slices.
{
  const r = run("Case 4: £40,000 + £20,000 (straddle)", {
    salary: 40000,
    dividends: 20000,
  });
  check("salary tax", r.nonDividendTax, 5486.0);
  check("dividend tax", r.dividendTax, 4528.75);
  check("employee NI", r.employeeNi, 2194.4);
  check("take-home", r.takeHomeAnnual, 47790.85);
  checkTrue("dividends reach higher band", r.dividendsReachHigherBands);
}

// Case 5 — higher rate throughout: salary £60,000 + dividends
// £20,000. Salary tax £7,540 + £9,730 × 40% = £11,432; NI
// £3,016 + £194.60 = £3,210.60. Dividends sit wholly in the
// higher band: £19,500 × 35.75% = £6,971.25.
{
  const r = run("Case 5: £60,000 + £20,000", {
    salary: 60000,
    dividends: 20000,
  });
  check("salary tax", r.nonDividendTax, 11432.0);
  check("dividend tax", r.dividendTax, 6971.25);
  check("employee NI", r.employeeNi, 3210.6);
  check("take-home", r.takeHomeAnnual, 58386.15);
}

// Case 6 — the £100,000 taper: salary £110,000 + dividends
// £20,000 (total £130,000, allowance fully gone). Salary tax:
// £7,540 + £72,300 × 40% = £36,460. NI £3,016 + £1,194.60 =
// £4,210.60. Dividends from taxable position £110,000: £500
// allowance, then £14,640 at 35.75% (£5,233.80) up to the
// £125,140 line and £4,860 at 39.35% (£1,912.41) above it —
// £7,146.21.
{
  const r = run("Case 6: £110,000 + £20,000 (taper)", {
    salary: 110000,
    dividends: 20000,
  });
  check("personal allowance", r.personalAllowance, 0);
  check("salary tax", r.nonDividendTax, 36460.0);
  check("dividend tax", r.dividendTax, 7146.21);
  check("employee NI", r.employeeNi, 4210.6);
  check("take-home", r.takeHomeAnnual, 82183.19);
  checkTrue("in taper zone", r.inTaperZone);
}

// Case 7 — student loan on TOTAL income: £12,570 + £30,000,
// Plan 2. Loan (£42,570 − £29,385) × 9% = £1,186.65 — charged
// on the dividends too, through Self Assessment. Dividend tax
// as case 1; set-aside £3,171.25 + £1,186.65 = £4,357.90.
{
  const r = run("Case 7: £12,570 + £30,000, Plan 2", {
    salary: 12570,
    dividends: 30000,
    undergraduatePlan: "plan2",
  });
  check("student loan", r.studentLoan, 1186.65);
  check("dividend tax", r.dividendTax, 3171.25);
  check("SA set-aside / year", r.selfAssessmentSetAsideAnnual, 4357.9);
  check("SA set-aside / month", r.selfAssessmentSetAsideMonthly, 363.16);
  check("take-home", r.takeHomeAnnual, 38212.1);
}

// Case 8 — salary sacrifice: £40,000 salary, £5,000 sacrificed,
// £10,000 dividends. Pay £35,000: tax £22,430 × 20% = £4,486;
// NI £1,794.40; employer NI (£35,000 − £5,000) × 15% = £4,500.
// Dividends: £500 at 0%, £9,500 at 10.75% = £1,021.25.
{
  const r = run("Case 8: £40,000 − £5,000 sacrifice + £10,000", {
    salary: 40000,
    dividends: 10000,
    salarySacrificePension: 5000,
  });
  check("pay after sacrifice", r.payAfterSacrifice, 35000);
  check("salary tax", r.nonDividendTax, 4486.0);
  check("employee NI", r.employeeNi, 1794.4);
  check("employer NI", r.employerNi, 4500.0);
  check("dividend tax", r.dividendTax, 1021.25);
  check("take-home (cash)", r.takeHomeAnnual, 37698.35);
}

// Case 9 — dividends only, allowance does the work: no salary,
// £20,970 of dividends. The £12,570 allowance covers the first
// slice, the £500 dividend allowance the next, and £7,900 is
// left at 10.75% = £849.25.
{
  const r = run("Case 9: £0 salary + £20,970 dividends", {
    salary: 0,
    dividends: 20970,
  });
  check("allowance on dividends", r.allowanceUsedByDividends, 12570);
  check("dividend tax", r.dividendTax, 849.25);
  check("take-home", r.takeHomeAnnual, 20120.75);
}

// Case 10 — the Corporation Tax engine (shared with Tool 4).
// £80,000: 25% × £80,000 − (£250,000 − £80,000) × 3/200 =
// £20,000 − £2,550 = £17,450 (GoFile's live-verified figure,
// 23 Nov 2026). £100,000: £25,000 − £2,250 = £22,750
// (ContractorCalculator's live-verified total). £40,000 at the
// small profits rate: £7,600. £300,000 at the main rate:
// £75,000. Two associated companies halve the limits, so
// £80,000 pays £20,000 − (£125,000 − £80,000) × 3/200 = £19,325.
{
  console.log("\n--- Case 10: Corporation Tax engine ---");
  const ct80 = calculateCorporationTax({ profit: 80000 });
  check("CT on £80,000", ct80.tax, 17450.0);
  check("marginal relief on £80,000", ct80.marginalRelief, 2550.0);
  check("profit after tax £80,000", ct80.profitAfterTax, 62550.0);
  const ct100 = calculateCorporationTax({ profit: 100000 });
  check("CT on £100,000", ct100.tax, 22750.0);
  check("marginal relief on £100,000", ct100.marginalRelief, 2250.0);
  check("CT on £40,000 (small profits)", calculateCorporationTax({ profit: 40000 }).tax, 7600.0);
  check("CT on £300,000 (main rate)", calculateCorporationTax({ profit: 300000 }).tax, 75000.0);
  const ctAssoc = calculateCorporationTax({ profit: 80000, associatedCompanies: 2 });
  check("CT on £80,000 with 2 companies", ctAssoc.tax, 19325.0);
  check("divided main limit", ctAssoc.mainRateLimit, 125000);
}

// Case 11 — the optimiser on £50,000 of company profit.
// Hand-worked: at a £12,570 salary, employer NI is £1,135.50,
// taxable profit £36,294.50, Corporation Tax at 19% £6,895.955,
// dividends £29,398.55 (to the penny either way on the CT
// rounding), dividend tax £3,106.59 — take-home ≈ £38,861.95.
// The two neighbouring grid points were also worked by hand:
// £12,500 → £38,857.67 and £12,750 → ≈£38,841.91. Both lose,
// and £5,000 (≈£38,399.15) and £20,000 (£37,034.52) lose by
// more — £12,570 is the winner.
{
  console.log("\n--- Case 11: optimiser on £50,000 profit ---");
  const opt = optimiseSalaryDividend({ profit: 50000 });
  check("winning salary", opt.best.salary, 12570);
  checkTol("winning CT", opt.best.corporationTax, 6895.955, 0.02);
  checkTol("winning dividends", opt.best.dividends, 29398.55, 0.02);
  checkTol("winning take-home", opt.best.takeHome, 38861.95, 0.05);
  const n1 = salaryDividendSplitFor(50000, 12500);
  const n2 = salaryDividendSplitFor(50000, 12750);
  checkTol("neighbour £12,500 take-home", n1.takeHome, 38857.67, 0.05);
  checkTol("neighbour £12,750 take-home", n2.takeHome, 38841.91, 0.05);
  checkTrue("£12,500 loses to the winner", n1.takeHome < opt.best.takeHome);
  checkTrue("£12,750 loses to the winner", n2.takeHome < opt.best.takeHome);
  checkTrue(
    "top split is the winner",
    opt.topSplits[0].salary === opt.best.salary,
  );
}

console.log(
  failures === 0
    ? "\nAll dividend tax checks passed."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
