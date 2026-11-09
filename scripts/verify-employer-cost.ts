/**
 * Hand-computed verification of the employer cost maths.
 *
 * Run with:  npm run verify:employer-cost
 *
 * Every case below was worked out by hand first from GOV.UK rates
 * (2026/27, held as constants in src/lib/rates.ts):
 *   - Employer Class 1 NICs: 15% of the salary above the £5,000
 *     Secondary Threshold.
 *   - Employer pension: the chosen % of qualifying earnings — the
 *     salary slice inside the £6,240–£50,270 band.
 *   - Other employer costs are added exactly as entered.
 * Money lines are rounded to the cent and totals are built from the
 * unrounded lines, matching the house display rule.
 * Exits non-zero if any figure disagrees.
 */
import { calculateEmployerCost } from "../src/lib/employerCost.ts";
import type { EmployerCostInput } from "../src/lib/employerCost.ts";

let failures = 0;

function check(label: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.005) {
    failures++;
    console.log(`FAIL ${label}: expected ${expected}, got ${actual}`);
  } else {
    console.log(`ok   ${label}: ${actual}`);
  }
}

function runCase(
  name: string,
  input: EmployerCostInput,
  expected: Record<string, number>,
) {
  console.log(`\n— ${name}`);
  const r = calculateEmployerCost(input);
  for (const [key, value] of Object.entries(expected)) {
    check(key, (r as unknown as Record<string, number>)[key], value);
  }
}

// Case 1: £30,000 salary, pension at the 3% auto-enrolment minimum,
// no other costs.
//   NI:      (30,000 − 5,000) × 15%            = 3,750.00
//   QE:      30,000 − 6,240                    = 23,760
//   Pension: 23,760 × 3%                       = 712.80
//   Total:   30,000 + 3,750 + 712.80           = 34,462.80
runCase(
  "Case 1 — £30,000, pension 3%, no other costs",
  { annualGrossSalary: 30000, employerPensionPercent: 3, otherEmployerCostsAnnual: 0 },
  {
    earningsAboveThreshold: 25000,
    employerNiPerYear: 3750,
    employerNiPerMonth: 312.5,
    qualifyingEarnings: 23760,
    employerPensionPerYear: 712.8,
    employerPensionPerMonth: 59.4,
    onCostsPerYear: 4462.8,
    totalCostPerYear: 34462.8,
    totalCostPerMonth: 2871.9,
    costUpliftPercent: 14.88,
    totalCostMultiple: 1.15,
  },
);

// Case 2: £50,000 salary, pension 3%, no other costs.
//   NI:      (50,000 − 5,000) × 15%            = 6,750.00
//   QE:      50,000 − 6,240                    = 43,760
//   Pension: 43,760 × 3%                       = 1,312.80
//   Total:   50,000 + 6,750 + 1,312.80         = 58,062.80
runCase(
  "Case 2 — £50,000, pension 3%, no other costs",
  { annualGrossSalary: 50000, employerPensionPercent: 3, otherEmployerCostsAnnual: 0 },
  {
    earningsAboveThreshold: 45000,
    employerNiPerYear: 6750,
    employerNiPerMonth: 562.5,
    qualifyingEarnings: 43760,
    employerPensionPerYear: 1312.8,
    employerPensionPerMonth: 109.4,
    onCostsPerYear: 8062.8,
    totalCostPerYear: 58062.8,
    costUpliftPercent: 16.13,
    totalCostMultiple: 1.16,
  },
);

// Case 3: £20,000 salary, pension 5%, £1,200 of other costs.
//   NI:      (20,000 − 5,000) × 15%            = 2,250.00
//   QE:      20,000 − 6,240                    = 13,760
//   Pension: 13,760 × 5%                       = 688.00
//   Total:   20,000 + 2,250 + 688 + 1,200      = 24,138.00
runCase(
  "Case 3 — £20,000, pension 5%, £1,200 other costs",
  { annualGrossSalary: 20000, employerPensionPercent: 5, otherEmployerCostsAnnual: 1200 },
  {
    earningsAboveThreshold: 15000,
    employerNiPerYear: 2250,
    employerNiPerMonth: 187.5,
    qualifyingEarnings: 13760,
    employerPensionPerYear: 688,
    employerPensionPerMonth: 57.33,
    otherCostsPerYear: 1200,
    otherCostsPerMonth: 100,
    onCostsPerYear: 4138,
    totalCostPerYear: 24138,
    totalCostPerMonth: 2011.5,
    costUpliftPercent: 20.69,
    totalCostMultiple: 1.21,
  },
);

// Case 4: £60,000 salary, pension 3% — above the top of the pension
// band, so qualifying earnings cap at 50,270 − 6,240 = 44,030.
//   NI:      (60,000 − 5,000) × 15%            = 8,250.00
//   Pension: 44,030 × 3%                       = 1,320.90
//   Total:   60,000 + 8,250 + 1,320.90         = 69,570.90
runCase(
  "Case 4 — £60,000, pension 3% (qualifying earnings capped)",
  { annualGrossSalary: 60000, employerPensionPercent: 3, otherEmployerCostsAnnual: 0 },
  {
    employerNiPerYear: 8250,
    qualifyingEarnings: 44030,
    employerPensionPerYear: 1320.9,
    totalCostPerYear: 69570.9,
    costUpliftPercent: 15.95,
  },
);

// Case 5: £5,000 salary — exactly at the Secondary Threshold and
// below the pension band, so both charges are zero.
runCase(
  "Case 5 — £5,000 (at the threshold, below the pension band)",
  { annualGrossSalary: 5000, employerPensionPercent: 3, otherEmployerCostsAnnual: 0 },
  {
    earningsAboveThreshold: 0,
    employerNiPerYear: 0,
    qualifyingEarnings: 0,
    employerPensionPerYear: 0,
    onCostsPerYear: 0,
    totalCostPerYear: 5000,
    costUpliftPercent: 0,
    totalCostMultiple: 1,
  },
);

if (failures > 0) {
  console.log(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll employer cost checks passed.");
