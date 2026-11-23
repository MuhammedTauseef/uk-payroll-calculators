/**
 * Hand-computed verification of the shared parental leave engine.
 *
 * Run with:  npm run verify:spl
 *
 * The engine (src/lib/shared-parental-leave.ts) applies GOV.UK's
 * "Shared Parental Leave and Pay" guidance: a 52-week leave /
 * 39-week pay maternity entitlement, the first 2 weeks compulsory,
 * the rest shared (50 leave / 37 pay at most); SMP at 90% of AWE for
 * 6 weeks then the flat rate or 90% if lower; ShPP at the flat rate
 * or 90% of the taking parent's AWE if lower; £187.18 a week in
 * 2025/26 and £194.32 in 2026/27, each week paid at the rate in
 * force on the day it starts. Every expected figure below was
 * worked out by hand from those rules first:
 *
 *  (1) GOV.UK's own example: mother takes 22 weeks of maternity
 *      leave and SMP → 30 weeks of SPL and 17 weeks of ShPP left
 *      to share. On £300 a week (£15,600 a year) her SMP is
 *      6 × £270 + 16 × £194.32 = £1,620 + £3,109.12 = £4,729.12.
 *  (2) The published £30,000 / £36,000 example: mother curtails at
 *      22 weeks, partner takes the 17 ShPP weeks. SMP =
 *      6 × £519.23 + 16 × £194.32 = £3,115.38 + £3,109.12 =
 *      £6,224.50; partner's 90% (£623.08) is above the flat rate,
 *      so ShPP = 17 × £194.32 = £3,303.44; household £9,527.94.
 *  (3) Rate straddle: partner weeks starting 30 Mar, 6 Apr and
 *      13 Apr 2026 pay £187.18 + £194.32 + £194.32 = £575.82.
 *  (4) Low earner: £10,000 a year → AWE £192.31 → 90% = £173.08 a
 *      week, below the flat rate → 5 weeks = £865.40.
 *  (5) Pool exhausted: mother takes all 39 SMP weeks → pay pool 0
 *      → partner's 10 SPL weeks are all unpaid; leave pool 13,
 *      3 weeks unused.
 *  (6) Mother-takes-all scenario on £30,000: 6 × £519.23 +
 *      33 × £194.32 = £3,115.38 + £6,412.56 = £9,527.94, 52 weeks.
 *  (7) Half-each scenario on the (2) family: 17 pay weeks all at
 *      the flat rate → household £9,527.94 again, 52 weeks total.
 *  (8) Dates: due 1 Jun 2026, 22 weeks of maternity leave ends
 *      2 Nov 2026; binding-notice deadline 8 weeks earlier,
 *      7 Sep 2026; first birthday 1 Jun 2027; a 17-week block from
 *      2 Nov 2026 ends 28 Feb 2027, notice by 7 Sep 2026.
 * Exits non-zero if any figure disagrees.
 */
import {
  calculateSharedParentalLeave,
  shppRateForWeek,
} from "../src/lib/shared-parental-leave.ts";

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = actual === expected;
  if (!ok) failures++;
  console.log(`${ok ? "PASS" : "FAIL"} ${label}: ${actual} (expected ${expected})`);
}

// Rate boundaries
check("rate 5 Apr 2026", shppRateForWeek("2026-04-05"), 187.18);
check("rate 6 Apr 2026", shppRateForWeek("2026-04-06"), 194.32);
check("rate 6 Apr 2025", shppRateForWeek("2025-04-06"), 187.18);

// (1) GOV.UK official example
const t1 = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 15600,
  partnerAnnualSalary: 0,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [],
});
check("1 leave pool", t1.leavePoolWeeks, 30);
check("1 pay pool", t1.payPoolWeeks, 17);
check("1 mother AWE", t1.motherAwe, 300);
check("1 SMP higher weeks", t1.motherSmp.higherWeeks, 6);
check("1 SMP flat weeks", t1.motherSmp.flatWeeks, 16);
check("1 SMP total", t1.motherSmp.total, 4729.12);

