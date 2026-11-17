/**
 * Hand-computed verification of the Capital Gains Tax maths.
 *
 * Run with:  npm run verify:capital-gains
 *
 * 2026/27 rules from GOV.UK ("Capital Gains Tax — rates and
 * allowances", checked 17 November 2026): £3,000 annual exempt
 * amount; 18% on gains inside the basic-rate band (£37,700 of taxable
 * income), 24% above it. The first two cases are GOV.UK's OWN worked
 * examples for 2026/27 — taxable income £20,000 (an income of £32,570
 * with the full £12,570 Personal Allowance), gains of £12,600 and
 * £52,600. Exits non-zero on any disagreement.
 */
import {
  calculateCapitalGains,
  type CapitalGainsInput,
} from "../src/lib/capital-gains.ts";

let failures = 0;

function check(
  name: string,
  input: CapitalGainsInput,
  expected: { taxableGain: number; gainAtLowerRate?: number; gainAtHigherRate?: number; taxDue: number },
) {
  const actual = calculateCapitalGains(input);
  const pairs: [string, number, number | undefined][] = [
    ["taxableGain", actual.taxableGain, expected.taxableGain],
    ["gainAtLowerRate", actual.gainAtLowerRate, expected.gainAtLowerRate],
    ["gainAtHigherRate", actual.gainAtHigherRate, expected.gainAtHigherRate],
    ["taxDue", actual.taxDue, expected.taxDue],
  ];
  for (const [k, got, want] of pairs) {
    if (want === undefined) continue;
    if (Math.abs(got - want) < 0.005) {
      console.log(`ok   ${name} ${k}: ${got}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${got}, expected ${want}`);
    }
  }
}

// GOV.UK example 1: taxable income £20,000, gains £12,600 → after the
// £3,000 allowance £9,600, all inside the band → 18% → £1,728.
check(
  "GOV.UK example 1 (income £32,570, gains £12,600)",
  { otherIncome: 32570, totalGains: 12600 },
  { taxableGain: 9600, gainAtLowerRate: 9600, gainAtHigherRate: 0, taxDue: 1728 },
);

// GOV.UK example 2: gains £52,600 → £49,600 after the allowance;
// £17,700 of band left at 18% (£3,186) + £31,900 at 24% (£7,656)
// = £10,842.
check(
  "GOV.UK example 2 (income £32,570, gains £52,600)",
  { otherIncome: 32570, totalGains: 52600 },
  { taxableGain: 49600, gainAtLowerRate: 17700, gainAtHigherRate: 31900, taxDue: 10842 },
);

// Gains inside the exempt amount: no tax.
check(
  "Gains £3,000 (inside the allowance)",
  { otherIncome: 32570, totalGains: 3000 },
  { taxableGain: 0, taxDue: 0 },
);

// Higher-rate income (£60,000 → taxable £47,430, band already full):
// a £20,000 gain is £17,000 after the allowance, all at 24% = £4,080.
check(
  "Higher-rate income, gains £20,000",
  { otherIncome: 60000, totalGains: 20000 },
  { taxableGain: 17000, gainAtLowerRate: 0, gainAtHigherRate: 17000, taxDue: 4080 },
);

// Low income (£20,000 → taxable £7,430): a £10,000 gain is £7,000
// after the allowance, all inside the band at 18% = £1,260.
check(
  "Income £20,000, gains £10,000",
  { otherIncome: 20000, totalGains: 10000 },
  { taxableGain: 7000, gainAtLowerRate: 7000, gainAtHigherRate: 0, taxDue: 1260 },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll capital gains checks passed");
