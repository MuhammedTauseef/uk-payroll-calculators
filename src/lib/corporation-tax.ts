import { CORPORATION_TAX } from "./rates.ts";

/**
 * Corporation Tax on company profits — UK, 2026/27 rules.
 *
 * The structure, from GOV.UK ("Corporation Tax rates, expenses and
 * reliefs", verified 9 November 2026 — see CORPORATION_TAX in
 * rates.ts):
 *   - Profits at or below the small profits limit (£50,000 for a
 *     company with no associated companies): 19%.
 *   - Profits at or above the main rate limit (£250,000): 25%.
 *   - Between the two: the main rate is charged, then Marginal
 *     Relief is given back — (upper limit − profit) × 3/200 — which
 *     tapers the effective rate smoothly from 19% up to 25% (a
 *     marginal rate of 26.5% on profits inside the taper).
 *   - Both limits are DIVIDED by the number of associated
 *     companies (the company itself plus every company under the
 *     same control), and pro-rated for accounting periods shorter
 *     than 12 months. This engine models a 12-month period; the
 *     associated-companies count is the one input that moves the
 *     limits.
 *
 * The statutory Marginal Relief formula multiplies by N/A
 * (taxable total profits ÷ augmented profits); where a company
 * has no franked investment income the two are equal and the
 * fraction is 1, which is the case this engine models — the page
 * says so.
 *
 * This lib is shared: the Dividend Tax Calculator's salary /
 * dividend optimiser uses it for the company side of the split,
 * and the Corporation Tax Calculator (Tool 4) builds on it.
 */

export interface CorporationTaxInput {
  /** Taxable profit for the accounting period, £. */
  profit: number;
  /**
   * Associated companies INCLUDING this company (the count the
   * £50,000 / £250,000 limits are divided by). Default 1.
   */
  associatedCompanies?: number;
}

export type CorporationTaxRegime = "small" | "marginal" | "main";

