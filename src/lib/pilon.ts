import { TERMINATION } from "./rates.ts";
import { employeeNiFor, incomeTaxFor } from "./takehome.ts";

/**
 * Pay in lieu of notice (PILON) and post-employment notice pay
 * (PENP) — sections 402A to 402E and 403 ITEPA 2003.
 *
 * Rules (HMRC Employment Income Manual EIM13874 and EIM13880,
 * verified 27 November 2026 — see the TERMINATION block in
 * rates.ts):
 *   - When an employee leaves without working their full notice
 *     period, the employer must work out how much of the
 *     termination award represents basic pay for the unworked
 *     notice period. That amount is post-employment notice pay
 *     (PENP), taxed as earnings — Income Tax and employee and
 *     employer Class 1 National Insurance — with no share of the
 *     £30,000 termination-payments exemption.
 *   - The statutory formula is PENP = ((BP × D) ÷ P) − T, where
 *     BP is basic pay in the last pay period before the trigger
 *     date, D is the days (or, under the whole-months shortcut,
 *     months) in the post-employment notice period, P is the
 *     days in that pay period (1 under the shortcut, 30.42 for a
 *     monthly-paid employee outside it), and T is any amount
 *     received in connection with the termination that has
 *     already been taxed as earnings — typically a contractual
 *     PILON. Holiday pay and termination bonuses are not in T.
 *   - A negative result is taken as nil, and PENP is capped at
 *     the total relevant termination award (the termination
 *     payments themselves, excluding statutory redundancy pay).
 *   - What is left of the award after PENP, plus statutory
 *     redundancy pay, falls under section 403: the first £30,000
 *     is tax-free and only the excess is taxed (as the top slice
 *     of income; employer Class 1A National Insurance also
 *     applies to the excess, but that is the employer's bill).
 *
 * The estimated tax and National Insurance on the PENP use the
 * site's take-home engine: the PENP is stacked on top of the
 * user's other taxable income for the tax year, and the extra
 * tax and NI the PENP causes is reported.
 */

export type PenpBasis = "months" | "days";

export interface PilonInput {
  /**
   * "months" — the section 402D(6) shortcut: monthly paid, notice
   * in whole months (P = 1, D in months).
   * "days" — the general formula, D and P in calendar days.
   */
  basis: PenpBasis;
  /** BP: basic pay in the last pay period before the trigger date, £. */
  basicPayPerPeriod: number;
  /** P: calendar days in that pay period (days basis only). */
  payPeriodDays: number;
  /** D: unworked notice period, in whole months (months basis only). */
  unworkedMonths: number;
  /** D: unworked notice period, in calendar days (days basis only). */
  unworkedDays: number;
  /** T: amounts already taxed as earnings in connection with the termination, £. */
  taxedAsEarnings: number;
  /**
   * The relevant termination award, £ — the payments made in
   * connection with the termination, excluding statutory
   * redundancy pay. PENP is capped at this amount. Enter 0 to
   * see the uncapped formula result.
   */
  terminationAward: number;
  /** Statutory redundancy pay received on top of the award, £. */
  statutoryRedundancyPay: number;
  /** Other taxable income in the same tax year, £ — used to estimate the tax and NI on the PENP. */
  otherTaxableIncome: number;
}

export interface PilonResult {
  basis: PenpBasis;
  /** The D used: months on the months basis, days on the days basis. */
  dUsed: number;
  /** The P used: 1 on the months basis, pay-period days otherwise. */
  pUsed: number;
  /** (BP × D) ÷ P before T is deducted, £. */
  grossNoticePay: number;
  /** T: amounts already taxed as earnings, £. */
  taxedAsEarnings: number;
  /** PENP before the cap at the termination award, £ (never below 0). */
  penpBeforeCap: number;
  /** PENP after the cap, £ — the amount taxed as earnings. */
  penp: number;
  /** Whether the cap at the termination award reduced the PENP. */
  cappedByAward: boolean;
  /** The termination award entered, £. */
  terminationAward: number;
  /** Award minus PENP, £ — the part that falls under section 403. */
  remainderOfAward: number;
  /** Statutory redundancy pay entered, £. */
  statutoryRedundancyPay: number;
  /** Remainder plus statutory redundancy pay, £ — the section 403 total. */
  section403Total: number;
  /** Of the section 403 total, the part covered by the £30,000 exemption, £. */
  taxFreeAmount: number;
  /** Of the section 403 total, the part above £30,000 and so taxable, £. */
  taxableExcess: number;
  /** Estimated Income Tax on the PENP, stacked on other taxable income, £. */
  taxOnPenp: number;
  /** Estimated employee National Insurance on the PENP, £. */
  niOnPenp: number;
  /** PENP minus its estimated tax and NI, £. */
  netPenp: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function nonNegative(n: number): number {
  return Math.max(0, n || 0);
}

export function calculatePilon(input: PilonInput): PilonResult {
  const bp = nonNegative(input.basicPayPerPeriod);
  const t = nonNegative(input.taxedAsEarnings);
  const award = nonNegative(input.terminationAward);
  const redundancy = nonNegative(input.statutoryRedundancyPay);
  const otherIncome = nonNegative(input.otherTaxableIncome);

  const months = input.basis === "months";
  const dUsed = months
    ? nonNegative(input.unworkedMonths)
    : nonNegative(input.unworkedDays);
  const pUsed = months
    ? 1
    : Math.max(1, nonNegative(input.payPeriodDays) || TERMINATION.averageDaysPerMonth);

  const grossNoticePay = round2((bp * dUsed) / pUsed);
  const penpBeforeCap = Math.max(0, round2(grossNoticePay - t));
  const cappedByAward = award > 0 && penpBeforeCap > award;
  const penp = cappedByAward ? round2(award) : penpBeforeCap;

  const remainderOfAward = round2(Math.max(0, award - penp));
  const section403Total = round2(remainderOfAward + redundancy);
  const taxFreeAmount = round2(
    Math.min(section403Total, TERMINATION.taxFreeThreshold),
  );
  const taxableExcess = round2(section403Total - taxFreeAmount);

  const taxOnPenp = round2(
    incomeTaxFor(otherIncome + penp) - incomeTaxFor(otherIncome),
  );
  const niOnPenp = round2(
    employeeNiFor(otherIncome + penp) - employeeNiFor(otherIncome),
  );

  return {
    basis: input.basis,
    dUsed,
    pUsed,
    grossNoticePay,
    taxedAsEarnings: round2(t),
    penpBeforeCap,
    penp,
    cappedByAward,
    terminationAward: round2(award),
    remainderOfAward,
    statutoryRedundancyPay: round2(redundancy),
    section403Total,
    taxFreeAmount,
    taxableExcess,
    taxOnPenp,
    niOnPenp,
    netPenp: round2(penp - taxOnPenp - niOnPenp),
  };
}
