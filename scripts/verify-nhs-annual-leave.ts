/**
 * Hand-computed verification of the NHS annual leave maths.
 *
 * Run with:  npm run verify:nhs-annual-leave
 *
 * Cases 1–5 are the Agenda for Change Table 6 figures themselves
 * (27/29/33 days plus public holidays, at 7.5 hours a day outside
 * Scotland), worked out by hand first. Case 6 is the leaver
 * accrual at exactly half the leave year. Cases 7–9 pin the
 * nation variations (Wales +1 day a tier, Scotland's 36-hour
 * week) and the date-based fraction on a leap leave year, where
 * 1 April to 30 September is exactly half of 366 days.
 * Exits non-zero if any figure disagrees.
 */
import {
  accrueNhsLeave,
  calculateNhsAnnualLeave,
  nhsFractionOfYear,
} from "../src/lib/nhs-annual-leave.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

// Case 1 — full-time England, under 5 years: 27 + 8 = 35 days.
// Leave 27 × 7.5 = 202.5 hours; public holidays 8 × 7.5 = 60;
// total 262.5 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "under-5",
    contractedHours: 37.5,
  });
  check("1", "leaveHours", r.leaveHours, 202.5);
  check("1", "publicHolidayHours", r.publicHolidayHours, 60);
  check("1", "totalHours", r.totalHours, 262.5);
  check("1", "totalDays", r.totalDays, 35);
}

// Case 2 — full-time England, 5–10 years: 29 + 8 = 37 days.
// 217.5 + 60 = 277.5 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "5-to-10",
    contractedHours: 37.5,
  });
  check("2", "leaveHours", r.leaveHours, 217.5);
  check("2", "publicHolidayHours", r.publicHolidayHours, 60);
  check("2", "totalHours", r.totalHours, 277.5);
  check("2", "totalDays", r.totalDays, 37);
}

// Case 3 — full-time England, 10+ years: 33 + 8 = 41 days.
// 247.5 + 60 = 307.5 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "10-plus",
    contractedHours: 37.5,
  });
  check("3", "leaveHours", r.leaveHours, 247.5);
  check("3", "publicHolidayHours", r.publicHolidayHours, 60);
  check("3", "totalHours", r.totalHours, 307.5);
  check("3", "totalDays", r.totalDays, 41);
}

// Case 4 — part-time England, 20 hours a week, 5–10 years.
// Leave: 217.5 × 20/37.5 = 116.0 hours. Public holidays:
// 60 × 20/37.5 = 32.0 hours. Total 148.0 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "5-to-10",
    contractedHours: 20,
  });
  check("4", "leaveHours", r.leaveHours, 116);
  check("4", "publicHolidayHours", r.publicHolidayHours, 32);
  check("4", "totalHours", r.totalHours, 148);
}

// Case 5 — full-time Northern Ireland, under 5 years: 10 public
// holidays, so 27 + 10 = 37 days = 202.5 + 75 = 277.5 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "northern-ireland",
    serviceBand: "under-5",
    contractedHours: 37.5,
  });
  check("5", "leaveHours", r.leaveHours, 202.5);
  check("5", "publicHolidayHours", r.publicHolidayHours, 75);
  check("5", "totalHours", r.totalHours, 277.5);
  check("5", "totalDays", r.totalDays, 37);
}

// Case 6 — leaver, full-time England under 5 years, leaving
// exactly halfway through the leave year: accrued = 50% of the
// full-year 262.5 hours = 131.25 hours.
{
  const fullYear = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "under-5",
    contractedHours: 37.5,
  });
  const r = accrueNhsLeave(fullYear, 0.5);
  check("6", "accruedTotalHours", r.accruedTotalHours, 131.25);
  check("6", "balanceHours", r.balanceHours, 131.25);
}

// Case 7 — Wales, full-time under 5 years: the Welsh extra day
// gives 28 + 8 = 36 days = 210 + 60 = 270 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "wales",
    serviceBand: "under-5",
    contractedHours: 37.5,
  });
  check("7", "leaveHours", r.leaveHours, 210);
  check("7", "totalHours", r.totalHours, 270);
  check("7", "totalDays", r.totalDays, 36);
}

// Case 8 — Scotland, full-time under 5 years: same 27 + 8 days,
// but a day is 7.2 hours on the 36-hour week: 194.4 + 57.6 =
// 252 hours.
{
  const r = calculateNhsAnnualLeave({
    nation: "scotland",
    serviceBand: "under-5",
    contractedHours: 36,
  });
  check("8", "dayHours", r.dayHours, 7.2);
  check("8", "leaveHours", r.leaveHours, 194.4);
  check("8", "publicHolidayHours", r.publicHolidayHours, 57.6);
  check("8", "totalHours", r.totalHours, 252);
}

// Case 9 — the date path to Case 6: the 2027/28 leave year has
// 366 days (it contains 29 February 2028), and 1 April to
// 30 September 2027 inclusive is 183 days — exactly half. The
// accrued figure must match Case 6.
{
  const fraction = nhsFractionOfYear("2027-09-30", "leaver");
  check("9", "fraction", fraction, 0.5);
  const fullYear = calculateNhsAnnualLeave({
    nation: "england",
    serviceBand: "under-5",
    contractedHours: 37.5,
  });
  const r = accrueNhsLeave(fullYear, fraction);
  check("9", "accruedTotalHours", r.accruedTotalHours, 131.25);
}

if (failures > 0) {
  console.error(`verify-nhs-annual-leave: ${failures} failure(s)`);
  process.exit(1);
}
console.log("verify-nhs-annual-leave: all cases pass");