export interface CorporationTaxResult {
  /** Taxable profit used, £. */
  profit: number;
  /** Associated companies the limits were divided by. */
  associatedCompanies: number;
  /** Small profits limit after division, £. */
  smallProfitsLimit: number;
  /** Main rate limit after division, £. */
  mainRateLimit: number;
  /** Which rate structure the profit falls in. */
  regime: CorporationTaxRegime;
  /** Marginal Relief given back inside the taper, £ (0 outside it). */
  marginalRelief: number;
  /** Corporation Tax payable, £. */
  tax: number;
  /** Tax as a share of profit, 0–100 (0 when there is no profit). */
  effectiveRatePercent: number;
  /** Profit left after Corporation Tax, £. */
  profitAfterTax: number;
  /** Tax ÷ 12 — the monthly amount to set aside, £. */
  monthlySetAside: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateCorporationTax(
  input: CorporationTaxInput,
): CorporationTaxResult {
  const profit = Math.max(0, input.profit || 0);
  const companies = Math.max(
    1,
    Math.floor(input.associatedCompanies ?? 1) || 1,
  );
  const smallLimit = CORPORATION_TAX.smallProfitsLimit / companies;
  const mainLimit = CORPORATION_TAX.mainRateLimit / companies;

  let regime: CorporationTaxRegime;
  let marginalRelief = 0;
  let tax: number;
  if (profit <= smallLimit) {
    regime = "small";
    tax = profit * CORPORATION_TAX.smallProfitsRate;
  } else if (profit >= mainLimit) {
    regime = "main";
    tax = profit * CORPORATION_TAX.mainRate;
  } else {
    regime = "marginal";
    marginalRelief =
      (mainLimit - profit) * CORPORATION_TAX.marginalReliefFraction;
    tax = profit * CORPORATION_TAX.mainRate - marginalRelief;
  }

  return {
    profit: round2(profit),
    associatedCompanies: companies,
    smallProfitsLimit: round2(smallLimit),
    mainRateLimit: round2(mainLimit),
    regime,
    marginalRelief: round2(marginalRelief),
    tax: round2(tax),
    effectiveRatePercent: profit > 0 ? round2((tax / profit) * 100) : 0,
    profitAfterTax: round2(profit - tax),
    monthlySetAside: round2(tax / 12),
  };
}

/**
 * The marginal rate inside the taper: each extra £1 of profit
 * between the two limits is charged 25p of main-rate tax AND
 * loses 1.5p of Marginal Relief, so it carries 26.5p of tax in
 * all — the "augmented rate" HMRC's Marginal Relief guidance
 * derives from the same formula. Exported so the page and the
 * calculator quote one number.
 */
export const MARGINAL_BAND_RATE_PERCENT = 26.5;

/* ------------------------------------------------------------------ */
/* Taxable-profit builder                                              */
/* ------------------------------------------------------------------ */

/**
 * The bridge both competitors skip: the profit in the accounts
 * is NOT the profit Corporation Tax is charged on. GOV.UK
 * ("Corporation Tax rates, expenses and reliefs", checked 23
 * November 2026) is explicit that some costs are "specifically
 * disallowed" — entertaining clients is its own example — that
 * capital costs cannot be deducted as expenses, and that
 * capital allowances, losses and reliefs such as R&D Relief
 * come off instead. The builder walks that bridge step by step:
 *
 *   accounting profit
 *   + disallowable costs added back (entertaining, depreciation,
 *     anything else the accounts deducted but the tax rules do
 *     not allow)
 *   − capital allowances
 *   − losses brought forward and other reliefs (R&D)
 *   = taxable profit (never below £0 — deductions the profit
 *     cannot absorb are reported, not silently dropped)
 */
export interface TaxableProfitBuilderInput {
  /** Profit in the accounts, before tax, £. */
  accountingProfit: number;
  /** Client entertaining and gifts — specifically disallowed, £. */
  addBackEntertaining?: number;
  /** Depreciation charged in the accounts, £. */
  addBackDepreciation?: number;
  /** Any other costs the accounts deducted that tax law disallows, £. */
  addBackOther?: number;
  /** Capital allowances for the period (AIA / writing-down), £. */
  capitalAllowances?: number;
  /** Trading losses brought forward, used this period, £. */
  lossesBroughtForward?: number;
  /** R&D relief — the additional deduction / relief amount, £. */
  rdRelief?: number;
  /** Any other reliefs deducted in reaching taxable profit, £. */
  otherRelief?: number;
}

export interface TaxableProfitStep {
  label: string;
  /** Signed amount of this step, £ (adds positive, deductions negative). */
  amount: number;
  /** Running total after this step, £ (not floored). */
  runningTotal: number;
  kind: "start" | "add" | "deduct" | "result";
}

export interface TaxableProfitBuilderResult {
  accountingProfit: number;
  totalAddBacks: number;
  totalDeductions: number;
  /** Taxable profit before the £0 floor is applied, £. */
  taxableProfitBeforeFloor: number;
  /** Taxable profit fed to the Corporation Tax engine, £ (≥ 0). */
  taxableProfit: number;
  /** Deductions the profit could not absorb (they are not lost in real life — losses carry forward — but they cannot make taxable profit negative here), £. */
  unusedDeductions: number;
  steps: TaxableProfitStep[];
}

export function buildTaxableProfit(
  input: TaxableProfitBuilderInput,
): TaxableProfitBuilderResult {
  const accountingProfit = Math.max(0, input.accountingProfit || 0);
  const addBacks: { label: string; amount: number }[] = [
    {
      label: "Add back: client entertaining (specifically disallowed)",
      amount: Math.max(0, input.addBackEntertaining || 0),
    },
    {
      label: "Add back: depreciation (capital cost, not an expense)",
      amount: Math.max(0, input.addBackDepreciation || 0),
    },
    {
      label: "Add back: other disallowable costs",
      amount: Math.max(0, input.addBackOther || 0),
    },
  ];
  const deductions: { label: string; amount: number }[] = [
    {
      label: "Less: capital allowances",
      amount: Math.max(0, input.capitalAllowances || 0),
    },
    {
      label: "Less: losses brought forward",
      amount: Math.max(0, input.lossesBroughtForward || 0),
    },
    {
      label: "Less: R&D relief",
      amount: Math.max(0, input.rdRelief || 0),
    },
    {
      label: "Less: other reliefs",
      amount: Math.max(0, input.otherRelief || 0),
    },
  ];

  const steps: TaxableProfitStep[] = [];
  let running = accountingProfit;
  steps.push({
    label: "Profit in the accounts",
    amount: round2(accountingProfit),
    runningTotal: round2(running),
    kind: "start",
  });
  for (const s of addBacks) {
    if (s.amount <= 0) continue;
    running += s.amount;
    steps.push({
      label: s.label,
      amount: round2(s.amount),
      runningTotal: round2(running),
      kind: "add",
    });
  }
  for (const s of deductions) {
    if (s.amount <= 0) continue;
    running -= s.amount;
    steps.push({
      label: s.label,
      amount: round2(-s.amount),
      runningTotal: round2(running),
      kind: "deduct",
    });
  }
  const beforeFloor = running;
  const taxableProfit = Math.max(0, beforeFloor);
  steps.push({
    label: "Taxable profit",
    amount: round2(taxableProfit),
    runningTotal: round2(taxableProfit),
    kind: "result",
  });

  const totalAddBacks = addBacks.reduce((a, s) => a + s.amount, 0);
  const totalDeductions = deductions.reduce((a, s) => a + s.amount, 0);
  return {
    accountingProfit: round2(accountingProfit),
    totalAddBacks: round2(totalAddBacks),
    totalDeductions: round2(totalDeductions),
    taxableProfitBeforeFloor: round2(beforeFloor),
    taxableProfit: round2(taxableProfit),
    unusedDeductions: round2(Math.max(0, -beforeFloor)),
    steps,
  };
}

/* ------------------------------------------------------------------ */
/* Dates and cash                                                      */
/* ------------------------------------------------------------------ */

/**
 * The two deadlines every director mixes up, from GOV.UK
 * ("Accounts and tax returns for private limited companies" and
 * "Company Tax Returns", checked 23 November 2026):
 *   - PAY: 9 months and 1 day after the accounting period ends.
 *   - FILE the Company Tax Return (CT600): 12 months after the
 *     accounting period ends — you pay before you file.
 * Companies with taxable profits over £1.5 million do not get
 * the single payment date at all: they pay by quarterly
 * instalments, the first falling in the seventh month of the
 * accounting period. The £1.5m threshold is itself divided
 * between the companies in a 51% group; this helper tests the
 * undivided threshold and the page says so.
 */
export const LARGE_COMPANY_INSTALMENT_THRESHOLD = 1_500_000;

function parseIsoDate(iso: string): { y: number; m: number; d: number } {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso || "");
  if (!match) return { y: 2026, m: 3, d: 31 };
  return { y: Number(match[1]), m: Number(match[2]), d: Number(match[3]) };
}

