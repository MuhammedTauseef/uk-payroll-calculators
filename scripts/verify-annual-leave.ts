/**
 * Hand-computed verification of the annual leave calculator maths.
 *
 * Run with:  npm run verify:annual-leave
 *
 * Every case below was worked out by hand first from the rules
 * GOV.UK states ("Holiday entitlement: entitlement" and "Calculate
 * holiday entitlement", re-read 9 November 2026):
 *   - 5.6 weeks a year; 5 days a week → 28 days; 3 days → 16.8 days
 *     (GOV.UK's own example); 2.5 days → 14 days.
 *   - Statutory cap: 28 days even on a 6- or 7-day week.
 *   - Part-year starters: twelfths of the year, the start month
 *     counting whole (GOV.UK: a mid-month starter accrues that
 *     month's twelfth from day one), the part-year total rounded UP
 *     to the nearest half day.
 *   - Irregular hours (leave years from 1 April 2024): 12.07% of
 *     hours worked, rounded to the nearest whole hour, halves up —
 *     GOV.UK's own example: 30 hours → 3.621 hours, booked as 4.
 * Exits non-zero if any figure disagrees.
 */
import { calculateAnnualLeave } from "../src/lib/annualleave.ts";
import type { AnnualLeaveInput } from "../src/lib/annualleave.ts";

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

const BASE: AnnualLeaveInput = {
  mode: "regular",
  daysPerWeek: 5,
  hoursPerDay: 7.5,
  startedPartWay: false,
  leaveYearStart: "2026-01-01",
  employmentStart: "2026-01-01",
  daysAlreadyTaken: 0,
  hoursWorked: 0,
  hoursAlreadyTaken: 0,
};

// --- Regular hours, full leave year ------------------------------------

// 5-day week: 5.6 × 5 = 28 days; at 7.5 hours a day, 210 hours.
{
  const r = calculateAnnualLeave({ ...BASE });
  checkNum("5day", "fullYearDays", r.fullYearDays, 28);
  checkNum("5day", "twelfthsRemaining", r.twelfthsRemaining, 12);
  checkNum("5day", "entitlementDays", r.entitlementDays, 28);
  checkNum("5day", "entitlementHours", r.entitlementHours, 210);
  checkNum("5day", "remainingDays", r.remainingDays, 28);
}

// 3-day week: 5.6 × 3 = 16.8 days (GOV.UK's own worked example);
// 16.8 × 7.5 = 126 hours.
{
  const r = calculateAnnualLeave({ ...BASE, daysPerWeek: 3 });
  checkNum("3day", "entitlementDays", r.entitlementDays, 16.8);
  checkNum("3day", "entitlementHours", r.entitlementHours, 126);
}

// 2.5-day week: 5.6 × 2.5 = 14 days exactly.
{
  const r = calculateAnnualLeave({ ...BASE, daysPerWeek: 2.5 });
  checkNum("2.5day", "entitlementDays", r.entitlementDays, 14);
}

// 4-day week: 5.6 × 4 = 22.4 days.
{
  const r = calculateAnnualLeave({ ...BASE, daysPerWeek: 4 });
  checkNum("4day", "entitlementDays", r.entitlementDays, 22.4);
}

// 6- and 7-day weeks: capped at 28 days by law, NOT 33.6 / 39.2.
{
  checkNum(
    "6day-cap",
    "entitlementDays",
    calculateAnnualLeave({ ...BASE, daysPerWeek: 6 }).entitlementDays,
    28,
  );
  checkNum(
    "7day-cap",
    "entitlementDays",
    calculateAnnualLeave({ ...BASE, daysPerWeek: 7 }).entitlementDays,
    28,
  );
}

// No day length given: days figures only, hours come back null.
{
  const r = calculateAnnualLeave({ ...BASE, hoursPerDay: 0 });
  checkNum("nohours", "entitlementDays", r.entitlementDays, 28);
  checkNum("nohours", "entitlementHours", r.entitlementHours, null);
  checkNum("nohours", "remainingHours", r.remainingHours, null);
}

// Leave already taken: 28 − 10 = 18 days left (135 hours at 7.5).
{
  const r = calculateAnnualLeave({ ...BASE, daysAlreadyTaken: 10 });
  checkNum("taken10", "remainingDays", r.remainingDays, 18);
  checkNum("taken10", "remainingHours", r.remainingHours, 135);
}

// Over-taken stays visible as a negative rather than being hidden:
// 28 − 30 = −2.
{
  const r = calculateAnnualLeave({ ...BASE, daysAlreadyTaken: 30 });
  checkNum("overtaken", "remainingDays", r.remainingDays, -2);
}

