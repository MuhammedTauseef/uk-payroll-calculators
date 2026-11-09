import { INCOME_TAX } from "./rates.ts";
import { calculatePayslip } from "./payslip.ts";
import { incomeTaxFor } from "./takehome.ts";

/**
 * HMRC tax code checker — decode and verdict logic, UK 2026/27.
 *
 * MEANINGS: every letter, prefix and suffix meaning in this file is
 * taken from GOV.UK's "Tax codes" guide (verified at build time,
 * 9 November 2026), and the Marriage Allowance figures from GOV.UK's
 * "Marriage Allowance: How it works" (a £1,260 transfer for 2026/27,
 * leaving the receiving partner on £13,830 and the transferring
 * partner on £11,310).
 *
 * MONEY: no rate is re-derived here. The tax under a code is computed
 * by the payslip generator's verified engine (calculatePayslip in
 * payslip.ts, which applies the rates.ts bands through the allowance
 * a code carries), and the standard-code comparison figure is
 * incomeTaxFor() from takehome.ts. A code's digits are, in substance,
 * a Personal Allowance instruction: 1257 = £12,570 of tax-free income
 * (HMRC replaces the final 0 of the tax-free amount with a letter),
 * and a K code's digits are a NEGATIVE allowance.
 *
 * SCOTLAND: Scotland sets its own income tax bands, which this hub
 * does not hold. Scottish (S) codes are decoded in full — including
 * the Scotland-only flat rates SBR, SD0, SD1, SD2 and SD3 — but:
 *   - Scottish flat-rate codes get NO salary comparison (their rates
 *     are Scotland's own, so an England figure would mislead);
 *   - Scottish numbered / K / 0T / NT codes are compared using the
 *     England, Wales and Northern Ireland bands, and the result
 *     carries a plain caveat that the Scottish figure will differ.
 * Welsh (C) codes use the same bands as England and Northern Ireland
 * in this hub's rates model, so their comparisons are computed
 * normally. Emergency endings (W1, M1, X, NONCUM) change the timing
 * of tax within the year, not the year's total on a steady salary —
 * GOV.UK: tax is worked out on that pay period alone — so the annual
 * comparison uses the underlying code and the verdict says so.
 */

export const STANDARD_TAX_CODE = "1257L";

export type TaxCodeRegion = "england-ni" | "scotland" | "wales";

export type TaxCodeKind =
  | "numbered"
  | "flat-rate"
  | "no-tax"
  | "k"
  | "unrecognised";

export interface TaxCodePart {
  /** The piece of the code being explained, e.g. "1257", "L", "W1". */
  name: string;
  /** What that piece means, in plain words (GOV.UK basis). */
  meaning: string;
}

export interface TaxCodeFlag {
  title: string;
  text: string;
}

export interface TaxCodeDecode {
  recognised: boolean;
  /** The code exactly as entered, normalised (upper case, no spaces). */
  entered: string;
  /** Display form, e.g. "1257L", "S1257L M1", "K475". */
  display: string;
  /** The code HMRC's letter/number rules apply to, e.g. "1257L", "BR". */
  baseCode: string;
  region: TaxCodeRegion;
  /** Emergency (non-cumulative) basis — a W1 / M1 / X / NONCUM ending. */
  emergencyBasis: boolean;
  emergencySuffix: "W1" | "M1" | "X" | "NONCUM" | null;
  kind: TaxCodeKind;
  /** The digits in the code (1257 in 1257L, 475 in K475); null if none. */
  digits: number | null;
  /** The letter for numbered codes ("L", "M", "N", "T"); "" otherwise. */
  letter: string;
  /**
   * Tax-free allowance implied by the code, £/year: positive for
   * numbered codes, 0 for 0T, NEGATIVE for K codes; null for flat-rate
   * (BR/D0/D1 — no allowance is used) and NT codes.
   */
  allowance: number | null;
  /** Name of the flat rate for BR / D0 / D1 family codes, else null. */
  flatRateName: string | null;
  /** Each part of the code, explained. */
  parts: TaxCodePart[];
  /** One-line verdict in plain words. */
  headline: string;
  /** Problems the code commonly signals, and what to do about them. */
  flags: TaxCodeFlag[];
  /** Whether a salary comparison can honestly be computed. */
  comparable: boolean;
  /** Why not, when comparable is false; a caveat when Scotland applies. */
  comparisonNote: string | null;
}

