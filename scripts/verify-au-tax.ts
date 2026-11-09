/**
 * Hand-computed verification of the Australia tax-rate maths.
 *
 * Run with:  npm run verify:au-tax
 *
 * Every case below was worked out by hand first from ATO sources
 * (re-read 9 November 2026):
 *   - ATO, "Tax rates – Australian resident", 2025–26 table:
 *     0–$18,200 nil; 16c over $18,200 to $45,000 ($4,288); 30c to
 *     $135,000 ($31,288); 37c to $190,000 ($51,638); 45c above.
 *   - ATO, "Tax rates – foreign resident", 2025–26 table:
 *     30c from the first dollar to $135,000 ($40,500); 37c to
 *     $190,000 ($60,850); 45c above. No Medicare levy.
 *   - Medicare levy 2% of taxable income when it applies.
 * Money lines are rounded to the cent and totals are built from
 * the rounded lines (the house display rule).
 * Exits non-zero if any figure disagrees.
 */
import { calculateAuTax } from "../src/lib/au-tax.ts";
import type { AuTaxInput } from "../src/lib/au-tax.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.005) {
    failures++;
    console.log(`FAIL ${label}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`ok   ${label}: ${actual}`);
  }
}

function checkPercent(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.011) {
    failures++;
    console.log(`FAIL ${label}: expected ~${expected}, got ${actual}`);
  } else {
    console.log(`ok   ${label}: ${actual}`);
  }
}

function runCase(
  name: string,
  input: AuTaxInput,
  expected: Record<string, number>,
  expectedPercent: Record<string, number> = {},
) {
  console.log(`\n— ${name}`);
  const r = calculateAuTax(input);
  for (const [key, value] of Object.entries(expected)) {
    check(key, (r as unknown as Record<string, number>)[key], value);
  }
  for (const [key, value] of Object.entries(expectedPercent)) {
    checkPercent(key, (r as unknown as Record<string, number>)[key], value);
  }
}

// Case 1: $60,000, resident, Medicare levy on.
//   Tax: $4,288 + 30% × ($60,000 − $45,000) = 4,288 + 4,500 = 8,788.
//   Levy: 2% × 60,000 = 1,200. Total 9,988; net 50,012.
//   Marginal 30% (32% with levy); effective 9,988/60,000 = 16.65%.
runCase(
  "Case 1 — $60,000, resident, levy on",
  { taxableIncome: 60000, residency: "resident", medicareLevyApplies: true },
  {
    incomeTax: 8788,
    medicareLevy: 1200,
    totalTax: 9988,
    netIncome: 50012,
    marginalTaxRatePercent: 30,
    marginalRatePercent: 32,
  },
  { effectiveTaxRatePercent: 16.65 },
);

// Case 2: $100,000, resident, Medicare levy on.
//   Tax: 4,288 + 30% × 55,000 = 20,788. Levy 2,000.
//   Total 22,788; net 77,212; effective 22.79%.
runCase(
  "Case 2 — $100,000, resident, levy on",
  { taxableIncome: 100000, residency: "resident", medicareLevyApplies: true },
  {
    incomeTax: 20788,
    medicareLevy: 2000,
    totalTax: 22788,
    netIncome: 77212,
    marginalTaxRatePercent: 30,
    marginalRatePercent: 32,
  },
  { effectiveTaxRatePercent: 22.79 },
);

// Case 3: $200,000, resident, Medicare levy on.
//   Tax: $51,638 + 45% × 10,000 = 56,138. Levy 4,000.
//   Total 60,138; net 139,862; effective 30.07%.
runCase(
  "Case 3 — $200,000, resident, levy on",
  { taxableIncome: 200000, residency: "resident", medicareLevyApplies: true },
  {
    incomeTax: 56138,
    medicareLevy: 4000,
    totalTax: 60138,
    netIncome: 139862,
    marginalTaxRatePercent: 45,
    marginalRatePercent: 47,
  },
  { effectiveTaxRatePercent: 30.07 },
);

// Case 4: $100,000, NON-resident, Medicare off (always $0 for
//   non-residents). Tax: 30% × 100,000 = 30,000 from dollar one —
//   no tax-free threshold. Net 70,000; effective 30%.
runCase(
  "Case 4 — $100,000, non-resident, no levy",
  {
    taxableIncome: 100000,
    residency: "nonResident",
    medicareLevyApplies: false,
  },
  {
    incomeTax: 30000,
    medicareLevy: 0,
    totalTax: 30000,
    netIncome: 70000,
    marginalTaxRatePercent: 30,
    marginalRatePercent: 30,
  },
  { effectiveTaxRatePercent: 30 },
);

// Case 5: the page's worked example — $90,000, resident, levy on.
//   Tax: 4,288 + 30% × 45,000 = 17,788. Levy 1,800.
//   Total 19,588; net 70,412; effective 21.76%.
runCase(
  "Case 5 — $90,000, resident, levy on (page example)",
  { taxableIncome: 90000, residency: "resident", medicareLevyApplies: true },
  {
    incomeTax: 17788,
    medicareLevy: 1800,
    totalTax: 19588,
    netIncome: 70412,
    marginalTaxRatePercent: 30,
    marginalRatePercent: 32,
  },
  { effectiveTaxRatePercent: 21.76 },
);

// Case 6: bracket boundaries, resident, levy off — the tax at a
//   threshold equals the ATO's printed base for the next bracket.
runCase(
  "Case 6a — $18,200, resident, levy off (threshold top)",
  { taxableIncome: 18200, residency: "resident", medicareLevyApplies: false },
  { incomeTax: 0, totalTax: 0, netIncome: 18200 },
);
runCase(
  "Case 6b — $45,000, resident, levy off",
  { taxableIncome: 45000, residency: "resident", medicareLevyApplies: false },
  { incomeTax: 4288, totalTax: 4288, netIncome: 40712 },
);
runCase(
  "Case 6c — $135,000, resident, levy off",
  { taxableIncome: 135000, residency: "resident", medicareLevyApplies: false },
  { incomeTax: 31288, totalTax: 31288, netIncome: 103712 },
);
runCase(
  "Case 6d — $190,000, resident, levy off",
  { taxableIncome: 190000, residency: "resident", medicareLevyApplies: false },
  { incomeTax: 51638, totalTax: 51638, netIncome: 138362 },
);
runCase(
  "Case 6e — $135,000, non-resident (first-bracket top)",
  {
    taxableIncome: 135000,
    residency: "nonResident",
    medicareLevyApplies: false,
  },
  { incomeTax: 40500, totalTax: 40500, netIncome: 94500 },
);

// Case 7: the page's comparison rows, resident, levy on.
//   $50,000: 4,288 + 30% × 5,000 = 5,788; levy 1,000; net 43,212.
//   $150,000: 31,288 + 37% × 15,000 = 36,838; levy 3,000;
//   net 110,162.
runCase(
  "Case 7a — $50,000, resident, levy on",
  { taxableIncome: 50000, residency: "resident", medicareLevyApplies: true },
  { incomeTax: 5788, medicareLevy: 1000, totalTax: 6788, netIncome: 43212 },
  { effectiveTaxRatePercent: 13.58 },
);
runCase(
  "Case 7b — $150,000, resident, levy on",
  { taxableIncome: 150000, residency: "resident", medicareLevyApplies: true },
  {
    incomeTax: 36838,
    medicareLevy: 3000,
    totalTax: 39838,
    netIncome: 110162,
  },
  { effectiveTaxRatePercent: 26.56 },
);

// Case 8: non-resident with the levy toggle left ON — the levy
//   must still be $0 (ATO: foreign residents are not required to
//   pay the Medicare levy).
runCase(
  "Case 8 — $100,000, non-resident, levy toggle on (still $0)",
  {
    taxableIncome: 100000,
    residency: "nonResident",
    medicareLevyApplies: true,
  },
  { incomeTax: 30000, medicareLevy: 0, totalTax: 30000, netIncome: 70000 },
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll Australia tax checks passed.");