// --- Part-year starters --------------------------------------------------

// Start 1 July in a January–December leave year: employed for
// Jul–Dec = 6 twelfths → 28 × 6/12 = 14 days.
{
  const r = calculateAnnualLeave({
    ...BASE,
    startedPartWay: true,
    employmentStart: "2026-07-01",
  });
  checkNum("midyear-ft", "twelfthsRemaining", r.twelfthsRemaining, 6);
  checkNum("midyear-ft", "entitlementDays", r.entitlementDays, 14);
}

// GOV.UK start-month rule: starting on 13 January still counts
// January as a whole twelfth → all 12 twelfths → the full 28 days
// (and no half-day rounding-up is applied to a whole year).
{
  const r = calculateAnnualLeave({
    ...BASE,
    startedPartWay: true,
    employmentStart: "2026-01-13",
  });
  checkNum("startmonth", "twelfthsRemaining", r.twelfthsRemaining, 12);
  checkNum("startmonth", "entitlementDays", r.entitlementDays, 28);
}

// Part-time starter: 3-day week, start 1 October → Oct–Dec = 3
// twelfths → 16.8 × 3/12 = 4.2, rounded UP to the nearest half
// day = 4.5 days.
{
  const r = calculateAnnualLeave({
    ...BASE,
    daysPerWeek: 3,
    startedPartWay: true,
    employmentStart: "2026-10-01",
  });
  checkNum("midyear-pt", "twelfthsRemaining", r.twelfthsRemaining, 3);
  checkNum("midyear-pt", "entitlementDays", r.entitlementDays, 4.5);
}

// April leave year: leave year from 1 April 2026, start 1 October
// 2026 → Oct–Mar = 6 twelfths → 14 days.
{
  const r = calculateAnnualLeave({
    ...BASE,
    startedPartWay: true,
    leaveYearStart: "2026-04-01",
    employmentStart: "2026-10-01",
  });
  checkNum("april-year", "twelfthsRemaining", r.twelfthsRemaining, 6);
  checkNum("april-year", "entitlementDays", r.entitlementDays, 14);
}

// Started before the leave year began: a full year — 12 twelfths.
{
  const r = calculateAnnualLeave({
    ...BASE,
    startedPartWay: true,
    employmentStart: "2025-06-15",
  });
  checkNum("before-year", "twelfthsRemaining", r.twelfthsRemaining, 12);
  checkNum("before-year", "entitlementDays", r.entitlementDays, 28);
}

// --- Irregular hours: the 12.07% accrual ---------------------------------

// 100 hours worked: 100 × 12.07% = 12.07 hours exactly; booked
// (nearest whole hour, halves up) = 12 hours.
{
  const r = calculateAnnualLeave({
    ...BASE,
    mode: "irregular",
    hoursWorked: 100,
  });
  checkNum("irr-100", "accruedHoursExact", r.accruedHoursExact, 12.07);
  checkNum("irr-100", "accruedHoursBooked", r.accruedHoursBooked, 12);
  checkNum("irr-100", "remainingHoursBooked", r.remainingHoursBooked, 12);
}

// GOV.UK's own example: 30 hours → 30 × 12.07% = 3.621 hours,
// booked as 4 hours.
{
  const r = calculateAnnualLeave({
    ...BASE,
    mode: "irregular",
    hoursWorked: 30,
  });
  checkNum("irr-30", "accruedHoursExact", r.accruedHoursExact, 3.62);
  checkNum("irr-30", "accruedHoursBooked", r.accruedHoursBooked, 4);
}

// Halves round UP: 145 hours → 17.5015 hours exactly, booked 18.
{
  const r = calculateAnnualLeave({
    ...BASE,
    mode: "irregular",
    hoursWorked: 145,
  });
  checkNum("irr-145", "accruedHoursExact", r.accruedHoursExact, 17.5);
  checkNum("irr-145", "accruedHoursBooked", r.accruedHoursBooked, 18);
}

// Taken off the booked figure: 100 hours worked, 5 taken → 12 − 5 = 7.
{
  const r = calculateAnnualLeave({
    ...BASE,
    mode: "irregular",
    hoursWorked: 100,
    hoursAlreadyTaken: 5,
  });
  checkNum("irr-taken", "remainingHoursBooked", r.remainingHoursBooked, 7);
}

if (failures > 0) {
  console.error(`\nverify-annual-leave: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-annual-leave: all hand-computed checks passed");
