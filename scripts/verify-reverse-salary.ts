/**
 * Hand-computed verification of the reverse salary solver.
 *
 * Run with:  npm run verify:reverse-salary
 *
 * The solver (src/lib/reverse-salary.ts) inverts the shipped
 * payslip engine by binary search. This script checks it three
 * ways, all worked out independently of the code first:
 *
 *  (c) An exact-line anchor on the underlying UK engine: Income Tax
 *      at £50,270 is £7,540.00 (taxable £37,700 × 20%).
 *  (a) Round-trips: forward-calc the net at five gross salaries,
 *      then solve back from that net — the recovered gross must be
 *      within £1 of the original (the forward net is rounded to
 *      the penny, so pennies of slack are expected).
 *  (b) The page's three worked examples, hand-solved below from
 *      the 2026/27 bands, and cross-checked against the published
 *      solver tables of rival calculators (see the build record):
 *        (i)  £2,500/mo target, plain: TapTax and accepted.co.uk
 *             both publish £36,778 (hand-solve: net = 0.72G +
 *             £3,519.60 in the basic band → G = £36,778.33).
 *        (ii) £3,000/mo target with Plan 2: poundsum publishes
 *             £47,359 (hand-solve on the engine's monthly-threshold
 *             basis: net = 0.63G + £6,163.44 → G = £47,359.62).
 *        (iii) £2,000/mo target with a 5% net-pay pension, hand-
 *             solved only: net = 0.68G + £3,519.60 → G = £30,118.24.
 * Exits non-zero if any figure disagrees.
 */
import { calculateRequiredSalary } from "../src/lib/reverse-salary.ts";
import { calculatePayslipBreakdown } from "../src/lib/payslip-calculator.ts";
import { incomeTaxFor } from "../src/lib/takehome.ts";

let failures = 0;

function check(
  caseName: string,
  field: string,
  actual: number,
  expected: number,
  tolerance = 0.011,
) {
  if (Math.abs(actual - expected) > tolerance) {
    failures += 1;
    console.error(
      `FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`,
    );
  }
}

// (c) Exact-line anchor on the UK engine.
check("anchor", "incomeTaxFor(50270)", incomeTaxFor(50270), 7540);

// (a) Round-trips.
const roundTrips: {
  gross: number;
  pensionPercent: number;
  plan: "plan2" | null;
}[] = [
  { gross: 28000, pensionPercent: 0, plan: null },
  { gross: 42000, pensionPercent: 5, plan: null },
  { gross: 55000, pensionPercent: 0, plan: "plan2" },
  { gross: 85000, pensionPercent: 0, plan: null },
  { gross: 120000, pensionPercent: 0, plan: null },
];
for (const t of roundTrips) {
  const fwd = calculatePayslipBreakdown({
    annualSalary: t.gross,
    taxCode: "1257L",
    pensionPercent: t.pensionPercent,
    studentLoanPlan: t.plan,
    postgraduateLoanToo: false,
  });
  const back = calculateRequiredSalary({
    targetNetAnnual: fwd.netAnnual,
    taxCode: "1257L",
    pensionPercent: t.pensionPercent,
    studentLoanPlan: t.plan,
    postgraduateLoanToo: false,
  });
  check(
    `round-trip £${t.gross}`,
    "recoveredGross",
    back.requiredGrossAnnual,
    t.gross,
    1.0,
  );
  // The achieved net must never fall short of the target.
  if (back.achievedNetAnnual < fwd.netAnnual - 0.001) {
    failures += 1;
    console.error(
      `FAIL round-trip £${t.gross} — achieved net ${back.achievedNetAnnual} < target ${fwd.netAnnual}`,
    );
  }
}

// (b)(i) £2,500/mo target, plain.
{
  const r = calculateRequiredSalary({
    targetNetAnnual: 30000,
    taxCode: "1257L",
    pensionPercent: 0,
    studentLoanPlan: null,
    postgraduateLoanToo: false,
  });
  check("case i", "requiredGross", r.requiredGrossAnnual, 36778.34, 1.0);
  check("case i", "incomeTax", r.breakdown.incomeTaxAnnual, 4841.67, 1.0);
  check("case i", "ni", r.breakdown.employeeNiAnnual, 1936.67, 1.0);
}

// (b)(ii) £3,000/mo target with Plan 2.
{
  const r = calculateRequiredSalary({
    targetNetAnnual: 36000,
    taxCode: "1257L",
    pensionPercent: 0,
    studentLoanPlan: "plan2",
    postgraduateLoanToo: false,
  });
  check("case ii", "requiredGross", r.requiredGrossAnnual, 47359.62, 1.0);
}

// (b)(iii) £2,000/mo target with a 5% pension.
{
  const r = calculateRequiredSalary({
    targetNetAnnual: 24000,
    taxCode: "1257L",
    pensionPercent: 5,
    studentLoanPlan: null,
    postgraduateLoanToo: false,
  });
  check("case iii", "requiredGross", r.requiredGrossAnnual, 30118.24, 1.0);
}

if (failures > 0) {
  console.error(`verify-reverse-salary: ${failures} check(s) FAILED`);
  process.exit(1);
}
console.log("verify-reverse-salary: all hand-computed cases pass");
