import { EMPLOYER_NI } from "./rates.ts";
import { calculateTakeHome, type TakeHomeResult } from "./takehome.ts";
import { employerNiFor } from "./salary-sacrifice.ts";

/**
 * Umbrella company take-home maths — UK, 2026/27.
 *
 * A contractor paid through an umbrella company is the umbrella's
 * employee. The agency pays the umbrella an ASSIGNMENT RATE (the
 * "umbrella rate") which has to cover every employment cost before
 * anything is the worker's salary:
 *
 *   assignment income
 *     − umbrella margin (the umbrella's fee)
 *     − employer Class 1 NI: 15% of salary above £5,000 a year
 *     − apprenticeship levy: 0.5% of salary
 *     = gross salary
 *
 * Employer NI and the levy are charged ON the salary, which is itself
 * what is left after they are deducted — so the salary is solved for,
 * not just subtracted. The equation is linear above the £5,000
 * secondary threshold:
 *
 *   A − margin = salary + 0.15 × (salary − 5,000) + 0.005 × salary
 *              = 1.155 × salary − 750
 *   salary     = (A − margin + 750) ÷ 1.155
 *
 * (below the threshold the 1.005 divisor applies; the code solves by
 * checking both branches). The apprenticeship levy is 0.5% of the
 * employer's pay bill above a £15,000 levy allowance shared across
 * the umbrella's whole workforce — large umbrellas pass 0.5% of the
 * salary through, which is the treatment modelled here and stated on
 * the page.
 *
 * The gross salary is then taxed like any employment income using the
 * verified take-home functions (2026/27 bands). Part of the gross
 * salary is holiday pay: umbrellas accrue it at 12.07% on top of the
 * basic rate (5.6 weeks ÷ 46.4 working weeks), so the holiday element
 * inside a gross figure is salary − salary ÷ 1.1207. It is shown for
 * information — it is the worker's pay either way, paid when leave is
 * taken or, where the contract allows, rolled up with each payment.
 *
 * Employer NI rate and threshold come from rates.ts (EMPLOYER_NI,
 * GOV.UK-verified for 2026/27). Pension contributions are not
 * deducted in the base calculation — the page says auto-enrolment
 * contributions would come off the gross salary on top.
 */

/** Apprenticeship levy rate passed through on the salary. */
export const APPRENTICESHIP_LEVY_RATE = 0.005;

/** Holiday pay accrual: 5.6 ÷ 46.4 = 12.07%. */
export const HOLIDAY_ACCRUAL_RATE = 5.6 / 46.4;

export interface UmbrellaInput {
  /** Assignment (umbrella) rate, £. */
  rate: number;
  /** Whether the rate is per day or per hour. */
  rateType: "day" | "hour";
  /** Hours worked per day (hourly rates only). */
  hoursPerDay: number;
  /** Days worked per week. */
  daysPerWeek: number;
  /** Weeks worked per year. */
  weeksPerYear: number;
  /** Umbrella margin (fee), £/week. */
  marginPerWeek: number;
}

export interface UmbrellaResult {
  /** Total assignment income for the year, £. */
  assignmentIncome: number;
  /** Umbrella margin for the year, £. */
  marginAnnual: number;
  /** Employer NI taken from the assignment income, £/year. */
  employerNi: number;
  /** Apprenticeship levy taken from the assignment income, £/year. */
  apprenticeshipLevy: number;
  /** Gross salary left after the employment costs, £/year. */
  grossSalary: number;
  /** Holiday pay element inside the gross salary, £/year. */
  holidayPayElement: number;
  takeHome: TakeHomeResult;
  /** Net pay per month, £ (annual net ÷ 12). */
  netMonthly: number;
  /** Net pay per worked week, £ (annual net ÷ weeks worked). */
  netPerWorkedWeek: number;
  /** Net pay as a share of the assignment income, 0–100. */
  shareOfAssignmentPercent: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function calculateUmbrella(input: UmbrellaInput): UmbrellaResult {
  const daysPerWeek = Math.max(0, input.daysPerWeek || 0);
  const weeks = Math.max(0, input.weeksPerYear || 0);
  const hoursPerDay = input.rateType === "hour" ? Math.max(0, input.hoursPerDay || 0) : 1;
  const rate = Math.max(0, input.rate || 0);

  const assignmentIncome = rate * hoursPerDay * daysPerWeek * weeks;
  const marginAnnual = Math.max(0, input.marginPerWeek || 0) * weeks;
  const available = Math.max(0, assignmentIncome - marginAnnual);

  // Solve for the salary: available = salary + employerNI(salary) + levy(salary).
  const st = EMPLOYER_NI.secondaryThresholdAnnual;
  let salary: number;
  if (available <= 0) {
    salary = 0;
  } else {
    // Branch 1: salary above the secondary threshold.
    const aboveThreshold =
      (available + EMPLOYER_NI.rate * st) /
      (1 + EMPLOYER_NI.rate + APPRENTICESHIP_LEVY_RATE);
    if (aboveThreshold > st) {
      salary = aboveThreshold;
    } else {
      // Branch 2: salary at or below the threshold — no employer NI.
      salary = available / (1 + APPRENTICESHIP_LEVY_RATE);
    }
  }

  const employerNi = employerNiFor(salary);
  const levy = salary * APPRENTICESHIP_LEVY_RATE;
  const takeHome = calculateTakeHome({ annualSalary: salary });

  return {
    assignmentIncome: round2(assignmentIncome),
    marginAnnual: round2(marginAnnual),
    employerNi: round2(employerNi),
    apprenticeshipLevy: round2(levy),
    grossSalary: round2(salary),
    holidayPayElement: round2(salary - salary / (1 + HOLIDAY_ACCRUAL_RATE)),
    takeHome,
    netMonthly: round2(takeHome.netAnnual / 12),
    netPerWorkedWeek:
      weeks > 0 ? round2(takeHome.netAnnual / weeks) : 0,
    shareOfAssignmentPercent:
      assignmentIncome > 0
        ? round2((takeHome.netAnnual / assignmentIncome) * 100)
        : 0,
  };
}
