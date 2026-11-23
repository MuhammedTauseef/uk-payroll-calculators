/**
 * Shared Parental Leave (SPL) and Shared Parental Pay (ShPP) maths —
 * GOV.UK "Shared Parental Leave and Pay" guidance, read 23 Nov 2026.
 *
 * The shape of the scheme:
 *  - A mother (or adopter) gets 52 weeks of maternity leave and 39
 *    weeks of Statutory Maternity Pay (SMP). She must take the first
 *    2 weeks after the birth (4 for factory workers) — those can
 *    never be shared.
 *  - Whatever she does not take becomes the shared pool: up to 50
 *    weeks of leave (52 − maternity leave taken) and up to 37 weeks
 *    of pay (39 − SMP taken), split between the two parents.
 *  - SPL is taken in up to 3 blocks per parent, each block booked
 *    with at least 8 weeks' written notice, and everything must end
 *    before the baby's first birthday.
 *  - SMP pays 90% of the mother's average weekly earnings (AWE) for
 *    the first 6 weeks, then the flat rate or 90% of AWE if lower.
 *  - ShPP pays the flat rate or 90% of the taking parent's own AWE,
 *    whichever is lower — each parent is capped on their own pay.
 *  - The flat rate is £187.18 a week in 2025/26 and £194.32 a week
 *    in 2026/27 (GOV.UK rates and thresholds). A week is paid at the
 *    rate in force on the day that week starts, so a plan straddling
 *    6 April is paid at two different rates. Rates for later years
 *    are announced each year; weeks after 5 April 2027 use the
 *    2026/27 rate until the new rate is published.
 *
 * Simplifications (stated on the page): maternity leave is counted
 * from the baby's due date, and ShPP is taken from the shared pay
 * pool in the order the leave is taken (earliest week first). Pay
 * figures are before Income Tax and National Insurance.
 */

export const SPL_RULES = {
  /** Total maternity/adoption leave available to the mother. */
  maternityLeaveWeeks: 52,
  /** Total weeks of SMP available to the mother. */
  maternityPayWeeks: 39,
  /** Weeks of maternity leave the mother can never share. */
  compulsoryLeaveWeeks: 2,
  /** SMP weeks paid at 90% of AWE before the flat rate starts. */
  smpHigherWeeks: 6,
  /** Maximum SPL blocks per parent without employer agreement. */
  maxBlocksPerParent: 3,
  /** Written notice needed for each block (and for changes). */
  noticeWeeks: 8,
  /** SPLIT days each parent can work during SPL. */
  splitDaysPerParent: 20,
  /** KIT days the mother can work during maternity leave. */
  kitDays: 10,
} as const;

/** Flat statutory rate in force from each 6 April (GOV.UK). */
export const SHPP_RATE_CHANGES: {
  from: string;
  rate: number;
  taxYear: string;
}[] = [
  { from: "2025-04-06", rate: 187.18, taxYear: "2025/26" },
  { from: "2026-04-06", rate: 194.32, taxYear: "2026/27" },
];

/** Lower Earnings Limit by tax year (GOV.UK rates and thresholds). */
export const LOWER_EARNINGS_LIMIT: Record<string, number> = {
  "2025/26": 125,
  "2026/27": 129,
};

export type SplParent = "mother" | "partner";

export interface SplBlockInput {
  /** ISO date (yyyy-mm-dd) the block starts. */
  startDate: string;
  /** Whole weeks in the block. */
  weeks: number;
}

export interface SplInput {
  /** Baby's due date (or birth date), ISO yyyy-mm-dd. Day zero. */
  dueDate: string;
  /** Mother's gross annual salary — AWE is salary / 52. */
  motherAnnualSalary: number;
  /** Partner's gross annual salary — AWE is salary / 52. */
  partnerAnnualSalary: number;
  /** Weeks of maternity leave the mother takes (2–52). */
  motherMaternityLeaveWeeks: number;
  /** Weeks of SMP the mother takes before curtailing it (0–39). */
  motherSmpWeeks: number;
  /** Mother's SPL blocks (up to 3). */
  motherBlocks: SplBlockInput[];
  /** Partner's SPL blocks (up to 3). */
  partnerBlocks: SplBlockInput[];
}

export interface SplBlockResult {
  parent: SplParent;
  startDate: string;
  /** Last day of the block (start + weeks − 1 day). */
  endDate: string;
  weeks: number;
  paidWeeks: number;
  unpaidWeeks: number;
  shppTotal: number;
  /** Start date minus 8 weeks — the last day to give notice. */
  noticeDeadline: string;
}