export interface TaxCodeCheck extends TaxCodeDecode {
  /** Annual salary the comparison was run on, £; null when not given. */
  salary: number | null;
  /** Income tax for the year under the code as entered, £. */
  taxUnderCode: number | null;
  /** Income tax for the year under the standard 1257L, £. */
  taxUnderStandard: number | null;
  /**
   * taxUnderCode − taxUnderStandard, £/year. Positive: this code takes
   * MORE tax than 1257L would on the same salary. Negative: less.
   */
  differencePerYear: number | null;
  differencePerMonth: number | null;
}

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

const LETTER_MEANINGS: Record<string, string> = {
  L: "You're entitled to the standard tax-free Personal Allowance.",
  M: "Marriage Allowance: you've received a transfer of 10% of your partner's Personal Allowance (£1,260 in 2026/27), which is why this code's number is higher than the standard 1257.",
  N: "Marriage Allowance: you've transferred 10% of your Personal Allowance (£1,260 in 2026/27) to your partner, which is why this code's number is lower than the standard 1257.",
  T: "Your tax code includes other calculations to work out your Personal Allowance, so HMRC checks it more closely — T codes often appear where income is around or over £100,000.",
};

const SCOTTISH_FLAT_NAMES: Record<string, string> = {
  BR: "the basic rate in Scotland",
  D0: "the intermediate rate in Scotland",
  D1: "the higher rate in Scotland",
  D2: "the advanced rate in Scotland",
  D3: "the top rate in Scotland",
};

const WELSH_FLAT_NAMES: Record<string, string> = {
  BR: "the basic rate in Wales",
  D0: "the higher rate in Wales",
  D1: "the additional rate in Wales",
};

const EMERGENCY_MEANINGS: Record<string, string> = {
  W1: "The W1 ending means this is an emergency tax code, used when you're paid weekly: each pay day is taxed on its own, based only on that week's pay — not on your pay for the year so far.",
  M1: "The M1 ending means this is an emergency tax code, used when you're paid monthly: each pay day is taxed on its own, based only on that month's pay — not on your pay for the year so far.",
  X: "The X ending means this is an emergency tax code, used when your pay dates vary: each payment is taxed on its own, not on your pay for the year so far.",
  NONCUM: "NONCUM means this is an emergency (non-cumulative) tax code: each pay day is taxed on its own, not on your pay for the year so far. Some payroll software prints NONCUM instead of W1, M1 or X.",
};

