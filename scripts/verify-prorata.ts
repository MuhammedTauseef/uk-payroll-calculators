/**
 * Hand-computed verification of the pro-rata salary calculator maths.
 *
 * Run with:  npm run verify:prorata
 *
 * Each case below was worked out by hand first (fraction, then money,
 * then the 5.6-weeks statutory holiday in days); the script then checks
 * calculateProRata() against those expected figures. Exits non-zero if
 * any figure disagrees.
 */
import { calculateProRata } from "../src/lib/prorata.ts";
import type { ProRataInput, ProRataResult } from "../src/lib/prorata.ts";

interface Case {
  name: string;
  input: ProRataInput;
  expected: Pick<
    ProRataResult,
    | "fteFraction"
    | "annualSalary"
    | "monthlySalary"
    | "weeklySalary"
    | "holidayBasisDaysPerWeek"
    | "holidayDaysPerYear"
  >;
}

const cases: Case[] = [
  {
    // Hand maths: 22.5 ÷ 37.5 = 0.6 FTE. £40,000 × 0.6 = £24,000/yr;
    // ÷ 12 = £2,000/mo; ÷ 52 = £461.54/wk. Holiday: 5.6 × 3 days = 16.8.
    name: "Case 1 — £40,000 FTE, 22.5 of 37.5 hours (0.6 FTE)",
    input: {
      fullTimeAnnualSalary: 40000,
      mode: "hours",
      fullTimeHoursPerWeek: 37.5,
      partTimeHoursPerWeek: 22.5,
      fullTimeDaysPerWeek: 5,
      partTimeDaysPerWeek: 3,
    },
    expected: {
      fteFraction: 0.6,
      annualSalary: 24000,
      monthlySalary: 2000,
      weeklySalary: 461.54,
      holidayBasisDaysPerWeek: 3,
      holidayDaysPerYear: 16.8,
    },
  },
  {
    // Hand maths (days mode): 4 ÷ 5 = 0.8 FTE. £52,000 × 0.8 = £41,600/yr;
    // ÷ 12 = £3,466.67/mo; ÷ 52 = £800/wk. Holiday: 5.6 × 4 = 22.4 days.
    name: "Case 2 — £52,000 FTE, 4 of 5 days (days mode, 0.8 FTE)",
    input: {
      fullTimeAnnualSalary: 52000,
      mode: "days",
      fullTimeHoursPerWeek: 37.5,
      partTimeHoursPerWeek: 30,
      fullTimeDaysPerWeek: 5,
      partTimeDaysPerWeek: 4,
    },
    expected: {
      fteFraction: 0.8,
      annualSalary: 41600,
      monthlySalary: 3466.67,
      weeklySalary: 800,
      holidayBasisDaysPerWeek: 4,
      holidayDaysPerYear: 22.4,
    },
  },
  {
    // Hand maths: 10 ÷ 40 = 0.25 FTE. £30,000 × 0.25 = £7,500/yr;
    // ÷ 12 = £625/mo; ÷ 52 = £144.23/wk. No part-time days entered, so
    // the holiday basis is derived: 5 full-time days × 0.25 = 1.25 days;
    // 5.6 × 1.25 = 7.0 days.
    name: "Case 3 — £30,000 FTE, 10 of 40 hours, holiday basis derived (0.25 FTE)",
    input: {
      fullTimeAnnualSalary: 30000,
      mode: "hours",
      fullTimeHoursPerWeek: 40,
      partTimeHoursPerWeek: 10,
      fullTimeDaysPerWeek: 5,
      partTimeDaysPerWeek: 0,
    },
    expected: {
      fteFraction: 0.25,
      annualSalary: 7500,
      monthlySalary: 625,
      weeklySalary: 144.23,
      holidayBasisDaysPerWeek: 1.25,
      holidayDaysPerYear: 7,
    },
  },
  {
    // Hand maths (cap): 45 part-time hours against a 37.5-hour full-time
    // week would be 1.2, but the FTE fraction caps at 1.0, so the salary
    // is the full £40,000; ÷ 12 = £3,333.33; ÷ 52 = £769.23.
    // Holiday: 5.6 × 5 days = 28 days.
    name: "Case 4 — part-time hours above full-time (fraction capped at 1.0)",
    input: {
      fullTimeAnnualSalary: 40000,
      mode: "hours",
      fullTimeHoursPerWeek: 37.5,
      partTimeHoursPerWeek: 45,
      fullTimeDaysPerWeek: 5,
      partTimeDaysPerWeek: 5,
    },
    expected: {
      fteFraction: 1,
      annualSalary: 40000,
      monthlySalary: 3333.33,
      weeklySalary: 769.23,
      holidayBasisDaysPerWeek: 5,
      holidayDaysPerYear: 28,
    },
  },
  {
    // Hand maths (zero salary): 18.75 ÷ 37.5 = 0.5 FTE, but the salary
    // is £0, so every money figure is £0. Holiday: 5.6 × 2.5 days = 14.
    name: "Case 5 — £0 full-time salary (money all zero, fraction still computed)",
    input: {
      fullTimeAnnualSalary: 0,
      mode: "hours",
      fullTimeHoursPerWeek: 37.5,
      partTimeHoursPerWeek: 18.75,
      fullTimeDaysPerWeek: 5,
      partTimeDaysPerWeek: 2.5,
    },
    expected: {
      fteFraction: 0.5,
      annualSalary: 0,
      monthlySalary: 0,
      weeklySalary: 0,
      holidayBasisDaysPerWeek: 2.5,
      holidayDaysPerYear: 14,
    },
  },
];

let failures = 0;

for (const c of cases) {
  const actual = calculateProRata(c.input);
  const keys = Object.keys(c.expected) as (keyof Case["expected"])[];
  const mismatches = keys.filter((k) => actual[k] !== c.expected[k]);
  if (mismatches.length === 0) {
    console.log(`PASS  ${c.name}`);
    console.log(
      `      ${actual.fteFraction} FTE, ${actual.annualSalary}/yr, ` +
        `${actual.monthlySalary}/mo, ${actual.weeklySalary}/wk, ` +
        `holiday ${actual.holidayDaysPerYear} days`,
    );
  } else {
    failures++;
    console.log(`FAIL  ${c.name}`);
    for (const k of mismatches) {
      console.log(`      ${k}: expected ${c.expected[k]}, got ${actual[k]}`);
    }
  }
}

if (failures > 0) {
  console.log(`\n${failures} case(s) FAILED`);
  process.exit(1);
}
console.log("\nAll pro-rata maths cases passed.");
