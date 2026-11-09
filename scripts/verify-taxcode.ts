/**
 * Hand-computed verification of the tax code checker maths.
 *
 * Run with:  npm run verify:taxcode
 *
 * Every money case below was worked out by hand first from the
 * 2026/27 bands in rates.ts (Personal Allowance £12,570; 20% on the
 * first £37,700 of taxable income, 40% up to £125,140, 45% above;
 * allowance tapered by £1 per £2 over £100,000 on the standard code).
 * The script checks checkTaxCode() / decodeTaxCode() in
 * src/lib/taxcode.ts against those figures, and proves the reuse
 * claim: on the standard code 1257L the checker's tax equals
 * calculateTakeHome()'s tax exactly, taper included.
 * Exits non-zero if any figure disagrees.
 */
import { checkTaxCode, decodeTaxCode } from "../src/lib/taxcode.ts";
import { calculateTakeHome } from "../src/lib/takehome.ts";

let failures = 0;

function checkNum(
  caseName: string,
  field: string,
  actual: number | null,
  expected: number | null,
) {
  if (actual === null || expected === null) {
    if (actual !== expected) {
      failures += 1;
      console.error(
        `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
      );
    }
    return;
  }
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

function checkVal<T>(caseName: string, field: string, actual: T, expected: T) {
  if (actual !== expected) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${String(actual)}, expected ${String(expected)}`,
    );
  }
}

// --- Decode cases ------------------------------------------------------

// 1257L: digits 1257 → £12,570 allowance, letter L, standard.
{
  const d = decodeTaxCode("1257L");
  checkVal("decode-1257L", "recognised", d.recognised, true);
  checkVal("decode-1257L", "kind", d.kind, "numbered");
  checkVal("decode-1257L", "letter", d.letter, "L");
  checkNum("decode-1257L", "allowance", d.allowance, 12570);
  checkVal("decode-1257L", "region", d.region, "england-ni");
  checkVal("decode-1257L", "emergencyBasis", d.emergencyBasis, false);
  checkVal("decode-1257L", "comparable", d.comparable, true);
}

// 1257L W1: same code on an emergency (week 1) basis.
{
  const d = decodeTaxCode("1257L W1");
  checkVal("decode-W1", "emergencyBasis", d.emergencyBasis, true);
  checkVal("decode-W1", "emergencySuffix", d.emergencySuffix, "W1");
  checkVal("decode-W1", "baseCode", d.baseCode, "1257L");
  checkNum("decode-W1", "allowance", d.allowance, 12570);
  checkVal("decode-W1", "display", d.display, "1257L W1");
}

// S1257L M1: Scottish prefix + monthly emergency ending.
{
  const d = decodeTaxCode("S1257L M1");
  checkVal("decode-S-M1", "region", d.region, "scotland");
  checkVal("decode-S-M1", "emergencySuffix", d.emergencySuffix, "M1");
  checkVal("decode-S-M1", "baseCode", d.baseCode, "1257L");
  checkNum("decode-S-M1", "allowance", d.allowance, 12570);
}

// BR / D0 / D1: flat-rate codes, no allowance.
for (const [code, name] of [
  ["BR", "the basic rate (20%)"],
  ["D0", "the higher rate (40%)"],
  ["D1", "the additional rate (45%)"],
] as const) {
  const d = decodeTaxCode(code);
  checkVal(`decode-${code}`, "kind", d.kind, "flat-rate");
  checkVal(`decode-${code}`, "flatRateName", d.flatRateName, name);
  checkNum(`decode-${code}`, "allowance", d.allowance, null);
  checkVal(`decode-${code}`, "comparable", d.comparable, true);
}

// NT: no tax.
{
  const d = decodeTaxCode("NT");
  checkVal("decode-NT", "kind", d.kind, "no-tax");
  checkVal("decode-NT", "comparable", d.comparable, true);
}

// 0T: allowance £0.
{
  const d = decodeTaxCode("0T");
  checkVal("decode-0T", "kind", d.kind, "numbered");
  checkNum("decode-0T", "allowance", d.allowance, 0);
}

// K475: NEGATIVE allowance −£4,750.
{
  const d = decodeTaxCode("K475");
  checkVal("decode-K475", "kind", d.kind, "k");
  checkNum("decode-K475", "digits", d.digits, 475);
  checkNum("decode-K475", "allowance", d.allowance, -4750);
}

// 1100L: reduced allowance £11,000 (GOV.UK's own worked example shape).
{
  const d = decodeTaxCode("1100L");
  checkNum("decode-1100L", "allowance", d.allowance, 11000);
}

// 1383M / 1131N: Marriage Allowance codes (GOV.UK: £1,260 transfer
// makes the allowances £13,830 and £11,310).
{
  checkNum("decode-1383M", "allowance", decodeTaxCode("1383M").allowance, 13830);
  checkNum("decode-1131N", "allowance", decodeTaxCode("1131N").allowance, 11310);
}

// SD2: Scottish advanced-rate flat code — decoded, NOT comparable.
{
  const d = decodeTaxCode("SD2");
  checkVal("decode-SD2", "region", d.region, "scotland");
  checkVal("decode-SD2", "kind", d.kind, "flat-rate");
  checkVal("decode-SD2", "flatRateName", d.flatRateName, "the advanced rate in Scotland");
  checkVal("decode-SD2", "comparable", d.comparable, false);
}

// CBR: Welsh basic-rate flat code — comparable (bands shared in the
// hub's rates model).
{
  const d = decodeTaxCode("CBR");
  checkVal("decode-CBR", "region", d.region, "wales");
  checkVal("decode-CBR", "kind", d.kind, "flat-rate");
  checkVal("decode-CBR", "comparable", d.comparable, true);
}

// Rubbish: not recognised.
{
  const d = decodeTaxCode("HELLO");
  checkVal("decode-rubbish", "recognised", d.recognised, false);
  checkVal("decode-rubbish", "comparable", d.comparable, false);
}

// --- Money cases (salary £30,000 unless stated) ------------------------
// Standard at £30,000: allowance £12,570 → taxable £17,430, all at
// 20% → tax £3,486.00. (Same hand figures as verify-payslip Case A.)

// 1257L at £30,000 — and the reuse proof against calculateTakeHome.
{
  const r = checkTaxCode("1257L", 30000);
  checkNum("1257L@30k", "taxUnderCode", r.taxUnderCode, 3486);
  checkNum("1257L@30k", "taxUnderStandard", r.taxUnderStandard, 3486);
  checkNum("1257L@30k", "differencePerYear", r.differencePerYear, 0);
  checkNum(
    "1257L@30k",
    "takehome-equality",
    r.taxUnderCode,
    calculateTakeHome({ annualSalary: 30000 }).incomeTax,
  );
}

// 1257L at £40,000: taxable £27,430 at 20% → £5,486; still equal to
// the take-home calculator.
{
  const r = checkTaxCode("1257L", 40000);
  checkNum("1257L@40k", "taxUnderCode", r.taxUnderCode, 5486);
  checkNum(
    "1257L@40k",
    "takehome-equality",
    r.taxUnderCode,
    calculateTakeHome({ annualSalary: 40000 }).incomeTax,
  );
}

// 1257L at £110,000 — the taper case. Personal Allowance
// £12,570 − £5,000 (half of the £10,000 over £100,000) = £7,570.
// Taxable £102,430: £37,700 at 20% = £7,540; £64,730 at 40% =
// £25,892; total £33,432 — the same figure verify-payslip proves
// through the HMRC-code route (757L at £110,000).
{
  const r = checkTaxCode("1257L", 110000);
  checkNum("1257L@110k", "taxUnderCode", r.taxUnderCode, 33432);
  checkNum(
    "1257L@110k",
    "takehome-equality",
    r.taxUnderCode,
    calculateTakeHome({ annualSalary: 110000 }).incomeTax,
  );
}

// BR at £30,000: flat 20% of the FULL £30,000 (no allowance) =
// £6,000 — £2,514 a year (£209.50 a month) more than 1257L.
{
  const r = checkTaxCode("BR", 30000);
  checkNum("BR@30k", "taxUnderCode", r.taxUnderCode, 6000);
  checkNum("BR@30k", "differencePerYear", r.differencePerYear, 2514);
  checkNum("BR@30k", "differencePerMonth", r.differencePerMonth, 209.5);
}

// D0 at £30,000: flat 40% of £30,000 = £12,000.
{
  const r = checkTaxCode("D0", 30000);
  checkNum("D0@30k", "taxUnderCode", r.taxUnderCode, 12000);
  checkNum("D0@30k", "differencePerYear", r.differencePerYear, 8514);
}

// 0T at £30,000: no allowance, bands apply: £30,000 all inside the
// £37,700 basic band at 20% = £6,000 (same total as BR at this
// salary — the two diverge only once pay passes the basic band).
{
  const r = checkTaxCode("0T", 30000);
  checkNum("0T@30k", "taxUnderCode", r.taxUnderCode, 6000);
}

// 1100L at £30,000: taxable £19,000 at 20% = £3,800 (£314 more).
{
  const r = checkTaxCode("1100L", 30000);
  checkNum("1100L@30k", "taxUnderCode", r.taxUnderCode, 3800);
  checkNum("1100L@30k", "differencePerYear", r.differencePerYear, 314);
}

// K475 at £30,000: taxable £30,000 + £4,750 = £34,750 at 20% =
// £6,950 (£3,464 more than standard).
{
  const r = checkTaxCode("K475", 30000);
  checkNum("K475@30k", "taxUnderCode", r.taxUnderCode, 6950);
  checkNum("K475@30k", "differencePerYear", r.differencePerYear, 3464);
}

// NT at £30,000: no tax at all — £3,486 less than standard.
{
  const r = checkTaxCode("NT", 30000);
  checkNum("NT@30k", "taxUnderCode", r.taxUnderCode, 0);
  checkNum("NT@30k", "differencePerYear", r.differencePerYear, -3486);
}

// 1257L W1 at £30,000: emergency basis changes within-year timing,
// not the annual total on a steady salary — still £3,486.
{
  const r = checkTaxCode("1257L W1", 30000);
  checkNum("W1@30k", "taxUnderCode", r.taxUnderCode, 3486);
}

// C1257L at £30,000: Welsh standard code, same figure.
{
  const r = checkTaxCode("C1257L", 30000);
  checkNum("C1257L@30k", "taxUnderCode", r.taxUnderCode, 3486);
}

// SD2 at £30,000: decoded but no comparison figure, by design.
{
  const r = checkTaxCode("SD2", 30000);
  checkNum("SD2@30k", "taxUnderCode", r.taxUnderCode, null);
  checkNum("SD2@30k", "differencePerYear", r.differencePerYear, null);
}

// No salary: decode only.
{
  const r = checkTaxCode("1257L", null);
  checkNum("nosalary", "taxUnderCode", r.taxUnderCode, null);
  checkVal("nosalary", "recognised", r.recognised, true);
}

if (failures > 0) {
  console.error(`\nverify-taxcode: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-taxcode: all hand-computed checks passed");