export interface SplParentResult {
  splWeeks: number;
  paidWeeks: number;
  unpaidWeeks: number;
  shppTotal: number;
  blocks: SplBlockResult[];
}

export interface SplScenario {
  /** Total weeks of leave the household takes. */
  leaveWeeks: number;
  /** Total statutory pay the household receives. */
  payTotal: number;
}

export interface SplResult {
  motherAwe: number;
  partnerAwe: number;
  /** 52 − mother's maternity leave weeks. */
  leavePoolWeeks: number;
  /** 39 − mother's SMP weeks. */
  payPoolWeeks: number;
  motherSmp: {
    weeks: number;
    /** Weeks paid at 90% of AWE (the first 6). */
    higherWeeks: number;
    /** Weeks paid at the flat rate (or 90% if lower). */
    flatWeeks: number;
    total: number;
  };
  mother: SplParentResult;
  partner: SplParentResult;
  totalSplWeeks: number;
  totalShpp: number;
  /** SMP + ShPP — everything the household is paid. */
  householdPayTotal: number;
  unusedLeaveWeeks: number;
  unusedPayWeeks: number;
  dates: {
    /** Maternity leave is counted from the due date. */
    maternityStart: string;
    /** The date the mother's maternity leave ends. */
    maternityEnd: string;
    /** 8 weeks before maternityEnd — binding-notice deadline. */
    curtailmentNoticeDeadline: string;
    /** Mother's SPL can start once maternity leave has ended. */
    earliestMotherSpl: string;
    /** Partner's SPL can start from the birth (binding notice given). */
    earliestPartnerSpl: string;
    /** All SPL must end before this date. */
    firstBirthday: string;
  };
  scenarios: {
    motherTakesAll: SplScenario;
    yourPlan: SplScenario;
    halfEach: SplScenario;
  };
  warnings: string[];
}

// ---------------------------------------------------------------------------
// Date helpers — all UTC, all ISO strings, so nothing drifts with timezones.
// ---------------------------------------------------------------------------

function parseDate(iso: string): number {
  const [y, m, d] = iso.split("-").map(Number);
  return Date.UTC(y, (m || 1) - 1, d || 1);
}

