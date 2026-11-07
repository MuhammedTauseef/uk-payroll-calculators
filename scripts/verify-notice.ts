/**
 * Hand-computed verification of the notice period calculator maths.
 *
 * Run with:  npm run verify:notice
 *
 * Each case below was worked out by hand from Employment Rights Act 1996
 * s.86 first; the script then checks calculateNotice() against those
 * expected figures. Exits non-zero if any figure disagrees.
 */
import { calculateNotice } from "../src/lib/notice.ts";
import type { NoticeInput, NoticeResult } from "../src/lib/notice.ts";

interface Case {
  name: string;
  input: NoticeInput;
  expected: Pick<
    NoticeResult,
    | "serviceCompleteYears"
    | "statutoryWeeks"
    | "contractWeeks"
    | "effectiveWeeks"
    | "effectiveSource"
    | "effectiveDays"
    | "lastWorkingDay"
  >;
}

const cases: Case[] = [
  {
    // Hand maths: Jun 2020 -> Jun 2025 = 5 complete years of service.
    // Employer statutory minimum = 1 week per complete year = 5 weeks.
    // Contract 4 weeks is shorter, so the statutory 5 weeks wins.
    name: "Case 1 — employer, 5 complete years, contract 4 weeks (statutory wins)",
    input: {
      whoGivesNotice: "employer",
      employmentStartDate: "2020-06-01",
      noticeDate: "2025-06-02",
      contractNoticeValue: 4,
      contractNoticeUnit: "weeks",
    },
    expected: {
      serviceCompleteYears: 5,
      statutoryWeeks: 5,
      contractWeeks: 4,
      effectiveWeeks: 5,
      effectiveSource: "statutory",
      effectiveDays: 35,
      lastWorkingDay: "2025-07-07",
    },
  },
  {
    // Hand maths: employee's statutory minimum is 1 week whatever the
    // service (3 years here). Contract 1 month = 1 x 52/12 = 4.33 weeks,
    // which is longer, so the contract wins. Days = round(4.3333 x 7) = 30.
    // Last day = 3 Mar 2025 + 30 days = 2 Apr 2025.
    name: "Case 2 — employee, 3 years, contract 1 month (contract wins)",
    input: {
      whoGivesNotice: "employee",
      employmentStartDate: "2022-03-01",
      noticeDate: "2025-03-03",
      contractNoticeValue: 1,
      contractNoticeUnit: "months",
    },
    expected: {
      serviceCompleteYears: 3,
      statutoryWeeks: 1,
      contractWeeks: 4.33,
      effectiveWeeks: 4.33,
      effectiveSource: "contract",
      effectiveDays: 30,
      lastWorkingDay: "2025-04-02",
    },
  },
  {
    // Hand maths: 15 complete years would give 15 weeks, but s.86 caps the
    // employer's statutory notice at 12 weeks. Contract 4 weeks is shorter.
    // Last day = 6 Jan 2025 + 84 days = 31 Mar 2025.
    name: "Case 3 — employer, 15 years, contract 4 weeks (12-week cap applies)",
    input: {
      whoGivesNotice: "employer",
      employmentStartDate: "2010-01-04",
      noticeDate: "2025-01-06",
      contractNoticeValue: 4,
      contractNoticeUnit: "weeks",
    },
    expected: {
      serviceCompleteYears: 15,
      statutoryWeeks: 12,
      contractWeeks: 4,
      effectiveWeeks: 12,
      effectiveSource: "statutory",
      effectiveDays: 84,
      lastWorkingDay: "2025-03-31",
    },
  },
  {
    // Hand maths (the date case): notice given Monday 2 March 2026; the
    // period runs from the day after (3 March). Effective notice is 5 weeks
    // = 35 days, so the last working day is 2 Mar 2026 + 35 days = Monday
    // 6 April 2026.
    name: "Case 4 — date case: notice 2 Mar 2026 + 5 weeks -> last day 6 Apr 2026",
    input: {
      whoGivesNotice: "employer",
      employmentStartDate: "2020-06-01",
      noticeDate: "2026-03-02",
      contractNoticeValue: 4,
      contractNoticeUnit: "weeks",
    },
    expected: {
      serviceCompleteYears: 5,
      statutoryWeeks: 5,
      contractWeeks: 4,
      effectiveWeeks: 5,
      effectiveSource: "statutory",
      effectiveDays: 35,
      lastWorkingDay: "2026-04-06",
    },
  },
  {
    // Hand maths (edge case): 19 days' service is under one complete
    // month, so there is no statutory minimum for the employer, and with no
    // contract notice either way the effective notice is zero — employment
    // can end on the notice date itself.
    name: "Case 5 — employer, under 1 month's service, no contract notice (zero applies)",
    input: {
      whoGivesNotice: "employer",
      employmentStartDate: "2026-03-01",
      noticeDate: "2026-03-20",
      contractNoticeValue: 0,
      contractNoticeUnit: "weeks",
    },
    expected: {
      serviceCompleteYears: 0,
      statutoryWeeks: 0,
      contractWeeks: 0,
      effectiveWeeks: 0,
      effectiveSource: "equal",
      effectiveDays: 0,
      lastWorkingDay: "2026-03-20",
    },
  },
];

let failures = 0;

for (const c of cases) {
  const actual = calculateNotice(c.input);
  const keys = Object.keys(c.expected) as (keyof Case["expected"])[];
  const mismatches = keys.filter((k) => actual[k] !== c.expected[k]);
  if (mismatches.length === 0) {
    console.log(`PASS  ${c.name}`);
    console.log(
      `      statutory ${actual.statutoryWeeks} wks, contract ${actual.contractWeeks} wks, ` +
        `effective ${actual.effectiveWeeks} wks (${actual.effectiveSource}), ` +
        `last day ${actual.lastWorkingDay}`,
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
console.log("\nAll notice maths cases passed.");
