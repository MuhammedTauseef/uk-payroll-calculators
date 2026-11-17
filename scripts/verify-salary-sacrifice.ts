/**
 * Hand-computed verification of the salary sacrifice maths.
 *
 * Run with:  npm run verify:salary-sacrifice
 *
 * 2026/27 bands (rates.ts): Personal Allowance £12,570; 20% to
 * £37,700 of taxable income, 40% above; employee NI 8% from £12,570
 * to £50,270, 2% above; employer NI 15% above £5,000. Every expected
 * value below is worked out by hand from those bands. Exits non-zero
 * on any disagreement.
 */
import {
  calculateSalarySacrifice,
  type SalarySacrificeInput,
} from "../src/lib/salary-sacrifice.ts";

let failures = 0;

function check(
  name: string,
  input: SalarySacrificeInput,
  expected: {
    reducedSalary: number;
    incomeTaxSaved: number;
    employeeNiSaved: number;
    totalSaved: number;
    takeHomeCost: number;
    employerNiSaved: number;
  },
) {
  const actual = calculateSalarySacrifice(input);
  for (const k of Object.keys(expected) as (keyof typeof expected)[]) {
    if (Math.abs(actual[k] - expected[k]) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`);
    }
  }
}

// £40,000, sacrificing £200 a month (£2,400 a year):
//   before: tax (£40,000 − £12,570) × 20% = £5,486.00
//           NI  £27,430 × 8% = £2,194.40 → net £32,319.60
//   after (£37,600): tax £25,030 × 20% = £5,006.00
//           NI  £25,030 × 8% = £2,002.40 → net £30,591.60
//   saved: tax £480 + NI £192 = £672; take-home cost £1,728 (72p per
//   £1 into the pension). Employer NI: 15% × £35,000 = £5,250 →
//   15% × £32,600 = £4,890 → £360 saved.
check(
  "£40,000 sacrificing £2,400",
  { grossSalary: 40000, sacrificeAnnual: 2400 },
  {
    reducedSalary: 37600,
    incomeTaxSaved: 480,
    employeeNiSaved: 192,
    totalSaved: 672,
    takeHomeCost: 1728,
    employerNiSaved: 360,
  },
);

// £60,000, sacrificing £5,000 (higher-rate relief):
//   before: tax £7,540 + £9,730 × 40% = £11,432.00
//           NI  £3,016 + £9,730 × 2% = £3,210.60 → net £45,357.40
//   after (£55,000): tax £7,540 + £4,730 × 40% = £9,432.00
//           NI  £3,016 + £4,730 × 2% = £3,110.60 → net £42,457.40
//   saved: tax £2,000 + NI £100 = £2,100; cost £2,900.
//   Employer NI: 15% × £55,000 = £8,250 → 15% × £50,000 = £7,500.
check(
  "£60,000 sacrificing £5,000",
  { grossSalary: 60000, sacrificeAnnual: 5000 },
  {
    reducedSalary: 55000,
    incomeTaxSaved: 2000,
    employeeNiSaved: 100,
    totalSaved: 2100,
    takeHomeCost: 2900,
    employerNiSaved: 750,
  },
);

// No sacrifice: nothing saved, nothing cost.
check(
  "£30,000 sacrificing nothing",
  { grossSalary: 30000, sacrificeAnnual: 0 },
  {
    reducedSalary: 30000,
    incomeTaxSaved: 0,
    employeeNiSaved: 0,
    totalSaved: 0,
    takeHomeCost: 0,
    employerNiSaved: 0,
  },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll salary sacrifice checks passed");
