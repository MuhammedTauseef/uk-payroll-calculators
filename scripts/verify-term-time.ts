/**
 * Hand-computed verification of the term-time pay maths.
 *
 * Run with:  npm run verify:term-time
 *
 * The method (see src/lib/term-time.ts): holiday weeks = 5.6 ×
 * (weeks worked ÷ 46.4); paid weeks = weeks worked + holiday weeks;
 * annual pay = FTE salary × (paid weeks ÷ 52.143), scaled by the
 * hours fraction where contracted hours differ. Every expected
 * value below was worked out by hand from that formula — including
 * the headline example and the size of the holiday uplift against
 * the no-uplift shortcut. Exits non-zero on any disagreement.
 */
import {
  calculateTermTime,
  type TermTimeInput,
} from "../src/lib/term-time.ts";

let failures = 0;

function check(
  name: string,
  input: TermTimeInput,
  expected: {
    holidayWeeks: number;
    paidWeeks: number;
    annualPay: number;
    monthlyPay: number;
    withoutUpliftAnnual?: number;
    upliftAmount?: number;
  },
) {
  const actual = calculateTermTime(input);
  for (const k of [
    "holidayWeeks",
    "paidWeeks",
    "annualPay",
    "monthlyPay",
  ] as const) {
    if (Math.abs(actual[k] - expected[k]) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(
        `FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`,
      );
    }
  }
  for (const k of ["withoutUpliftAnnual", "upliftAmount"] as const) {
    if (expected[k] === undefined) continue;
    if (Math.abs(actual[k] - (expected[k] as number)) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(
        `FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`,
      );
    }
  }
}

const base: TermTimeInput = {
  fteAnnualSalary: 24000,
  workingWeeksPerYear: 39,
  fullTimeHoursPerWeek: 37.5,
  contractedHoursPerWeek: 37.5,
};

// Headline worked example, by hand:
//   holiday weeks = 5.6 × 39 ÷ 46.4 = 4.7069 → 4.71
//   paid weeks    = 39 + 4.7069 = 43.7069 → 43.71
//   annual pay    = £24,000 × 43.7069 ÷ 52.143 = £20,117.09
//   monthly       = £20,117.09 ÷ 12 = £1,676.42
//   no-uplift     = £24,000 × 39 ÷ 52.143 = £17,950.64
//   uplift        = £20,117.09 − £17,950.64 = £2,166.46 (exact diff)
check("£24,000 FTE, 39 weeks, full-time hours", base, {
  holidayWeeks: 4.71,
  paidWeeks: 43.71,
  annualPay: 20117.09,
  monthlyPay: 1676.42,
  withoutUpliftAnnual: 17950.64,
  upliftAmount: 2166.46,
});

// 38 weeks on £20,000:
//   holiday = 5.6 × 38 ÷ 46.4 = 4.5862 → 4.59; paid = 42.5862 → 42.59
//   annual  = £20,000 × 42.5862 ÷ 52.143 = £16,334.39
//   monthly = £1,361.20
check(
  "£20,000 FTE, 38 weeks",
  { ...base, fteAnnualSalary: 20000, workingWeeksPerYear: 38 },
  {
    holidayWeeks: 4.59,
    paidWeeks: 42.59,
    annualPay: 16334.39,
    monthlyPay: 1361.2,
  },
);

// Hours adjustment: same as the headline but 30 of 37.5 hours
// (0.8) → £20,117.09 × 0.8 = £16,093.67 a year, £1,341.14 a month.
check(
  "£24,000 FTE, 39 weeks, 30 of 37.5 hours",
  { ...base, contractedHoursPerWeek: 30 },
  {
    holidayWeeks: 4.71,
    paidWeeks: 43.71,
    annualPay: 16093.67,
    monthlyPay: 1341.14,
  },
);

// 40 weeks on £30,000:
//   holiday = 5.6 × 40 ÷ 46.4 = 4.8276 → 4.83; paid = 44.8276 → 44.83
//   annual  = £30,000 × 44.8276 ÷ 52.143 = £25,791.14
//   monthly = £2,149.26
check(
  "£30,000 FTE, 40 weeks",
  { ...base, fteAnnualSalary: 30000, workingWeeksPerYear: 40 },
  {
    holidayWeeks: 4.83,
    paidWeeks: 44.83,
    annualPay: 25791.14,
    monthlyPay: 2149.26,
  },
);

// The uplift is never optional: on the headline figures the
// shortcut loses £2,166.46 a year — pinned here so a future edit
// cannot quietly drop the holiday weeks.
{
  const r = calculateTermTime(base);
  if (r.upliftAmount > 0 && r.annualPay > r.withoutUpliftAnnual) {
    console.log(
      `ok   uplift present: +£${r.upliftAmount} over the no-uplift shortcut`,
    );
  } else {
    failures++;
    console.error(
      `FAIL uplift missing: annual £${r.annualPay}, shortcut £${r.withoutUpliftAnnual}`,
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll term-time checks passed");