export function decodeTaxCode(rawInput: string): TaxCodeDecode {
  const entered = (rawInput || "").toUpperCase().replace(/[\s-]+/g, "");
  let rest = entered;

  // --- emergency (non-cumulative) ending -------------------------------
  let emergencySuffix: TaxCodeDecode["emergencySuffix"] = null;
  if (rest.endsWith("NONCUM")) {
    emergencySuffix = "NONCUM";
    rest = rest.slice(0, -"NONCUM".length);
  } else if (rest.endsWith("W1")) {
    emergencySuffix = "W1";
    rest = rest.slice(0, -2);
  } else if (rest.endsWith("M1")) {
    emergencySuffix = "M1";
    rest = rest.slice(0, -2);
  } else if (rest.endsWith("X") && rest.length > 1) {
    emergencySuffix = "X";
    rest = rest.slice(0, -1);
  }
  const emergencyBasis = emergencySuffix !== null;

  // --- region prefix ----------------------------------------------------
  let region: TaxCodeRegion = "england-ni";
  if (/^S(?=[0-9K]|BR|D[0-3])/.test(rest)) {
    region = "scotland";
    rest = rest.slice(1);
  } else if (/^C(?=[0-9K]|BR|D[01])/.test(rest)) {
    region = "wales";
    rest = rest.slice(1);
  }

  const prefixLabel =
    region === "scotland" ? "S" : region === "wales" ? "C" : "";
  const display =
    prefixLabel + rest + (emergencySuffix ? ` ${emergencySuffix}` : "");

  const parts: TaxCodePart[] = [];
  if (region === "scotland") {
    parts.push({
      name: "S",
      meaning:
        "The S in front means this income is taxed using the rates in Scotland, which Scotland sets separately from the rest of the UK.",
    });
  } else if (region === "wales") {
    parts.push({
      name: "C",
      meaning:
        "The C in front (for Cymru) means this income is taxed using the rates in Wales.",
    });
  }

  let kind: TaxCodeKind = "unrecognised";
  let digits: number | null = null;
  let letter = "";
  let allowance: number | null = null;
  let flatRateName: string | null = null;
  let headline = "";
  let comparable = false;
  let comparisonNote: string | null = null;

  const flatNames =
    region === "scotland"
      ? SCOTTISH_FLAT_NAMES
      : region === "wales"
        ? WELSH_FLAT_NAMES
        : {
            BR: `the basic rate (${Math.round(INCOME_TAX.basicRate * 100)}%)`,
            D0: `the higher rate (${Math.round(INCOME_TAX.higherRate * 100)}%)`,
            D1: `the additional rate (${Math.round(INCOME_TAX.additionalRate * 100)}%)`,
          };

  if (rest === "NT") {
    kind = "no-tax";
    parts.push({
      name: "NT",
      meaning: "No tax is taken from this income.",
    });
    headline = "No tax is deducted from this income at all.";
    // Tax under NT is £0 under any bands, so a comparison is honest
    // even for Scotland (the general Scottish caveat below covers the
    // standard-code side of it).
    comparable = true;
  } else if (flatNames[rest] !== undefined) {
    kind = "flat-rate";
    flatRateName = flatNames[rest];
    parts.push({
      name: rest,
      meaning: `All your income from this job or pension is taxed at ${flatRateName}, with no tax-free allowance used here. HMRC usually uses these codes where you have more than one job or pension.`,
    });
    headline = `Everything from this job or pension is taxed at ${flatRateName} — no tax-free allowance is used on it.`;
    if (region === "scotland") {
      comparable = false;
      comparisonNote =
        "Scotland sets its own tax rates, and this site's calculator uses the England, Wales and Northern Ireland bands — so an exact comparison figure for a Scottish flat-rate code would mislead. The meaning above is the full answer for this code.";
    } else {
      comparable = true;
    }
  } else if (/^K(\d+)$/.test(rest)) {
    kind = "k";
    digits = Number(/^K(\d+)$/.exec(rest)![1]);
    allowance = -digits * 10;
    parts.push({
      name: `K${digits}`,
      meaning: `A K code works in reverse. The number is not an allowance: ${gbp.format(digits * 10)} is ADDED to your taxable pay, because the income you are not paying tax on elsewhere — or the deductions in this code — are worth more than your whole Personal Allowance.`,
    });
    headline = `A K code: you are taxed as if you earned ${gbp.format(digits * 10)} a year more than your actual pay.`;
    comparable = true;
  } else if (/^(\d+)([A-Z])$/.test(rest)) {
    const match = /^(\d+)([A-Z])$/.exec(rest)!;
    kind = "numbered";
    digits = Number(match[1]);
    letter = match[2];
    allowance = digits * 10;
    if (digits === 0 && letter === "T") {
      parts.push({
        name: "0T",
        meaning:
          "0T means your Personal Allowance has been used up — or you've started a new job and your employer does not have the details they need to give you a tax code. Either way, nothing you earn under this code is tax-free.",
      });
      headline = "No tax-free allowance at all under this code.";
    } else {
      parts.push({
        name: String(digits),
        meaning: `The number is your tax-free income for the year in tens of pounds: ${digits} means ${gbp.format(digits * 10)} you can earn from this job or pension before Income Tax starts. (HMRC builds the number by taking your tax-free amount and replacing its final digit with a letter.)`,
      });
      parts.push({
        name: letter,
        meaning:
          LETTER_MEANINGS[letter] ??
          "Not one of HMRC's standard code letters (L, M, N or T). Check the code carefully against your payslip or Tax Code Notice — a mistyped letter changes what the code means.",
      });
      if (allowance === INCOME_TAX.personalAllowance && letter === "L") {
        headline =
          "The standard tax code: the full Personal Allowance, and the code most people with one job or pension have.";
      } else if (allowance < INCOME_TAX.personalAllowance) {
        headline = `A reduced allowance: only ${gbp.format(allowance)} of your pay is tax-free under this code, instead of the standard ${gbp.format(INCOME_TAX.personalAllowance)}.`;
      } else if (allowance > INCOME_TAX.personalAllowance) {
        headline = `A higher-than-standard allowance: ${gbp.format(allowance)} of your pay is tax-free under this code.`;
      } else {
        headline = `This code gives you the standard ${gbp.format(INCOME_TAX.personalAllowance)} tax-free allowance.`;
      }
    }
    comparable = true;
  } else if (/^\d+$/.test(rest)) {
    // Digits with no letter: the amount is readable, the code is not
    // complete — HMRC codes always end in a letter (or BR/D0/D1/NT).
    digits = Number(rest);
    allowance = digits * 10;
    parts.push({
      name: rest,
      meaning: `On its own the number would mean ${gbp.format(digits * 10)} of tax-free income — but a real tax code always ends with a letter (usually L), or is a special code like BR, D0 or NT. Check the full code on your payslip or Tax Code Notice and enter it exactly.`,
    });
    headline = "That looks like only part of a tax code — the letter is missing.";
    comparisonNote =
      "No comparison is shown: without the letter, the code is incomplete, and guessing it could give a wrong figure.";
  }

  const recognised = kind !== "unrecognised" || digits !== null;
  if (kind === "unrecognised" && digits === null) {
    headline = "We could not read that as a UK tax code.";
    comparisonNote =
      "Check the code on your latest payslip or Tax Code Notice and enter it exactly as printed — for example 1257L, BR, D0, NT, 0T or K475.";
  }

  if (emergencySuffix) {
    parts.push({
      name: emergencySuffix,
      meaning: EMERGENCY_MEANINGS[emergencySuffix],
    });
  }

  // --- flags -------------------------------------------------------------
  const flags: TaxCodeFlag[] = [];

  if (emergencyBasis) {
    flags.push({
      title: "This is an emergency tax code",
      text: "Emergency codes usually appear when you start a new job and your employer does not yet have your previous income and tax details — most often because there is no P45 from your last job yet. Give your new employer your P45 (or fill in their starter checklist), and HMRC normally updates the code once it has the full picture — GOV.UK says this can take up to 35 days from starting. Because each pay day is taxed on its own, you may pay too much tax in the meantime; any overpayment is usually refunded through your pay once the code is corrected, or after the tax year ends.",
    });
  }

  if (kind === "flat-rate" && region !== "scotland") {
    flags.push({
      title: "Flat-rate code — check which job holds your allowance",
      text: "A flat-rate code is normal on a SECOND job or pension: the Personal Allowance can only be used once, so it stays on your main job and the extra income is taxed at one flat rate. But if this code is on your only or main job, your allowance is probably attached to another employment (perhaps one you have left) and you are likely paying more tax than you need to. Your personal tax account shows which employment is using your allowance.",
    });
  }

  if (kind === "numbered" && digits === 0 && letter === "T") {
    flags.push({
      title: "No allowance — often temporary, always worth checking",
      text: "0T frequently appears when a new employer is still waiting for the details needed to give you a proper code, or where your allowance is fully used against another job or pension. If neither of those explains it, check the details HMRC holds about you (below) — a 0T code on a main job takes tax from the very first pound.",
    });
  }

  if (kind === "k") {
    flags.push({
      title: "Why you have a K code — and the 50% safety cap",
      text: "K codes collect tax on income or deductions that are worth more than your Personal Allowance: common causes are tax owed from a previous year being collected through your pay, the State Pension or other taxable state benefits, company benefits such as a company car, or savings interest above your Personal Savings Allowance. By law your employer cannot take more than half of your pre-tax pay in a single pay period under a K code. Your Tax Code Notice and your personal tax account break down exactly what is in the code — check each item is still right.",
    });
  }

  if (
    kind === "numbered" &&
    allowance !== null &&
    allowance < INCOME_TAX.personalAllowance &&
    letter !== "N" &&
    !(digits === 0 && letter === "T")
  ) {
    flags.push({
      title: "Why the number is lower than 1257",
      text: `HMRC works the number out by starting with your Personal Allowance and taking things off: income you have not paid tax on (such as untaxed interest or part-time earnings) and deductions (such as company benefits or tax you owe). GOV.UK's own example: a £1,570 company medical benefit taken off the ${gbp.format(INCOME_TAX.personalAllowance)} allowance leaves ${gbp.format(11000)} tax-free — a code of 1100L. If the items in your code no longer apply, updating your details gets the allowance back.`,
    });
  }

  if (
    kind === "numbered" &&
    allowance !== null &&
    allowance > INCOME_TAX.personalAllowance &&
    letter !== "M"
  ) {
    flags.push({
      title: "Why the number is higher than 1257",
      text: "A number above the standard usually means HMRC has added something to your allowance — for example tax relief on work expenses you claim through your code. If nothing in your circumstances explains the higher figure, check your details: an allowance that is too generous now becomes tax owed later.",
    });
  }

  if (letter === "M") {
    flags.push({
      title: "Marriage Allowance in this code",
      text: "The M means your partner transferred £1,260 of their Personal Allowance to you, so your tax-free amount is £13,830 before any other adjustments in the code. If you have separated, or your partner's income has risen past the basic-rate limit, the allowance may need to be cancelled — tell HMRC, because it does not stop on its own.",
    });
  }

  if (letter === "N") {
    flags.push({
      title: "Marriage Allowance in this code",
      text: "The N means you transferred £1,260 of your Personal Allowance to your partner, so your own tax-free amount is £11,310 before any other adjustments in the code. If your circumstances have changed — you have separated, or your income has risen above your allowance — tell HMRC, because the transfer runs every year until it is cancelled.",
    });
  }

  if (region === "scotland") {
    flags.push({
      title: "Scottish tax rates apply",
      text: "This code is worked out with Scotland's own income tax bands, which are different from the rest of the UK. This site's calculators use the England, Wales and Northern Ireland bands, so any comparison figure below applies those bands to your code's allowance — treat it as the shape of the answer, not the exact Scottish figure.",
    });
  }

  if (region === "wales") {
    flags.push({
      title: "Welsh tax code",
      text: "This income is taxed using the rates in Wales. This site works Welsh (C) codes out on the same bands it uses for England and Northern Ireland, which is how its rates tables are built.",
    });
  }

  if (region === "scotland" && comparable) {
    comparisonNote =
      "Scotland sets its own income tax bands, which this site does not use. The comparison applies the England, Wales and Northern Ireland bands to your code's allowance — the shape of the answer, not the exact Scottish figure.";
  }

  return {
    recognised,
    entered,
    display,
    baseCode: rest,
    region,
    emergencyBasis,
    emergencySuffix,
    kind,
    digits,
    letter,
    allowance,
    flatRateName,
    parts,
    headline,
    flags,
    comparable,
    comparisonNote,
  };
}

