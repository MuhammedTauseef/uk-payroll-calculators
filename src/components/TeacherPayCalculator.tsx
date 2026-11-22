"use client";

import MoneySlider from "@/components/MoneySlider";
import ResultActions from "@/components/ResultActions";
import ResultDonut, { DONUT_COLORS } from "@/components/ResultDonut";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  ALLOWANCE_RANGES,
  PAY_POINTS,
  REGIONS,
  SCALES,
  calculateTeacherPay,
  pointSalary,
  type LoanPlan,
  type PayYear,
  type RegionId,
  type ScaleId,
} from "@/lib/teacher-pay";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

type TlrChoice = "none" | "tlr1" | "tlr2" | "tlr3";

export default function TeacherPayCalculator() {
  const [year, setYear] = useState<PayYear>("2026-27");
  const [scale, setScale] = useState<ScaleId>("main");
  const [point, setPoint] = useState("M1");
  const [region, setRegion] = useState<RegionId>("rest");
  const [useCustom, setUseCustom] = useState(false);
  const [customSalary, setCustomSalary] = useState("40000");
  const [ftePercent, setFtePercent] = useState("100");
  const [tlrChoice, setTlrChoice] = useState<TlrChoice>("none");
  const [tlrAmount, setTlrAmount] = useState("3651");
  const [senOn, setSenOn] = useState(false);
  const [senAmount, setSenAmount] = useState("2885");
  const [pensionMember, setPensionMember] = useState(true);
  const [avcMonthly, setAvcMonthly] = useState("0");
  const [taxCode, setTaxCode] = useState("1257L");
  const [loanPlan, setLoanPlan] = useState<LoanPlan>("none");
  const [pgToo, setPgToo] = useState(false);

  const scalesForYear = SCALES.filter((s) => PAY_POINTS[year][s.id]);
  const activeScale: ScaleId = PAY_POINTS[year][scale] ? scale : "main";
  const points = Object.keys(PAY_POINTS[year][activeScale] ?? {});
  const activePoint = points.includes(point) ? point : points[0];
  const scaleSalary = pointSalary(year, activeScale, activePoint, region);
  const ranges = ALLOWANCE_RANGES[year];

  const reset = () => {
    setYear("2026-27");
    setScale("main");
    setPoint("M1");
    setRegion("rest");
    setUseCustom(false);
    setCustomSalary("40000");
    setFtePercent("100");
    setTlrChoice("none");
    setTlrAmount("3651");
    setSenOn(false);
    setSenAmount("2885");
    setPensionMember(true);
    setAvcMonthly("0");
    setTaxCode("1257L");
    setLoanPlan("none");
    setPgToo(false);
  };

  const result = useMemo(
    () =>
      calculateTeacherPay({
        year,
        fteSalary: useCustom ? parseAmount(customSalary) : scaleSalary,
        fteFraction: Math.min(1, Math.max(0.01, parseAmount(ftePercent) / 100)),
        tlrAnnual: tlrChoice === "none" ? 0 : parseAmount(tlrAmount),
        senAnnual: senOn ? parseAmount(senAmount) : 0,
        pensionMember,
        avcMonthly: parseAmount(avcMonthly),
        taxCode,
        loanPlan,
        postgraduateLoan: pgToo,
      }),
    [
      year,
      useCustom,
      customSalary,
      scaleSalary,
      ftePercent,
      tlrChoice,
      tlrAmount,
      senOn,
      senAmount,
      pensionMember,
      avcMonthly,
      taxCode,
      loanPlan,
      pgToo,
    ],
  );

  const deductions =
    result.pensionAnnual +
    result.avcAnnual +
    result.incomeTaxAnnual +
    result.niAnnual +
    result.studentLoanAnnual +
    result.postgraduateLoanAnnual;
  const showDonut = result.grossAnnual > 0 && deductions > 0;
  const donutSegments = showDonut
    ? [
        {
          label: "Take-home pay",
          value: Math.max(0, result.netAnnual),
          displayValue: gbp.format(result.netAnnual),
          color: DONUT_COLORS.deep,
        },
        ...(result.incomeTaxAnnual > 0
          ? [
              {
                label: "Income Tax",
                value: result.incomeTaxAnnual,
                displayValue: gbp.format(result.incomeTaxAnnual),
                color: DONUT_COLORS.accent,
              },
            ]
          : []),
        ...(result.niAnnual > 0
          ? [
              {
                label: "National Insurance",
                value: result.niAnnual,
                displayValue: gbp.format(result.niAnnual),
                color: DONUT_COLORS.light,
              },
            ]
          : []),
        ...(result.pensionAnnual + result.avcAnnual > 0
          ? [
              {
                label: "Pension & AVCs",
                value: result.pensionAnnual + result.avcAnnual,
                displayValue: gbp.format(result.pensionAnnual + result.avcAnnual),
                color: DONUT_COLORS.pale,
              },
            ]
          : []),
        ...(result.studentLoanAnnual + result.postgraduateLoanAnnual > 0
          ? [
              {
                label: "Student loan",
                value: result.studentLoanAnnual + result.postgraduateLoanAnnual,
                displayValue: gbp.format(
                  result.studentLoanAnnual + result.postgraduateLoanAnnual,
                ),
                color: DONUT_COLORS.light,
              },
            ]
          : []),
      ]
    : [];

  const rows: { label: string; annual: string; monthly: string }[] = [
    {
      label: "Gross pay",
      annual: gbp.format(result.grossAnnual),
      monthly: gbp.format(result.grossMonthly),
    },
    ...(result.pensionAnnual > 0
      ? [
          {
            label: `Teachers' Pension (${(result.pensionRate * 100).toFixed(1)}%)`,
            annual: `−${gbp.format(result.pensionAnnual)}`,
            monthly: `−${gbp.format(result.pensionAnnual / 12)}`,
          },
        ]
      : []),
    ...(result.avcAnnual > 0
      ? [
          {
            label: "Additional voluntary contributions",
            annual: `−${gbp.format(result.avcAnnual)}`,
            monthly: `−${gbp.format(result.avcAnnual / 12)}`,
          },
        ]
      : []),
    {
      label: "Income Tax",
      annual: `−${gbp.format(result.incomeTaxAnnual)}`,
      monthly: `−${gbp.format(result.incomeTaxAnnual / 12)}`,
    },
    {
      label: "National Insurance",
      annual: `−${gbp.format(result.niAnnual)}`,
      monthly: `−${gbp.format(result.niAnnual / 12)}`,
    },
    ...(result.studentLoanAnnual > 0
      ? [
          {
            label: "Student loan",
            annual: `−${gbp.format(result.studentLoanAnnual)}`,
            monthly: `−${gbp.format(result.studentLoanAnnual / 12)}`,
          },
        ]
      : []),
    ...(result.postgraduateLoanAnnual > 0
      ? [
          {
            label: "Postgraduate loan",
            annual: `−${gbp.format(result.postgraduateLoanAnnual)}`,
            monthly: `−${gbp.format(result.postgraduateLoanAnnual / 12)}`,
          },
        ]
      : []),
    {
      label: "Take-home pay",
      annual: gbp.format(result.netAnnual),
      monthly: gbp.format(result.netMonthly),
    },
  ];

  const tlrRange =
    tlrChoice === "tlr1"
      ? ranges.tlr1
      : tlrChoice === "tlr2"
        ? ranges.tlr2
        : ranges.tlr3;

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="tp-year" className={labelClass}>
            Pay year
          </label>
          <select
            id="tp-year"
            value={year}
            onChange={(e) => setYear(e.target.value as PayYear)}
            className={inputClass}
          >
            <option value="2026-27">2026/27 (from September 2026)</option>
            <option value="2025-26">2025/26 (current year)</option>
          </select>
        </div>
        <div>
          <label htmlFor="tp-region" className={labelClass}>
            Where you teach
          </label>
          <select
            id="tp-region"
            value={region}
            onChange={(e) => setRegion(e.target.value as RegionId)}
            className={inputClass}
          >
            {REGIONS.map((r) => (
              <option key={r.id} value={r.id}>
                {r.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="tp-scale" className={labelClass}>
            Pay scale
          </label>
          <select
            id="tp-scale"
            value={activeScale}
            onChange={(e) => {
              const next = e.target.value as ScaleId;
              setScale(next);
              const first = Object.keys(PAY_POINTS[year][next] ?? {})[0];
              if (first) setPoint(first);
            }}
            className={inputClass}
          >
            {scalesForYear.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
          {year === "2025-26" && (
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              The 2025 document does not publish lead practitioner or
              leadership points here — switch to 2026/27 for those scales.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="tp-point" className={labelClass}>
            Pay point
          </label>
          <select
            id="tp-point"
            value={activePoint}
            onChange={(e) => setPoint(e.target.value)}
            className={inputClass}
            disabled={useCustom}
          >
            {points.map((p) => (
              <option key={p} value={p}>
                {p} — {gbp.format(pointSalary(year, activeScale, p, region))} a
                year
              </option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={useCustom}
              onChange={(e) => setUseCustom(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-700"
            />
            Use my own salary instead (academies and independent schools
            often pay off-scale)
          </label>
          {useCustom && (
            <div className="mt-3">
              <MoneySlider
                id="tp-custom"
                label="Your full-time salary (£ a year)"
                value={customSalary}
                onChange={setCustomSalary}
                min={0}
                max={200000}
                step={250}
              />
            </div>
          )}
        </div>
        <MoneySlider
          id="tp-fte"
          label="How much of full-time you work (%)"
          value={ftePercent}
          onChange={setFtePercent}
          min={10}
          max={100}
          step={5}
          hint="100% is full-time. 60% is three days a week, 80% is four."
        />
        <div>
          <label htmlFor="tp-tlr" className={labelClass}>
            TLR payment
          </label>
          <select
            id="tp-tlr"
            value={tlrChoice}
            onChange={(e) => {
              const next = e.target.value as TlrChoice;
              setTlrChoice(next);
              if (next !== "none") {
                const r = ranges[next];
                setTlrAmount(String(r[0]));
              }
            }}
            className={inputClass}
          >
            <option value="none">No TLR</option>
            <option value="tlr1">
              TLR1 ({gbp.format(ranges.tlr1[0])}–{gbp.format(ranges.tlr1[1])})
            </option>
            <option value="tlr2">
              TLR2 ({gbp.format(ranges.tlr2[0])}–{gbp.format(ranges.tlr2[1])})
            </option>
            <option value="tlr3">
              TLR3 ({gbp.format(ranges.tlr3[0])}–{gbp.format(ranges.tlr3[1])},
              fixed-term)
            </option>
          </select>
          {tlrChoice !== "none" && (
            <div className="mt-2">
              <label htmlFor="tp-tlr-amount" className={labelClass}>
                TLR value (£ a year, full-time)
              </label>
              <input
                id="tp-tlr-amount"
                type="number"
                inputMode="numeric"
                min={tlrRange[0]}
                max={tlrRange[1]}
                step="1"
                value={tlrAmount}
                onChange={(e) => setTlrAmount(e.target.value)}
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your school sets the exact value inside the range. Part-time
                TLRs are pro-rated by your FTE.
              </p>
            </div>
          )}
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={senOn}
              onChange={(e) => setSenOn(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-700"
            />
            I get a SEN allowance ({gbp.format(ranges.sen[0])}–
            {gbp.format(ranges.sen[1])})
          </label>
          {senOn && (
            <div className="mt-2">
              <label htmlFor="tp-sen-amount" className={labelClass}>
                SEN value (£ a year, full-time)
              </label>
              <input
                id="tp-sen-amount"
                type="number"
                inputMode="numeric"
                min={ranges.sen[0]}
                max={ranges.sen[1]}
                step="1"
                value={senAmount}
                onChange={(e) => setSenAmount(e.target.value)}
                className={inputClass}
              />
            </div>
          )}
        </div>
        <div>
          <label className="flex items-start gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <input
              type="checkbox"
              checked={pensionMember}
              onChange={(e) => setPensionMember(e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-brand-700"
            />
            I am in the Teachers&apos; Pension Scheme
          </label>
          <div className="mt-2">
            <label htmlFor="tp-avc" className={labelClass}>
              Extra pension top-ups / AVCs (£ a month)
            </label>
            <input
              id="tp-avc"
              type="number"
              inputMode="numeric"
              min="0"
              step="1"
              value={avcMonthly}
              onChange={(e) => setAvcMonthly(e.target.value)}
              className={inputClass}
              disabled={!pensionMember}
            />
          </div>
        </div>
        <div>
          <label htmlFor="tp-taxcode" className={labelClass}>
            Tax code (from your payslip)
          </label>
          <input
            id="tp-taxcode"
            type="text"
            value={taxCode}
            onChange={(e) => setTaxCode(e.target.value)}
            className={inputClass}
            placeholder="1257L"
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Most teachers are on 1257L. BR, D0, D1, 0T, NT and K codes are
            handled too.
          </p>
        </div>
        <div>
          <label htmlFor="tp-loan" className={labelClass}>
            Student loan plan
          </label>
          <select
            id="tp-loan"
            value={loanPlan}
            onChange={(e) => setLoanPlan(e.target.value as LoanPlan)}
            className={inputClass}
          >
            <option value="none">No student loan</option>
            <option value="plan1">Plan 1</option>
            <option value="plan2">Plan 2</option>
            <option value="plan4">Plan 4 (Scotland)</option>
            <option value="plan5">Plan 5</option>
          </select>
          {loanPlan !== "none" && (
            <label className="mt-2 flex items-start gap-2 text-sm text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={pgToo}
                onChange={(e) => setPgToo(e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              I also have a Postgraduate Loan
            </label>
          )}
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your take-home pay
        </h2>
        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.netMonthly)} a month
        </p>
        <p className="mt-1 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          {gbp.format(result.netAnnual)} a year — {gbp.format(result.netWeekly)}{" "}
          a week — from {gbp.format(result.grossAnnual)} of gross pay
          {result.pensionRate > 0 &&
            `, with pension at ${(result.pensionRate * 100).toFixed(1)}% of pay`}
          . Your school adds {gbp.format(result.employerPensionAnnual)} a year
          in employer pension contributions on top, and this year builds{" "}
          {gbp.format(result.careAccrualAnnual)} a year of guaranteed pension
          (your pay divided by 57).
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Payslip line
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  A year
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  A month
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {rows.map((r) => (
                <tr
                  key={r.label}
                  className={
                    r.label === "Take-home pay"
                      ? "font-semibold text-slate-900 dark:text-slate-50"
                      : undefined
                  }
                >
                  <td className="px-4 py-2">{r.label}</td>
                  <td className="px-4 py-2">{r.annual}</td>
                  <td className="px-4 py-2">{r.monthly}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {showDonut && (
          <ResultDonut
            segments={donutSegments}
            centerLabel="Of your gross pay, you keep"
            centerValue={`${Math.round((result.netAnnual / result.grossAnnual) * 100)}%`}
          />
        )}

        <ResultActions
          image={{
            title: "Teaching Pay",
            headline: `${gbp.format(result.netMonthly)} a month take-home`,
            headlineNote: `On ${gbp.format(result.grossAnnual)} gross pay (${year === "2026-27" ? "2026/27" : "2025/26"} scales)`,
            rows: [
              {
                label: "Gross pay a year",
                value: gbp.format(result.grossAnnual),
              },
              {
                label: "Income Tax a year",
                value: gbp.format(result.incomeTaxAnnual),
              },
              {
                label: "National Insurance a year",
                value: gbp.format(result.niAnnual),
              },
              {
                label: "Take-home a year",
                value: gbp.format(result.netAnnual),
              },
            ],
            fileName: "payrollcalc-teaching-pay-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label="Take-home pay a month"
        value={gbp.format(result.netMonthly)}
      />
    </div>
  );
}
