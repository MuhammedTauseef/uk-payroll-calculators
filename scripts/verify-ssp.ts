/**
 * Hand-computed verification of the SSP calculator maths.
 *
 * Run with:  npm run verify:ssp
 *
 * Each case below was worked out by hand from the April 2026 rules first;
 * the script then checks calculateSsp() against those expected figures.
 * Exits non-zero if any figure disagrees.
 */
import { calculateSsp } from "../src/lib/ssp.ts";
import type { SspInput, SspResult } from "../src/lib/ssp.ts";

interface Case {
  name: string;
  input: SspInput;
  expected: Pick<
    SspResult,
    | "weeklyRate"
    | "rateBasis"
    | "dailyRate"
    | "daysPayable"
    | "daysNotPayable"
    | "cappedByLinkedPeriod"
    | "totalPayable"
  >;
}

const cases: Case[] = [
  {
    // Hand maths: 80% of £500 = £400, so the £123.25 cap is lower.
    // Daily rate = 123.25 / 5 = £24.65. 6 days payable (no waiting days).
    // Total = 24.65 x 6 = £147.90.
    name: "Case 1 — AWE £500/wk, 5 qualifying days, 6 days absent (flat cap applies)",
    input: { averageWeeklyEarnings: 500, qualifyingDaysPerWeek: 5, daysAbsent: 6 },
    expected: {
      weeklyRate: 123.25,
      rateBasis: "statutory-cap",
      dailyRate: 24.65,
      daysPayable: 6,
      daysNotPayable: 0,
      cappedByLinkedPeriod: false,
      totalPayable: 147.9,
    },
  },
  {
    // Hand maths: 80% of £100 = £80, which is LOWER than £123.25, so the
    // 80% rule bites. Daily rate = 80 / 5 = £16.00. Total = 16 x 6 = £96.00.
    name: "Case 2 — AWE £100/wk, 5 qualifying days, 6 days absent (80% rule bites)",
    input: { averageWeeklyEarnings: 100, qualifyingDaysPerWeek: 5, daysAbsent: 6 },
    expected: {
      weeklyRate: 80,
      rateBasis: "eighty-percent",
      dailyRate: 16,
      daysPayable: 6,
      daysNotPayable: 0,
      cappedByLinkedPeriod: false,
      totalPayable: 96,
    },
  },
  {
    // Hand maths: entitlement = 28 weeks x 5 days = 140 days. Linked spell
    // already used 138, so only 2 of the 6 absent days are payable.
    // Total = 24.65 x 2 = £49.30; 4 days not payable; cap flag = true.
    name: "Case 3 — AWE £500/wk, 5 qualifying days, 6 days absent, 138 linked days already paid (28-week cap)",
    input: {
      averageWeeklyEarnings: 500,
      qualifyingDaysPerWeek: 5,
      daysAbsent: 6,
      linkedSicknessDaysPaid: 138,
    },
    expected: {
      weeklyRate: 123.25,
      rateBasis: "statutory-cap",
      dailyRate: 24.65,
      daysPayable: 2,
      daysNotPayable: 4,
      cappedByLinkedPeriod: true,
      totalPayable: 49.3,
    },
  },
];

let failures = 0;

for (const c of cases) {
  const actual = calculateSsp(c.input);
  const keys = Object.keys(c.expected) as (keyof Case["expected"])[];
  const mismatches = keys.filter((k) => actual[k] !== c.expected[k]);
  if (mismatches.length === 0) {
    console.log(`PASS  ${c.name}`);
    console.log(
      `      weekly £${actual.weeklyRate} (${actual.rateBasis}), daily £${actual.dailyRate}, ` +
        `${actual.daysPayable} days payable, total £${actual.totalPayable}`,
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
console.log("\nAll SSP maths cases passed.");