function toIso(y: number, m: number, d: number): string {
  const mm = String(m).padStart(2, "0");
  const dd = String(d).padStart(2, "0");
  return `${y}-${mm}-${dd}`;
}

function addMonthsClamped(
  y: number,
  m: number,
  d: number,
  months: number,
): { y: number; m: number; d: number } {
  const total = y * 12 + (m - 1) + months;
  const ny = Math.floor(total / 12);
  const nm = (total % 12) + 1;
  const lastDay = new Date(Date.UTC(ny, nm, 0)).getUTCDate();
  return { y: ny, m: nm, d: Math.min(d, lastDay) };
}

function addOneDay(
  y: number,
  m: number,
  d: number,
): { y: number; m: number; d: number } {
  const next = new Date(Date.UTC(y, m - 1, d) + 86_400_000);
  return {
    y: next.getUTCFullYear(),
    m: next.getUTCMonth() + 1,
    d: next.getUTCDate(),
  };
}

/** "31 March 2027" from an ISO date — UTC-safe, no locale drift. */
export function formatGbDate(iso: string): string {
  const { y, m, d } = parseIsoDate(iso);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

export interface CorporationTaxDates {
  /** Accounting period end, ISO yyyy-mm-dd. */
  periodEnd: string;
  /** Pay by this date (9 months + 1 day after the period ends). */
  paymentDeadline: string;
  /** File the CT600 by this date (12 months after the period ends). */
  filingDeadline: string;
  /** True when taxable profits pass the £1.5m instalment threshold. */
  largeCompany: boolean;
  /** The threshold tested, £. */
  instalmentThreshold: number;
}

export function corporationTaxDates(
  periodEndIso: string,
  taxableProfit: number,
): CorporationTaxDates {
  const end = parseIsoDate(periodEndIso);
  const payBase = addMonthsClamped(end.y, end.m, end.d, 9);
  const pay = addOneDay(payBase.y, payBase.m, payBase.d);
  const file = addMonthsClamped(end.y, end.m, end.d, 12);
  return {
    periodEnd: toIso(end.y, end.m, end.d),
    paymentDeadline: toIso(pay.y, pay.m, pay.d),
    filingDeadline: toIso(file.y, file.m, file.d),
    largeCompany: taxableProfit > LARGE_COMPANY_INSTALMENT_THRESHOLD,
    instalmentThreshold: LARGE_COMPANY_INSTALMENT_THRESHOLD,
  };
}
