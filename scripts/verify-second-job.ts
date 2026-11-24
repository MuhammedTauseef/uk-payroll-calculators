/**
 * Hand-computed verification of the second job tax maths.
 *
 * Run with:  npm run verify:second-job
 *
 * Every expected figure below was worked by hand from the 2026/27
 * rules in rates.ts (Personal Allowance £12,570; 20% on the first
 * £37,700 of taxable income, 40% to £125,140, 45% above; employee
 * NI 8% between £12,570 and £50,270 PER JOB, 2% above; Plan 2
 * student loan 9% over £29,385 of TOTAL income) before the engine
 * was run. Exits non-zero on any disagreement.
 */
import {
  calculateSecondJob,
  type SecondJobInput,
} from "../src/lib/second-job.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  const ok = Math.abs(actual - expected) < 0.005;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function checkStr(label: string, actual: string, expected: string) {
  const ok = actual === expected;
  if (!ok) failures += 1;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label}: got ${actual}, expected ${expected}`,
  );
}

function run(label: string, input: SecondJobInput) {
  console.log(`\n--- ${label} ---`);
  return calculateSecondJob(input);
}

// Case 1 — the headline cross-check: £35,000 + £10,000.
// Combined £45,000; taxable £32,430 @ 20% = £6,486. NI: job 1
// (£35,000 − £12,570) @ 8% = £1,794.40; job 2 under its own
// £12,570 threshold = £0. Take-home £36,719.60 (£3,059.97/mo).
// Job 2 keeps £8,000 of its £10,000 (£80 per £100, £666.67/mo).
{
  const r = run("Case 1: £35,000 + £10,000", {
    job1Salary: 35000,
    job2Salary: 10000,
  });
  check("combined income tax", r.incomeTax, 6486.0);
  check("job 1 NI", r.job1.nationalInsurance, 1794.4);
  check("job 2 NI", r.job2.nationalInsurance, 0);
  check("total NI", r.totalNationalInsurance, 1794.4);
  check("take-home / year", r.takeHomeAnnual, 36719.6);
  check("take-home / month", r.takeHomeMonthly, 3059.97);
  check("job 2 extra tax", r.job2.incomeTax, 2000.0);
  check("kept from job 2 / year", r.keepFromJob2Annual, 8000.0);
  check("kept from job 2 / month", r.keepFromJob2Monthly, 666.67);
  check("keep per £100", r.keepPer100, 80.0);
}

// Case 2 — BR payslip on case 1: job 1's employer on 1257L takes
// (£35,000 − £12,570) @ 20% = £4,486; job 2's employer on BR takes
// 20% of £10,000 = £2,000. Deducted £6,486 = the true bill exactly.
{
  const r = run("Case 2: £35k + £10k, job 2 on BR", {
    job1Salary: 35000,
    job2Salary: 10000,
    job2TaxCode: "BR",
  });
  checkStr("job 1 code", r.payslip.job1Code, "1257L");
  checkStr("job 2 code", r.payslip.job2Code, "BR");
  check("job 1 employer tax", r.payslip.job1TaxDeducted, 4486.0);
  check("job 2 employer tax", r.payslip.job2TaxDeducted, 2000.0);
  check("payslip difference", r.payslip.difference, 0);
}

// Case 3 — job 2 crosses its OWN NI threshold: £30,000 + £20,000.
// Tax: £37,430 @ 20% = £7,486. NI job 1: £17,430 @ 8% = £1,394.40;
// NI job 2: £7,430 @ 8% = £594.40 (a single £50,000 job would pay
// £3,016 of NI — the second Primary Threshold saves £1,027.20).
{
  const r = run("Case 3: £30,000 + £20,000", {
    job1Salary: 30000,
    job2Salary: 20000,
  });
  check("income tax", r.incomeTax, 7486.0);
  check("job 1 NI", r.job1.nationalInsurance, 1394.4);
  check("job 2 NI", r.job2.nationalInsurance, 594.4);
  check("take-home", r.takeHomeAnnual, 40525.2);
}

// Case 4 — combined income over £50,270: £40,000 + £25,000.
// Taxable £52,430: £37,700 @ 20% = £7,540 + £14,730 @ 40% =
// £5,892 → £13,432. NI: £27,430 @ 8% = £2,194.40 and £12,430
// @ 8% = £994.40. Job 2 keeps £25,000 − £7,946 − £994.40.
{
  const r = run("Case 4: £40,000 + £25,000", {
    job1Salary: 40000,
    job2Salary: 25000,
  });
  check("income tax", r.incomeTax, 13432.0);
  check("job 1 NI", r.job1.nationalInsurance, 2194.4);
  check("job 2 NI", r.job2.nationalInsurance, 994.4);
  check("take-home", r.takeHomeAnnual, 48379.2);
  check("job 2 extra tax", r.job2.incomeTax, 7946.0);
  check("kept from job 2", r.keepFromJob2Annual, 16059.6);
}

// Case 5 — the £100,000 taper: £90,000 + £20,000 = £110,000.
// PA = £12,570 − £5,000 = £7,570. Taxable £102,430: £7,540 +
// £64,730 @ 40% = £25,892 → £33,432. NI job 1: £3,016 + £794.60
// = £3,810.60; job 2 £594.40. The second job's extra tax is
// £10,000 on £20,000 — a 50% marginal rate (40% band + taper).
{
  const r = run("Case 5: £90,000 + £20,000 (taper)", {
    job1Salary: 90000,
    job2Salary: 20000,
  });
  check("personal allowance", r.personalAllowance, 7570.0);
  check("income tax", r.incomeTax, 33432.0);
  check("job 1 NI", r.job1.nationalInsurance, 3810.6);
  check("job 2 NI", r.job2.nationalInsurance, 594.4);
  check("take-home", r.takeHomeAnnual, 72163.0);
  check("job 2 extra tax", r.job2.incomeTax, 10000.0);
  check("kept from job 2", r.keepFromJob2Annual, 9405.6);
}

// Case 6 — student loan on TOTAL income: £35,000 + £10,000, Plan 2.
// Loan: (£45,000 − £29,385) @ 9% = £1,405.35. On job 1 alone it
// would be £505.35, so the second job adds £900.00 of loan.
{
  const r = run("Case 6: £35k + £10k, Plan 2 loan", {
    job1Salary: 35000,
    job2Salary: 10000,
    undergraduatePlan: "plan2",
  });
  check("total student loan", r.totalStudentLoan, 1405.35);
  check("job 1 loan alone", r.job1.studentLoan, 505.35);
  check("job 2 extra loan", r.job2.studentLoan, 900.0);
  check("take-home", r.takeHomeAnnual, 35314.25);
}

// Case 7 — the BR refund story: £8,000 + £10,000, job 2 on BR.
// True tax: (£18,000 − £12,570) @ 20% = £1,086. Job 1's employer
// deducts £0 (pay under the allowance); BR deducts £2,000 —
// £914 too much, refunded after the year ends.
{
  const r = run("Case 7: £8,000 + £10,000, job 2 on BR (refund)", {
    job1Salary: 8000,
    job2Salary: 10000,
    job2TaxCode: "BR",
  });
  check("true income tax", r.incomeTax, 1086.0);
  check("job 1 employer tax", r.payslip.job1TaxDeducted, 0);
  check("job 2 employer tax", r.payslip.job2TaxDeducted, 2000.0);
  check("overpaid (refund due)", r.payslip.difference, 914.0);
  check("take-home", r.takeHomeAnnual, 16914.0);
}

// Case 8 — D0 over-deduction: £35,000 + £10,000, job 2 on D0.
// Job 2's employer takes 40% of £10,000 = £4,000; total deducted
// £8,486 against a true bill of £6,486 — £2,000 overpaid.
{
  const r = run("Case 8: £35k + £10k, job 2 on D0", {
    job1Salary: 35000,
    job2Salary: 10000,
    job2TaxCode: "D0",
  });
  check("job 2 employer tax", r.payslip.job2TaxDeducted, 4000.0);
  check("overpaid (refund due)", r.payslip.difference, 2000.0);
}

// Case 9 — salary sacrifice on job 1: £40,000 @ 5% + £10,000.
// Pension £2,000; pay £38,000 + £10,000 = £48,000. Tax: £35,430
// @ 20% = £7,086. NI job 1: £25,430 @ 8% = £2,034.40; job 2 £0.
// Cash take-home £50,000 − £2,000 − £7,086 − £2,034.40.
{
  const r = run("Case 9: £40,000 @5% sacrifice + £10,000", {
    job1Salary: 40000,
    job2Salary: 10000,
    job1PensionPercent: 5,
  });
  check("pension", r.totalPension, 2000.0);
  check("income tax", r.incomeTax, 7086.0);
  check("job 1 NI", r.job1.nationalInsurance, 2034.4);
  check("take-home", r.takeHomeAnnual, 38879.6);
}

// Case 10 — split allowance 50/50, job 2 on a normal code.
// Each job's allowance floors to £6,280 in a code (628L on both):
// job 1 deducts (£35,000 − £6,280) @ 20% = £5,744; job 2 deducts
// (£10,000 − £6,280) @ 20% = £744. The two £10-code roundings
// leave £2.00 over-deducted against the true £6,486.
{
  const r = run("Case 10: £35k + £10k, allowance split 50/50", {
    job1Salary: 35000,
    job2Salary: 10000,
    allowanceOnJob1Percent: 50,
    job2TaxCode: "SPLIT",
  });
  checkStr("job 1 code", r.payslip.job1Code, "628L");
  checkStr("job 2 code", r.payslip.job2Code, "628L");
  check("job 1 employer tax", r.payslip.job1TaxDeducted, 5744.0);
  check("job 2 employer tax", r.payslip.job2TaxDeducted, 744.0);
  check("payslip difference", r.payslip.difference, 2.0);
  check("true income tax unchanged", r.incomeTax, 6486.0);
}

console.log(
  failures === 0
    ? "\nAll second-job checks passed."
    : `\n${failures} check(s) FAILED.`,
);
process.exit(failures === 0 ? 0 : 1);
