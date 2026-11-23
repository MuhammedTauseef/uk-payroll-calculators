"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  SPL_RULES,
  addWeeks,
  calculateSharedParentalLeave,
  type SplBlockInput,
  type SplParent,
} from "@/lib/shared-parental-leave";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const dateFmt = new Intl.DateTimeFormat("en-GB", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

function fmtDate(iso: string): string {
  if (!iso) return "—";
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? "—" : dateFmt.format(d);
}

function parseAmount(value: string): number {
  const n = Number(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

function todayPlus(days: number): string {
  const d = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  return d.toISOString().slice(0, 10);
}

const inputClass =
  "w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-base text-slate-900 dark:text-slate-50 shadow-sm transition focus:border-brand-700 focus:outline-none focus:ring-1 focus:ring-brand-700";
const labelClass = "block text-sm font-medium text-slate-700 dark:text-slate-300";

interface BlockState {
  startDate: string;
  weeks: string;
}

export default function SharedParentalLeaveCalculator() {
  const [dueDate, setDueDate] = useState(() => todayPlus(98));
  const [motherSalary, setMotherSalary] = useState("30000");
  const [partnerSalary, setPartnerSalary] = useState("36000");
  const [leaveWeeks, setLeaveWeeks] = useState("22");
  const [smpWeeks, setSmpWeeks] = useState("22");
  const [motherBlocks, setMotherBlocks] = useState<BlockState[]>(() => [
    { startDate: addWeeks(todayPlus(98), 22), weeks: "8" },
  ]);
  const [partnerBlocks, setPartnerBlocks] = useState<BlockState[]>(() => [
    { startDate: addWeeks(todayPlus(98), 22), weeks: "9" },
  ]);

  const leaveNum = Math.min(52, Math.max(2, parseAmount(leaveWeeks) || 2));

  const toBlocks = (blocks: BlockState[]): SplBlockInput[] =>
    blocks
      .filter((b) => b.startDate)
      .map((b) => ({
        startDate: b.startDate,
        weeks: Math.max(0, Math.floor(parseAmount(b.weeks))),
      }))
      .filter((b) => b.weeks > 0);

  const result = useMemo(
    () =>
      calculateSharedParentalLeave({
        dueDate,
        motherAnnualSalary: parseAmount(motherSalary),
        partnerAnnualSalary: parseAmount(partnerSalary),
        motherMaternityLeaveWeeks: leaveNum,
        motherSmpWeeks: Math.min(39, Math.max(0, parseAmount(smpWeeks) || 0)),
        motherBlocks: toBlocks(motherBlocks),
        partnerBlocks: toBlocks(partnerBlocks),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [dueDate, motherSalary, partnerSalary, leaveNum, smpWeeks, motherBlocks, partnerBlocks],
  );

  const maternityEnd = result.dates.maternityEnd;

  const blockEditor = (
    parent: SplParent,
    blocks: BlockState[],
    setBlocks: (b: BlockState[]) => void,
  ) => (
    <div className="space-y-3">
      {blocks.map((b, i) => (
        <div key={i} className="grid grid-cols-[1fr_auto] items-end gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label
                htmlFor={`spl-${parent}-start-${i}`}
                className={labelClass}
              >
                Block {i + 1} starts
              </label>
              <input
                id={`spl-${parent}-start-${i}`}
                type="date"
                value={b.startDate}
                onChange={(e) => {
                  const next = [...blocks];
                  next[i] = { ...next[i], startDate: e.target.value };
                  setBlocks(next);
                }}
                className={inputClass}
              />
            </div>
            <div>
              <label
                htmlFor={`spl-${parent}-weeks-${i}`}
                className={labelClass}
              >
                Weeks
              </label>
              <input
                id={`spl-${parent}-weeks-${i}`}
                inputMode="numeric"
                value={b.weeks}
                onChange={(e) => {
                  const next = [...blocks];
                  next[i] = { ...next[i], weeks: e.target.value };
                  setBlocks(next);
                }}
                className={inputClass}
              />
            </div>
          </div>
          <button
            type="button"
            onClick={() => setBlocks(blocks.filter((_, j) => j !== i))}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
            aria-label={`Remove block ${i + 1}`}
          >
            Remove
          </button>
        </div>
      ))}
      {blocks.length < SPL_RULES.maxBlocksPerParent && (
        <button
          type="button"
          onClick={() =>
            setBlocks([...blocks, { startDate: maternityEnd, weeks: "4" }])
          }
          className="rounded-lg border border-dashed border-slate-300 px-3 py-2 text-sm font-medium text-brand-700 transition hover:bg-brand-50 dark:border-slate-700 dark:text-brand-300 dark:hover:bg-slate-800"
        >
          + Add a block (up to 3 each)
        </button>
      )}
    </div>
  );

  const allBlocks = [
    ...result.mother.blocks.map((b) => ({ ...b, who: "Mother" })),
    ...result.partner.blocks.map((b) => ({ ...b, who: "Partner" })),
  ].sort((a, b) => (a.startDate < b.startDate ? -1 : 1));

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="spl-due" className={labelClass}>
            Baby&apos;s due date (or date of birth)
          </label>
          <input
            id="spl-due"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Everything is counted from here: maternity leave, the
            blocks, the notice deadlines and the first-birthday cut-off.
          </p>
        </div>
        <div>
          <label htmlFor="spl-leave-weeks" className={labelClass}>
            Weeks of maternity leave the mother takes
          </label>
          <input
            id="spl-leave-weeks"
            inputMode="numeric"
            value={leaveWeeks}
            onChange={(e) => {
              setLeaveWeeks(e.target.value);
              const n = parseAmount(e.target.value);
              if (Number.isFinite(n) && n >= 2)
                setSmpWeeks(String(Math.min(39, Math.floor(n))));
            }}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Between 2 and 52. The first 2 weeks after the birth can
            never be shared — everything after that can. Shortening
            this is what creates the shared pool.
          </p>
        </div>
        <div>
          <label htmlFor="spl-mother-salary" className={labelClass}>
            Mother&apos;s salary (£ a year)
          </label>
          <input
            id="spl-mother-salary"
            inputMode="decimal"
            value={motherSalary}
            onChange={(e) => setMotherSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Her average weekly earnings are taken as salary ÷ 52 —
            they set her 90% figures for maternity pay and her own
            shared parental pay.
          </p>
        </div>
        <div>
          <label htmlFor="spl-partner-salary" className={labelClass}>
            Partner&apos;s salary (£ a year)
          </label>
          <input
            id="spl-partner-salary"
            inputMode="decimal"
            value={partnerSalary}
            onChange={(e) => setPartnerSalary(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Shared parental pay is capped at 90% of the earnings of
            the parent taking the week — the partner&apos;s weeks are
            worked out on the partner&apos;s pay, not the mother&apos;s.
          </p>
        </div>
        <div>
          <label htmlFor="spl-smp-weeks" className={labelClass}>
            Weeks of maternity pay (SMP) the mother takes
          </label>
          <input
            id="spl-smp-weeks"
            inputMode="numeric"
            value={smpWeeks}
            onChange={(e) => setSmpWeeks(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Up to 39. Most mothers end pay and leave together, so this
            follows the leave box above — change it only if her pay
            ends on a different week from her leave.
          </p>
        </div>
        <div className="hidden sm:block" />
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Mother&apos;s shared leave blocks
          </h3>
          <div className="mt-2">
            {blockEditor("mother", motherBlocks, setMotherBlocks)}
          </div>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Partner&apos;s shared leave blocks
          </h3>
          <div className="mt-2">
            {blockEditor("partner", partnerBlocks, setPartnerBlocks)}
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-slate-800/60 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Your shared parental leave plan
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Mother — maternity pay + her shared pay
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.motherSmp.total + result.mother.shppTotal)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {gbp.format(result.motherSmp.total)} SMP over{" "}
              {result.motherSmp.weeks} weeks
              {result.mother.shppTotal > 0 &&
                `, plus ${gbp.format(result.mother.shppTotal)} ShPP`}
            </p>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Partner — shared parental pay
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.partner.shppTotal)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              over {result.partner.paidWeeks} paid weeks
              {result.partner.unpaidWeeks > 0 &&
                ` (${result.partner.unpaidWeeks} unpaid)`}
            </p>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Household total pay
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.householdPayTotal)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              before tax and National Insurance
            </p>
          </div>
        </dl>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Leave pool — {result.leavePoolWeeks} weeks to share
            </h3>
            <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{
                  width: `${
                    result.leavePoolWeeks > 0
                      ? Math.min(
                          100,
                          (result.totalSplWeeks / result.leavePoolWeeks) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {result.totalSplWeeks} weeks booked ·{" "}
              {result.unusedLeaveWeeks} weeks still unused
            </p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Pay pool — {result.payPoolWeeks} weeks to share
            </h3>
            <div className="mt-2 h-2.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
              <div
                className="h-full rounded-full bg-brand-600"
                style={{
                  width: `${
                    result.payPoolWeeks > 0
                      ? Math.min(
                          100,
                          ((result.mother.paidWeeks + result.partner.paidWeeks) /
                            result.payPoolWeeks) *
                            100,
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {result.mother.paidWeeks + result.partner.paidWeeks} weeks
              paid · {result.unusedPayWeeks} weeks of pay unused
            </p>
          </div>
        </div>

        {allBlocks.length > 0 && (
          <div className="mt-5 overflow-x-auto">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
              Your blocks, dates and notice deadlines
            </h3>
            <table className="mt-2 w-full text-left text-sm table-stack">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="py-2 pr-3 font-semibold">Who</th>
                  <th className="py-2 pr-3 font-semibold">Leave</th>
                  <th className="py-2 pr-3 font-semibold">Weeks</th>
                  <th className="py-2 pr-3 font-semibold">
                    Give notice by
                  </th>
                  <th className="py-2 text-right font-semibold">Pay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {allBlocks.map((b, i) => (
                  <tr key={`${b.who}-${b.startDate}-${i}`}>
                    <td className="py-2 pr-3 font-medium">{b.who}</td>
                    <td className="py-2 pr-3">
                      {fmtDate(b.startDate)} – {fmtDate(b.endDate)}
                    </td>
                    <td className="py-2 pr-3">
                      {b.weeks}
                      {b.unpaidWeeks > 0 && ` (${b.unpaidWeeks} unpaid)`}
                    </td>
                    <td className="py-2 pr-3">{fmtDate(b.noticeDeadline)}</td>
                    <td className="py-2 text-right font-medium">
                      {gbp.format(b.shppTotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            The dates that matter
          </h3>
          <table className="mt-2 w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-2 pr-3">
                  Mother&apos;s maternity leave ends (shared leave can
                  start)
                </td>
                <td className="py-2 text-right font-medium">
                  {fmtDate(result.dates.maternityEnd)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Binding notice to end maternity leave — give it by
                </td>
                <td className="py-2 text-right font-medium">
                  {fmtDate(result.dates.curtailmentNoticeDeadline)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Partner&apos;s shared leave can start from
                </td>
                <td className="py-2 text-right font-medium">
                  {fmtDate(result.dates.earliestPartnerSpl)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">
                  Everything must end before the first birthday
                </td>
                <td className="py-2 text-right font-medium">
                  {fmtDate(result.dates.firstBirthday)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-5 overflow-x-auto">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-50">
            Three ways to split it — same family, same dates
          </h3>
          <table className="mt-2 w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3 font-semibold">Plan</th>
                <th className="py-2 pr-3 font-semibold">Weeks at home</th>
                <th className="py-2 text-right font-semibold">
                  Household pay
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              <tr>
                <td className="py-2 pr-3">Mother takes all 52 weeks</td>
                <td className="py-2 pr-3">
                  {result.scenarios.motherTakesAll.leaveWeeks}
                </td>
                <td className="py-2 text-right font-medium">
                  {gbp.format(result.scenarios.motherTakesAll.payTotal)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Your plan above</td>
                <td className="py-2 pr-3">
                  {result.scenarios.yourPlan.leaveWeeks}
                </td>
                <td className="py-2 text-right font-medium">
                  {gbp.format(result.scenarios.yourPlan.payTotal)}
                </td>
              </tr>
              <tr>
                <td className="py-2 pr-3">Shared half and half</td>
                <td className="py-2 pr-3">
                  {result.scenarios.halfEach.leaveWeeks}
                </td>
                <td className="py-2 text-right font-medium">
                  {gbp.format(result.scenarios.halfEach.payTotal)}
                </td>
              </tr>
            </tbody>
          </table>
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Sharing costs the household money only when a week moves
            from the mother&apos;s first 6 weeks at 90% of her pay, or
            to a parent whose 90% is below the flat rate. After week 6
            both parents are usually on the same flat rate, and sharing
            is pay-neutral.
          </p>
        </div>

        {result.warnings.length > 0 && (
          <div className="mt-4 space-y-1 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
            {result.warnings.map((w) => (
              <p key={w}>⚠ {w}</p>
            ))}
          </div>
        )}

        <PrintButton />
      </div>
      <StickyResultBar
        label="Household pay"
        value={gbp.format(result.householdPayTotal)}
      />
    </div>
  );
}

const ELIGIBILITY_QUESTIONS: string[] = [
  "Is the baby due (or a child placed for adoption) in England, Scotland or Wales?",
  "Has the mother worked for the same employer for at least 26 weeks, up to the 15th week before the due date?",
  "Will the mother still be working for that employer in the week before her shared leave starts?",
  "Does the mother earn at least £129 a week on average (the 2026/27 lower earnings limit)?",
  "Has the other parent worked in at least 26 of the 66 weeks before the week the baby is due?",
  "Has the other parent earned at least £390 in total across any 13 of those weeks?",
];

export function SplEligibilityChecker() {
  const [answers, setAnswers] = useState<(boolean | null)[]>(
    ELIGIBILITY_QUESTIONS.map(() => null),
  );
  const answered = answers.every((a) => a !== null);

  let verdict: { ok: boolean; text: string } | null = null;
  if (answered) {
    const [place, continuity, stillEmployed, earnings, partnerWeeks, partnerPay] =
      answers as boolean[];
    if (!place)
      verdict = {
        ok: false,
        text: "Shared parental leave and pay do not apply in Northern Ireland — the scheme covers England, Scotland and Wales only. The mother's maternity leave and pay still work the usual way.",
      };
    else if (!partnerWeeks || !partnerPay)
      verdict = {
        ok: false,
        text: "The other parent's work test is not met, so the mother cannot create shared parental leave — the partner needs 26 weeks of work in the 66 weeks before the due week, with at least £390 earned across 13 of them. She keeps her full maternity leave and pay instead.",
      };
    else if (!continuity || !stillEmployed)
      verdict = {
        ok: false,
        text: "The mother's own employment test for shared parental leave is not met — she needs 26 weeks with the same employer by the qualifying week and to stay with them until her shared leave starts. Her maternity leave and pay are unaffected.",
      };
    else if (!earnings)
      verdict = {
        ok: false,
        text: "The leave tests look met, but shared parental pay needs the mother to earn at least the lower earnings limit (£129 a week in 2026/27) on average. Below that, leave may still be shareable while the pay is not — check with the employer before booking blocks.",
      };
    else
      verdict = {
        ok: true,
        text: "On these answers you meet the main GOV.UK tests — the mother can end her maternity leave and pay early and share what's left, and each parent can take their own blocks as long as they are an employee of their own employer. This is a quick check, not a decision: employers confirm eligibility when the notices are given.",
      };
  }

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm sm:p-6">
      <div className="space-y-3">
        {ELIGIBILITY_QUESTIONS.map((q, i) => (
          <div
            key={q}
            className="flex flex-wrap items-center justify-between gap-2"
          >
            <p className="max-w-xl text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {q}
            </p>
            <div className="flex gap-2 print:hidden">
              {([true, false] as const).map((v) => (
                <button
                  key={String(v)}
                  type="button"
                  onClick={() => {
                    const next = [...answers];
                    next[i] = v;
                    setAnswers(next);
                  }}
                  className={`rounded-lg border px-3 py-1.5 text-sm font-medium transition ${
                    answers[i] === v
                      ? "border-brand-700 bg-brand-700 text-white"
                      : "border-slate-300 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                  }`}
                >
                  {v ? "Yes" : "No"}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      {verdict && (
        <p
          className={`mt-4 rounded-lg p-3 text-sm leading-relaxed ${
            verdict.ok
              ? "bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-200"
              : "bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-200"
          }`}
        >
          {verdict.text}
        </p>
      )}
      {!verdict && (
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Answer all six and the checker gives you a verdict.
        </p>
      )}
    </div>
  );
}