function toIso(ms: number): string {
  const dt = new Date(ms);
  const y = dt.getUTCFullYear();
  const m = String(dt.getUTCMonth() + 1).padStart(2, "0");
  const d = String(dt.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

const DAY = 24 * 60 * 60 * 1000;

export function addDays(iso: string, days: number): string {
  return toIso(parseDate(iso) + days * DAY);
}

export function addWeeks(iso: string, weeks: number): string {
  return addDays(iso, weeks * 7);
}

export function addOneYear(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return toIso(Date.UTC((y || 2000) + 1, (m || 1) - 1, d || 1));
}

/** The flat statutory rate in force on the day a week starts. */
export function shppRateForWeek(weekStartIso: string): number {
  let rate = SHPP_RATE_CHANGES[0].rate;
  for (const change of SHPP_RATE_CHANGES) {
    if (weekStartIso >= change.from) rate = change.rate;
  }
  return rate;
}

// ---------------------------------------------------------------------------
// Engine
// ---------------------------------------------------------------------------

function clean(n: number): number {
  return Math.max(0, Number.isFinite(n) ? n : 0);
}

function clampInt(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, Math.floor(clean(n))));
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

interface WeekEntry {
  parent: SplParent;
  weekStart: string;
  blockIndex: number;
}

/** SMP for a run of weeks from the maternity start date. */
function smpTotal(
  maternityStart: string,
  weeks: number,
  motherAwe: number,
): { total: number; higherWeeks: number; flatWeeks: number } {
  let total = 0;
  let higherWeeks = 0;
  let flatWeeks = 0;
  const ninetyPercent = round2(motherAwe * 0.9);
  for (let i = 0; i < weeks; i++) {
    const weekStart = addWeeks(maternityStart, i);
    if (i < SPL_RULES.smpHigherWeeks) {
      total += ninetyPercent;
      higherWeeks++;
    } else {
      total += Math.min(shppRateForWeek(weekStart), ninetyPercent);
      flatWeeks++;
    }
  }
  return { total: round2(total), higherWeeks, flatWeeks };
}

/**
 * Price a set of SPL weeks against a pay pool. Weeks are paid in
 * chronological order (mother first when two blocks start the same
 * week) until the pool runs out; later weeks are unpaid leave.
 */
function priceSplWeeks(
  entries: WeekEntry[],
  payPoolWeeks: number,
  aweByParent: Record<SplParent, number>,
): Map<string, { amount: number; paid: boolean }> {
  const sorted = [...entries].sort((a, b) => {
    if (a.weekStart !== b.weekStart) return a.weekStart < b.weekStart ? -1 : 1;
    if (a.parent === b.parent) return 0;
    return a.parent === "mother" ? -1 : 1;
  });
  const priced = new Map<string, { amount: number; paid: boolean }>();
  let pool = payPoolWeeks;
  for (const entry of sorted) {
    const key = `${entry.parent}|${entry.blockIndex}|${entry.weekStart}`;
    if (pool > 0) {
      const amount = Math.min(
        shppRateForWeek(entry.weekStart),
        round2(aweByParent[entry.parent] * 0.9),
      );
      priced.set(key, { amount: round2(amount), paid: true });
      pool--;
    } else {
      priced.set(key, { amount: 0, paid: false });
    }
  }
  return priced;
}

function buildBlocks(
  parent: SplParent,
  blocks: SplBlockInput[],
  priced: Map<string, { amount: number; paid: boolean }>,
): SplParentResult {
  const results: SplBlockResult[] = blocks.map((block, blockIndex) => {
    let shppTotal = 0;
    let paidWeeks = 0;
    let unpaidWeeks = 0;
    for (let w = 0; w < block.weeks; w++) {
      const weekStart = addWeeks(block.startDate, w);
      const p = priced.get(`${parent}|${blockIndex}|${weekStart}`);
      if (p?.paid) {
        shppTotal += p.amount;
        paidWeeks++;
      } else {
        unpaidWeeks++;
      }
    }
    return {
      parent,
      startDate: block.startDate,
      endDate: addDays(addWeeks(block.startDate, block.weeks), -1),
      weeks: block.weeks,
      paidWeeks,
      unpaidWeeks,
      shppTotal: round2(shppTotal),
      noticeDeadline: addWeeks(block.startDate, -SPL_RULES.noticeWeeks),
    };
  });
  return {
    splWeeks: results.reduce((s, b) => s + b.weeks, 0),
    paidWeeks: results.reduce((s, b) => s + b.paidWeeks, 0),
    unpaidWeeks: results.reduce((s, b) => s + b.unpaidWeeks, 0),
    shppTotal: round2(results.reduce((s, b) => s + b.shppTotal, 0)),
    blocks: results,
  };
}

export function calculateSharedParentalLeave(input: SplInput): SplResult {
  const dueDate = input.dueDate;
  const motherAwe = round2(clean(input.motherAnnualSalary) / 52);
  const partnerAwe = round2(clean(input.partnerAnnualSalary) / 52);
  const leaveWeeks = clampInt(
    input.motherMaternityLeaveWeeks,
    SPL_RULES.compulsoryLeaveWeeks,
    SPL_RULES.maternityLeaveWeeks,
  );
  const smpWeeks = clampInt(
    input.motherSmpWeeks,
    0,
    SPL_RULES.maternityPayWeeks,
  );

  const leavePoolWeeks = SPL_RULES.maternityLeaveWeeks - leaveWeeks;
  const payPoolWeeks = SPL_RULES.maternityPayWeeks - smpWeeks;

  const maternityStart = dueDate;
  const maternityEnd = addWeeks(maternityStart, leaveWeeks);
  const firstBirthday = addOneYear(dueDate);

  // Mother's SMP.
  const smp = smpTotal(maternityStart, smpWeeks, motherAwe);

  // The plan's SPL weeks.
  const motherBlocks = (input.motherBlocks || []).slice(
    0,
    SPL_RULES.maxBlocksPerParent,
  );
  const partnerBlocks = (input.partnerBlocks || []).slice(
    0,
    SPL_RULES.maxBlocksPerParent,
  );
  const entries: WeekEntry[] = [];
  motherBlocks.forEach((b, blockIndex) => {
    for (let w = 0; w < clampInt(b.weeks, 0, 52); w++)
      entries.push({
        parent: "mother",
        weekStart: addWeeks(b.startDate, w),
        blockIndex,
      });
  });
  partnerBlocks.forEach((b, blockIndex) => {
    for (let w = 0; w < clampInt(b.weeks, 0, 52); w++)
      entries.push({
        parent: "partner",
        weekStart: addWeeks(b.startDate, w),
        blockIndex,
      });
  });
  const priced = priceSplWeeks(entries, payPoolWeeks, {
    mother: motherAwe,
    partner: partnerAwe,
  });
  const mother = buildBlocks("mother", motherBlocks, priced);
  const partner = buildBlocks("partner", partnerBlocks, priced);

  const totalSplWeeks = mother.splWeeks + partner.splWeeks;
  const totalShpp = round2(mother.shppTotal + partner.shppTotal);
  const paidSplWeeks = mother.paidWeeks + partner.paidWeeks;

  // Scenario: mother takes everything — 52 weeks of maternity leave
  // and the full 39 weeks of SMP, nothing shared.
  const motherAllSmp = smpTotal(
    maternityStart,
    SPL_RULES.maternityPayWeeks,
    motherAwe,
  );
  const motherTakesAll: SplScenario = {
    leaveWeeks: SPL_RULES.maternityLeaveWeeks,
    payTotal: motherAllSmp.total,
  };

  // Scenario: the shared pool split half and half, both parents
  // starting the week the mother's maternity leave ends.
  const halfMotherWeeks = Math.ceil(leavePoolWeeks / 2);
  const halfPartnerWeeks = leavePoolWeeks - halfMotherWeeks;
  const halfEntries: WeekEntry[] = [];
  for (let w = 0; w < halfMotherWeeks; w++)
    halfEntries.push({
      parent: "mother",
      weekStart: addWeeks(maternityEnd, w),
      blockIndex: 0,
    });
  for (let w = 0; w < halfPartnerWeeks; w++)
    halfEntries.push({
      parent: "partner",
      weekStart: addWeeks(maternityEnd, w),
      blockIndex: 0,
    });
  const halfPriced = priceSplWeeks(halfEntries, payPoolWeeks, {
    mother: motherAwe,
    partner: partnerAwe,
  });
  let halfShpp = 0;
  for (const p of halfPriced.values()) halfShpp += p.amount;
  const halfEach: SplScenario = {
    leaveWeeks: leaveWeeks + leavePoolWeeks,
    payTotal: round2(smp.total + halfShpp),
  };

  const yourPlan: SplScenario = {
    leaveWeeks: leaveWeeks + totalSplWeeks,
    payTotal: round2(smp.total + totalShpp),
  };

  // Warnings — plain-English flags for impossible or costly plans.
  const warnings: string[] = [];
  if ((input.motherBlocks || []).length > SPL_RULES.maxBlocksPerParent)
    warnings.push(
      "The mother has more than 3 blocks — only the first 3 are counted. More than 3 blocks needs the employer's agreement.",
    );
  if ((input.partnerBlocks || []).length > SPL_RULES.maxBlocksPerParent)
    warnings.push(
      "The partner has more than 3 blocks — only the first 3 are counted. More than 3 blocks needs the employer's agreement.",
    );
  if (totalSplWeeks > leavePoolWeeks)
    warnings.push(
      `This plan uses ${totalSplWeeks} weeks of shared leave, but only ${leavePoolWeeks} weeks are in the pool — the mother creates the pool by ending her maternity leave early.`,
    );
  for (const b of mother.blocks)
    if (b.startDate < maternityEnd)
      warnings.push(
        "One of the mother's blocks starts before her maternity leave ends — her shared leave can only start once maternity leave is curtailed.",
      );
  for (const b of partner.blocks)
    if (b.startDate < dueDate)
      warnings.push(
        "One of the partner's blocks starts before the baby's due date — shared leave cannot start before the birth.",
      );
  for (const b of [...mother.blocks, ...partner.blocks])
    if (addWeeks(b.startDate, b.weeks) > firstBirthday)
      warnings.push(
        "One block runs past the baby's first birthday — all shared leave and pay must be taken before then, so those weeks would be lost.",
      );
  if (paidSplWeeks < Math.min(totalSplWeeks, payPoolWeeks))
    warnings.push(
      "Some shared weeks could not be priced — check the block dates.",
    );

  return {
    motherAwe,
    partnerAwe,
    leavePoolWeeks,
    payPoolWeeks,
    motherSmp: {
      weeks: smpWeeks,
      higherWeeks: smp.higherWeeks,
      flatWeeks: smp.flatWeeks,
      total: smp.total,
    },
    mother,
    partner,
    totalSplWeeks,
    totalShpp,
    householdPayTotal: round2(smp.total + totalShpp),
    unusedLeaveWeeks: Math.max(0, leavePoolWeeks - totalSplWeeks),
    unusedPayWeeks: Math.max(0, payPoolWeeks - paidSplWeeks),
    dates: {
      maternityStart,
      maternityEnd,
      curtailmentNoticeDeadline: addWeeks(
        maternityEnd,
        -SPL_RULES.noticeWeeks,
      ),
      earliestMotherSpl: maternityEnd,
      earliestPartnerSpl: dueDate,
      firstBirthday,
    },
    scenarios: { motherTakesAll, yourPlan, halfEach },
    warnings,
  };
}