// (2) £30,000 / £36,000, partner takes the 17 ShPP weeks
const t2 = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 30000,
  partnerAnnualSalary: 36000,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2026-11-02", weeks: 17 }],
});
check("2 SMP total", t2.motherSmp.total, 6224.5);
check("2 partner ShPP", t2.partner.shppTotal, 3303.44);
check("2 partner paid weeks", t2.partner.paidWeeks, 17);
check("2 household pay", t2.householdPayTotal, 9527.94);
check("2 unused pay weeks", t2.unusedPayWeeks, 0);
check("2 unused leave weeks", t2.unusedLeaveWeeks, 13);

// (3) Rate straddle across 6 April 2026
const t3 = calculateSharedParentalLeave({
  dueDate: "2026-02-02",
  motherAnnualSalary: 15600,
  partnerAnnualSalary: 52000,
  motherMaternityLeaveWeeks: 2,
  motherSmpWeeks: 2,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2026-03-30", weeks: 3 }],
});
check("3 straddle ShPP", t3.partner.shppTotal, 575.82);
check("3 SMP total (2 higher weeks)", t3.motherSmp.total, 540);
check("3 leave pool", t3.leavePoolWeeks, 50);
check("3 pay pool", t3.payPoolWeeks, 37);

// (4) Low-earning partner capped at 90% of AWE
const t4 = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 30000,
  partnerAnnualSalary: 10000,
  motherMaternityLeaveWeeks: 22,
  motherSmpWeeks: 22,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2026-11-02", weeks: 5 }],
});
check("4 partner AWE", t4.partnerAwe, 192.31);
check("4 partner ShPP (5 × £173.08)", t4.partner.shppTotal, 865.4);

// (5) Pay pool exhausted — partner's weeks unpaid
const t5 = calculateSharedParentalLeave({
  dueDate: "2026-06-01",
  motherAnnualSalary: 30000,
  partnerAnnualSalary: 36000,
  motherMaternityLeaveWeeks: 39,
  motherSmpWeeks: 39,
  motherBlocks: [],
  partnerBlocks: [{ startDate: "2027-01-04", weeks: 10 }],
});
check("5 pay pool", t5.payPoolWeeks, 0);
check("5 partner paid weeks", t5.partner.paidWeeks, 0);
check("5 partner unpaid weeks", t5.partner.unpaidWeeks, 10);
check("5 partner ShPP", t5.partner.shppTotal, 0);
check("5 unused leave weeks", t5.unusedLeaveWeeks, 3);

// (6) + (7) Scenarios on the £30,000 / £36,000 family
check("6 mother-takes-all pay", t2.scenarios.motherTakesAll.payTotal, 9527.94);
check("6 mother-takes-all leave", t2.scenarios.motherTakesAll.leaveWeeks, 52);
check("7 half-each pay", t2.scenarios.halfEach.payTotal, 9527.94);
check("7 half-each leave", t2.scenarios.halfEach.leaveWeeks, 52);
check("7 your-plan pay", t2.scenarios.yourPlan.payTotal, 9527.94);
check("7 your-plan leave", t2.scenarios.yourPlan.leaveWeeks, 39);

// (8) Key dates
check("8 maternity end", t2.dates.maternityEnd, "2026-11-02");
check("8 curtailment deadline", t2.dates.curtailmentNoticeDeadline, "2026-09-07");
check("8 first birthday", t2.dates.firstBirthday, "2027-06-01");
check("8 block end", t2.partner.blocks[0].endDate, "2027-02-28");
check("8 block notice deadline", t2.partner.blocks[0].noticeDeadline, "2026-09-07");
check("8 earliest partner SPL", t2.dates.earliestPartnerSpl, "2026-06-01");

if (failures > 0) {
  console.error(`\n${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("\nAll shared parental leave checks passed.");
