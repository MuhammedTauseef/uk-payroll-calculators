import { INCOME_TAX } from "./rates.ts";
import {
  employeeNiFor,
  incomeTaxFor,
  personalAllowanceFor,
} from "./takehome.ts";

/**
 * Payslip generator maths — UK, 2026/27 PAYE rules (England, Wales and
 * Northern Ireland bands; Scotland sets its own income tax bands).
 *
 * REUSE RULE: no rate is re-derived or hard-coded here. Every rate,
 * band width and threshold comes from rates.ts (INCOME_TAX), and the
 * standard-code figures come straight from the verified functions in
 * takehome.ts (employeeNiFor for National Insurance at every code;
 * incomeTaxFor whenever a tax code is not recognised).
 *
 * A tax code is, in substance, a Personal Allowance instruction from
 * HMRC: the digits are the tax-free amount in tens of pounds (1257L =
 * £12,570). So for a recognised non-standard code the only change
 * against the verified standard calculation is the allowance fed into
 * the same band structure: taxWithAllowance() below applies the
 * INCOME_TAX bands to (salary − code allowance) exactly as
 * incomeTaxFor() applies them to (salary − Personal Allowance).
 *
 * The standard code itself (1257L, or a blank field) always goes
 * through the verified incomeTaxFor() untouched — so the £100,000
 * Personal Allowance taper is applied exactly as the take-home
 * calculator applies it. That is also how PAYE works in practice:
 * HMRC builds the taper into the code it issues (an £110,000 earner's
 * code is reduced, e.g. 757L), so a non-standard code is applied at
 * face value. scripts/verify-payslip.ts proves the standard-code
 * figures equal calculateTakeHome() at every salary, taper included.
 *
 * Special codes: BR = all income at the basic rate, D0 = all at the
 * higher rate, D1 = all at the additional rate, NT = no tax deducted,
 * 0T = no allowance, K codes = a NEGATIVE allowance (the digits are
 * added to taxable income). An S (Scottish) or C (Welsh) prefix is
 * accepted and the digits read the same way, but the bands applied are
 * the England, Wales and Northern Ireland ones, as the page states.
 *
 * PAYE in real payroll is cumulative: the tax on a given month's
 * payslip depends on pay and tax earlier in the tax year. A payslip
 * generator cannot know that history, so — like every tool of this
 * kind — it annualises the period's pay (monthly × 12, weekly × 52),
 * works out the year's tax and National Insurance, and divides back.
 * For a steady salary on the standard code the result matches the
 * take-home calculator exactly. The page calls the result an estimate.
 */

export type PayFrequency = "monthly" | "weekly";

export interface PayslipInput {
  employerName: string;
  employeeName: string;
  frequency: PayFrequency;
  /** Gross pay for ONE pay period (one month or one week), £. */
  grossPerPeriod: number;
  /** HMRC tax code, e.g. "1257L". Blank = the standard 1257L. */
  taxCode: string;
}

export interface ParsedTaxCode {
  /** Normalised code for display (upper case, no spaces). */
  code: string;
  /** Tax-free allowance implied by the code, £ (negative for K codes). */
  allowance: number | null;
  /** Flat rate applied to all income (BR / D0 / D1 codes). */
  flatRate: number | null;
  /** NT code: no tax is deducted. */
  noTax: boolean;
  /** False when the code could not be read — standard figures are used. */
  recognised: boolean;
}

