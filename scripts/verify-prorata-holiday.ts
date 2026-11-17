/**
 * Hand-computed verification of the pro-rata holiday entitlement
 * maths.
 *
 * Run with:  npm run verify:prorata-holiday
 *
 * Cases worked out by hand from the rules (Working Time Regulations
 * 1998; GOV.UK holiday entitlement guidance, checked 16 Nov 2026):
 * contractual pro-rata = full-time entitlement × days ratio; the
 * statutory floor is 5.6 × days per week (capped at 28) and replaces
 * the contract figure when it is higher; mid-year starters/leavers
 * scale by twelfths with the part-year figure rounded up to the
 * nearest half day. Exits non-zero if any figure disagrees.
 */
import {
  calculateProRataHoliday,
  type ProRataHolidayInput,
} from "../src/lib/prorata-holiday.ts";

let failures = 0;

function check(
  name: string,
  input: ProRataHolidayInput,
  expected: {
    contractualDays: number;
    statutoryFloorDays: number;
    floorApplied: boolean;
    entitlementDays: number;
    entitlementHours: number | null;
  },
) {
  const actual = calculateProRataHoliday(input);
  for (const k of [
    "contractualDays",
    "statutoryFloorDays",
    "entitlementDays",
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
  if (actual.floorApplied === expected.floorApplied) {
    console.log(`ok   ${name} floorApplied: ${actual.floorApplied}`);
  } else {
    failures++;
    console.error(
      `FAIL ${name} floorApplied: got ${actual.floorApplied}, expected ${expected.floorApplied}`,
    );
  }
  const hoursOk =
    actual.entitlementHours === null && expected.entitlementHours === null
      ? true
      : actual.entitlementHours !== null &&
        expected.entitlementHours !== null &&
        Math.abs(actual.entitlementHours - expected.entitlementHours) <
          0.005;
  if (hoursOk) {
    console.log(`ok   ${name} entitlementHours: ${actual.entitlementHours}`);
  } else {
    failures++;
    console.error(
      `FAIL ${name} entitlementHours: got ${actual.entitlementHours}, expected ${expected.entitlementHours}`,
    );
  }
}

const base: ProRataHolidayInput = {
  fullTimeEntitlementDays: 28,
  fullTimeDaysPerWeek: 5,
  employeeDaysPerWeek: 5,
  hoursPerDay: 0,
  period: "full",
  leaveYearStart: "2026-01-01",
  startOrLeavingDate: "2026-01-01",
};

// The standard part-time case: 28 days, 3 days a week → 28 × 3/5 =
// 16.8 days; the floor is the same 5.6 × 3 = 16.8, so no uplift.
// At 7.5 hours a day that is 126 hours.
check(
  "28 days, 3 days/week, full year",
  { ...base, employeeDaysPerWeek: 3, hoursPerDay: 7.5 },
  {
    contractualDays: 16.8,
    statutoryFloorDays: 16.8,
    floorApplied: false,
    entitlementDays: 16.8,
    entitlementHours: 126,
  },
);

// A generous contract pro-rates above the floor: 30 × 2/5 = 12 days
// against a floor of 5.6 × 2 = 11.2 — the contract figure stands.
check(
  "30 days, 2 days/week, full year",
  {
    ...base,
    fullTimeEntitlementDays: 30,
    employeeDaysPerWeek: 2,
  },
  {
    contractualDays: 12,
    statutoryFloorDays: 11.2,
    floorApplied: false,
    entitlementDays: 12,
    entitlementHours: null,
  },
);

// THE FLOOR BITES: a 25-day full-time entitlement is below the
// statutory 5.6 weeks, so 25 × 4/5 = 20 days is unlawful — the floor
// gives 5.6 × 4 = 22.4 days instead.
check(
  "25 days (below statutory), 4 days/week — floor applies",
  {
    ...base,
    fullTimeEntitlementDays: 25,
    employeeDaysPerWeek: 4,
  },
  {
    contractualDays: 20,
    statutoryFloorDays: 22.4,
    floorApplied: true,
    entitlementDays: 22.4,
    entitlementHours: null,
  },
);

// Mid-year starter: full-time, starts 1 July in a Jan–Dec leave
// year → 6 twelfths → 28 × 6/12 = 14 days.
check(
  "starter 1 Jul, full-time",
  {
    ...base,
    period: "starter",
    startOrLeavingDate: "2026-07-01",
  },
  {
    contractualDays: 28,
    statutoryFloorDays: 28,
    floorApplied: false,
    entitlementDays: 14,
    entitlementHours: null,
  },
);

// Leaver: leaves in March of a Jan–Dec leave year → 3 twelfths →
// 28 × 3/12 = 7 days accrued.
check(
  "leaver mid-Mar, full-time",
  {
    ...base,
    period: "leaver",
    startOrLeavingDate: "2026-03-15",
  },
  {
    contractualDays: 28,
    statutoryFloorDays: 28,
    floorApplied: false,
    entitlementDays: 7,
    entitlementHours: null,
  },
);

// Part-time starter with the half-day round-up: 16.8 days full-year,
// starts 1 Oct → 3 twelfths → 16.8 × 3/12 = 4.2, rounded UP to the
// nearest half day = 4.5 days (GOV.UK's part-month treatment).
check(
  "starter 1 Oct, 3 days/week — half-day round-up",
  {
    ...base,
    employeeDaysPerWeek: 3,
    period: "starter",
    startOrLeavingDate: "2026-10-01",
  },
  {
    contractualDays: 16.8,
    statutoryFloorDays: 16.8,
    floorApplied: false,
    entitlementDays: 4.5,
    entitlementHours: null,
  },
);

// Half days and hours: 2.5 days a week → 5.6 × 2.5 = 14 days; at
// 6 hours a day, 84 hours.
check(
  "28 days, 2.5 days/week, 6-hour days",
  { ...base, employeeDaysPerWeek: 2.5, hoursPerDay: 6 },
  {
    contractualDays: 14,
    statutoryFloorDays: 14,
    floorApplied: false,
    entitlementDays: 14,
    entitlementHours: 84,
  },
);

// Six-day pattern: the contract pro-rates to 28 × 6/5 = 33.6 days,
// but the statutory FLOOR is capped at 28 — the floor figure shows
// the cap, and the (higher) contract figure is the entitlement.
check(
  "28 days, 6 days/week — floor capped at 28",
  { ...base, employeeDaysPerWeek: 6 },
  {
    contractualDays: 33.6,
    statutoryFloorDays: 28,
    floorApplied: false,
    entitlementDays: 33.6,
    entitlementHours: null,
  },
);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll pro-rata holiday checks passed");