/**
 * Decode a tax code and, when a salary is given, compare the income
 * tax it produces for the year with the tax under the standard 1257L.
 * The tax under the code comes from the payslip generator's verified
 * engine (calculatePayslip, annualised); the standard figure is
 * incomeTaxFor(). National Insurance is not part of the comparison —
 * it does not depend on the tax code.
 */
export function checkTaxCode(
  rawCode: string,
  annualSalary: number | null,
): TaxCodeCheck {
  const decode = decodeTaxCode(rawCode);
  const salary =
    annualSalary !== null && Number.isFinite(annualSalary) && annualSalary > 0
      ? annualSalary
      : null;

  if (!decode.comparable || salary === null || !decode.recognised) {
    return {
      ...decode,
      salary,
      taxUnderCode: null,
      taxUnderStandard: null,
      differencePerYear: null,
      differencePerMonth: null,
    };
  }

  // The engine code is the decoded base code: region prefix and
  // emergency ending change presentation and timing, not the engine's
  // job — it applies the England, Wales and Northern Ireland bands to
  // the allowance (or flat rate) the base code carries.
  const engineCode = decode.baseCode;

  const underCode = calculatePayslip({
    employerName: "",
    employeeName: "",
    frequency: "monthly",
    grossPerPeriod: salary / 12,
    taxCode: engineCode,
  }).incomeTaxAnnual;
  const underStandard = incomeTaxFor(salary);
  const difference = round2(underCode - underStandard);

  return {
    ...decode,
    salary,
    taxUnderCode: round2(underCode),
    taxUnderStandard: round2(underStandard),
    differencePerYear: difference,
    differencePerMonth: round2(difference / 12),
  };
}
