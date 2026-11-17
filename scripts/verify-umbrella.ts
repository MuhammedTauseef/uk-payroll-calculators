/**
 * Hand-computed verification of the umbrella company maths.
 *
 * Run with:  npm run verify:umbrella
 *
 * Model (src/lib/umbrella.ts): the assignment income first covers
 * the umbrella margin, employer NI (15% of salary above £5,000) and
 * the apprenticeship levy (0.5% of salary); what is left is the gross
 * salary, taxed with the verified 2026/27 take-home functions. Every
 * expected value below is worked out by hand. Exits non-zero on any
 * disagreement.
 */
import {
  calculateUmbrella,
  type UmbrellaInput,
} from "../src/lib/umbrella.ts";

let failures = 0;

function check(
  name: string,
  input: UmbrellaInput,
  expected: {
    assignmentIncome: number;
    grossSalary: number;
    employerNi: number;
    apprenticeshipLevy: number;
    netAnnual: number;
  },
) {
  const actual = calculateUmbrella(input);
  const pairs: [string, number, number][] = [
    ["assignmentIncome", actual.assignmentIncome, expected.assignmentIncome],
    ["grossSalary", actual.grossSalary, expected.grossSalary],
    ["employerNi", actual.employerNi, expected.employerNi],
    ["apprenticeshipLevy", actual.apprenticeshipLevy, expected.apprenticeshipLevy],
    ["netAnnual", actual.takeHome.netAnnual, expected.netAnnual],
  ];
  for (const [k, got, want] of pairs) {
    if (Math.abs(got - want) < 0.015) {
      console.log(`ok   ${name} ${k}: ${got}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${got}, expected ${want}`);
    }
  }
  // The identity that defines the model: every pound of assignment
  // income is margin, employer NI, levy or gross salary.
  const accounted =
    actual.marginAnnual +
    actual.employerNi +
    actual.apprenticeshipLevy +
    actual.grossSalary;
  if (Math.abs(accounted - actual.assignmentIncome) < 0.02) {
    console.log(`ok   ${name} identity: parts sum to the assignment income`);
  } else {
    failures++;
    console.error(
      `FAIL ${name} identity: parts ${accounted} ≠ assignment ${actual.assignmentIncome}`,
    );
  }
}

// £300 a day, 5 days a week, 46 weeks, £25 a week margin:
//   assignment = £300 × 5 × 46 = £69,000; margin = £1,150
//   salary = (£67,850 + £750) ÷ 1.155 = £59,393.94
//   employer NI = 15% × £54,393.94 = £8,159.09; levy = £296.97
//   tax on £59,393.94 = £7,540 + £9,123.94 × 40% = £11,189.58
//   NI = £3,016 + £9,123.94 × 2% = £3,198.48 → net £45,005.88
check(
  "£300/day, 46 weeks",
  { rate: 300, rateType: "day", hoursPerDay: 7.5, daysPerWeek: 5, weeksPerYear: 46, marginPerWeek: 25 },
  {
    assignmentIncome: 69000,
    grossSalary: 59393.94,
    employerNi: 8159.09,
    apprenticeshipLevy: 296.97,
    netAnnual: 45005.88,
  },
);

// £25 an hour, 7.5 hours a day, 5 days a week, 46 weeks, £20 margin:
//   assignment = £25 × 7.5 × 5 × 46 = £43,125; margin = £920
//   salary = (£42,205 + £750) ÷ 1.155 = £37,190.48
//   employer NI = 15% × £32,190.48 = £4,828.57; levy = £185.95
//   tax = £24,620.48 × 20% = £4,924.10; NI = £24,620.48 × 8%
//   = £1,969.64 → net £30,296.74
check(
  "£25/hour, 46 weeks",
  { rate: 25, rateType: "hour", hoursPerDay: 7.5, daysPerWeek: 5, weeksPerYear: 46, marginPerWeek: 20 },
  {
    assignmentIncome: 43125,
    grossSalary: 37190.48,
    employerNi: 4828.57,
    apprenticeshipLevy: 185.95,
    netAnnual: 30296.74,
  },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll umbrella checks passed");