export interface PayslipResult {
  employerName: string;
  employeeName: string;
  frequency: PayFrequency;
  periodsPerYear: number;
  taxCode: string;
  taxCodeRecognised: boolean;
  /** Allowance actually used in the tax calculation, £/year. */
  allowanceUsed: number;
  grossPerPeriod: number;
  incomeTaxPerPeriod: number;
  employeeNiPerPeriod: number;
  totalDeductionsPerPeriod: number;
  netPerPeriod: number;
  grossAnnual: number;
  incomeTaxAnnual: number;
  employeeNiAnnual: number;
  netAnnual: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function parseTaxCode(rawInput: string): ParsedTaxCode {
  let code = (rawInput || "").toUpperCase().replace(/\s+/g, "");
  if (!code) code = "1257L";
  // Scottish (S) and Welsh (C) prefixes: the digits mean the same thing;
  // this hub applies the England, Wales and Northern Ireland bands.
  if (/^[SC]\d/.test(code)) code = code.slice(1);

  if (code === "NT") {
    return { code, allowance: null, flatRate: null, noTax: true, recognised: true };
  }
  if (code === "BR") {
    return { code, allowance: null, flatRate: INCOME_TAX.basicRate, noTax: false, recognised: true };
  }
  if (code === "D0") {
    return { code, allowance: null, flatRate: INCOME_TAX.higherRate, noTax: false, recognised: true };
  }
  if (code === "D1") {
    return { code, allowance: null, flatRate: INCOME_TAX.additionalRate, noTax: false, recognised: true };
  }
  if (code === "0T") {
    return { code, allowance: 0, flatRate: null, noTax: false, recognised: true };
  }
  const kCode = /^K(\d+)[A-Z]?$/.exec(code);
  if (kCode) {
    return {
      code,
      allowance: -Number(kCode[1]) * 10,
      flatRate: null,
      noTax: false,
      recognised: true,
    };
  }
  const standard = /^(\d+)[A-Z]$/.exec(code);
  if (standard) {
    return {
      code,
      allowance: Number(standard[1]) * 10,
      flatRate: null,
      noTax: false,
      recognised: true,
    };
  }
  return { code, allowance: null, flatRate: null, noTax: false, recognised: false };
}

/**
 * Income tax on `salary` when the tax-free allowance is `allowance`
 * rather than the standard Personal Allowance. Applies the INCOME_TAX
 * band structure from rates.ts — the same bands incomeTaxFor() uses.
 */
function taxWithAllowance(salary: number, allowance: number): number {
  const taxable = Math.max(0, salary - allowance);
  const basic = Math.min(taxable, INCOME_TAX.basicRateBand);
  const higher = Math.min(
    Math.max(0, taxable - INCOME_TAX.basicRateBand),
    INCOME_TAX.additionalRateThreshold - INCOME_TAX.basicRateBand,
  );
  const additional = Math.max(0, taxable - INCOME_TAX.additionalRateThreshold);
  return (
    basic * INCOME_TAX.basicRate +
    higher * INCOME_TAX.higherRate +
    additional * INCOME_TAX.additionalRate
  );
}

export function calculatePayslip(input: PayslipInput): PayslipResult {
  const periodsPerYear = input.frequency === "weekly" ? 52 : 12;
  const grossPerPeriod = Math.max(0, input.grossPerPeriod || 0);
  const grossAnnual = grossPerPeriod * periodsPerYear;

  const parsed = parseTaxCode(input.taxCode);
  let incomeTaxAnnual: number;
  let allowanceUsed: number;
  if (parsed.noTax) {
    incomeTaxAnnual = 0;
    allowanceUsed = personalAllowanceFor(grossAnnual);
  } else if (parsed.flatRate !== null) {
    incomeTaxAnnual = grossAnnual * parsed.flatRate;
    allowanceUsed = 0;
  } else if (
    parsed.allowance !== null &&
    parsed.allowance !== INCOME_TAX.personalAllowance
  ) {
    incomeTaxAnnual = taxWithAllowance(grossAnnual, parsed.allowance);
    allowanceUsed = parsed.allowance;
  } else {
    // The standard code (1257L / blank) and any unrecognised code both
    // use the verified standard calculation, taper included.
    incomeTaxAnnual = incomeTaxFor(grossAnnual);
    allowanceUsed = personalAllowanceFor(grossAnnual);
  }

  const employeeNiAnnual = employeeNiFor(grossAnnual);
  const netAnnual = grossAnnual - incomeTaxAnnual - employeeNiAnnual;

  return {
    employerName: input.employerName,
    employeeName: input.employeeName,
    frequency: input.frequency,
    periodsPerYear,
    taxCode: parsed.code,
    taxCodeRecognised: parsed.recognised,
    allowanceUsed: round2(allowanceUsed),
    grossPerPeriod: round2(grossPerPeriod),
    incomeTaxPerPeriod: round2(incomeTaxAnnual / periodsPerYear),
    employeeNiPerPeriod: round2(employeeNiAnnual / periodsPerYear),
    totalDeductionsPerPeriod: round2(
      (incomeTaxAnnual + employeeNiAnnual) / periodsPerYear,
    ),
    netPerPeriod: round2(netAnnual / periodsPerYear),
    grossAnnual: round2(grossAnnual),
    incomeTaxAnnual: round2(incomeTaxAnnual),
    employeeNiAnnual: round2(employeeNiAnnual),
    netAnnual: round2(netAnnual),
  };
}
