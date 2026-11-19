"use client";

import PrintButton from "@/components/PrintButton";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import {
  calculateChildcare,
  type ChildInput,
  type ChildcareInput,
} from "@/lib/childcare";

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

export default function ChildcareCalculator() {
  const [children, setChildren] = useState<ChildInput[]>([
    { monthlyCost: 1000, disabled: false },
  ]);
  const [household, setHousehold] = useState<"single" | "couple">("couple");
  const [parent1Income, setParent1Income] = useState("35000");
  const [parent2Income, setParent2Income] = useState("30000");
  const [ageBand, setAgeBand] = useState<ChildcareInput["parentAgeBand"]>("21+");

  const result = useMemo(
    () =>
      calculateChildcare({
        children,
        household,
        parent1Income: parseAmount(parent1Income),
        parent2Income: parseAmount(parent2Income),
        parentAgeBand: ageBand,
      }),
    [children, household, parent1Income, parent2Income, ageBand],
  );

  const updateChild = (idx: number, patch: Partial<ChildInput>) =>
    setChildren((cs) => cs.map((c, i) => (i === idx ? { ...c, ...patch } : c)));

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="cc-household" className={labelClass}>
            Who is claiming?
          </label>
          <select
            id="cc-household"
            value={household}
            onChange={(e) => setHousehold(e.target.value as "single" | "couple")}
            className={inputClass}
          >
            <option value="couple">Couple — both parents&apos; income counts</option>
            <option value="single">Single parent</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Tax-Free Childcare checks every parent in the household, not
            just the one who applies.
          </p>
        </div>
        <div>
          <label htmlFor="cc-ageband" className={labelClass}>
            Younger parent&apos;s age band
          </label>
          <select
            id="cc-ageband"
            value={ageBand}
            onChange={(e) => setAgeBand(e.target.value as ChildcareInput["parentAgeBand"])}
            className={inputClass}
          >
            <option value="21+">21 or over</option>
            <option value="18-20">18 to 20</option>
            <option value="under-18">Under 18 or apprentice</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Used for the minimum-earnings check — you must expect to earn
            at least 16 hours a week at minimum wage.
          </p>
        </div>
        <div>
          <label htmlFor="cc-p1" className={labelClass}>
            Parent 1 — expected yearly income (£)
          </label>
          <input
            id="cc-p1"
            inputMode="decimal"
            value={parent1Income}
            onChange={(e) => setParent1Income(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Adjusted net income — the figure the £100,000 limit uses.
          </p>
        </div>
        {household === "couple" && (
          <div>
            <label htmlFor="cc-p2" className={labelClass}>
              Parent 2 — expected yearly income (£)
            </label>
            <input
              id="cc-p2"
              inputMode="decimal"
              value={parent2Income}
              onChange={(e) => setParent2Income(e.target.value)}
              className={inputClass}
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              If either parent expects over £100,000, the whole claim stops.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 space-y-4 print:hidden">
        {children.map((child, idx) => (
          <div
            key={idx}
            className="grid gap-4 rounded-xl border border-slate-200 dark:border-slate-800 p-4 sm:grid-cols-2"
          >
            <div>
              <label htmlFor={`cc-cost-${idx}`} className={labelClass}>
                Child {idx + 1} — childcare bill per month (£)
              </label>
              <input
                id={`cc-cost-${idx}`}
                inputMode="decimal"
                value={child.monthlyCost === 0 ? "" : String(child.monthlyCost)}
                onChange={(e) =>
                  updateChild(idx, { monthlyCost: parseAmount(e.target.value) })
                }
                className={inputClass}
              />
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Nursery, childminder, breakfast or after-school club —
                a registered provider.
              </p>
            </div>
            <div className="flex items-end justify-between gap-3 pb-1">
              <label className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={child.disabled}
                  onChange={(e) => updateChild(idx, { disabled: e.target.checked })}
                  className="h-4 w-4 rounded border-slate-300"
                />
                Disabled child (cap doubles)
              </label>
              {children.length > 1 && (
                <button
                  type="button"
                  onClick={() => setChildren((cs) => cs.filter((_, i) => i !== idx))}
                  className="text-sm font-semibold text-red-600 hover:text-red-700"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
        ))}
        {children.length < 4 && (
          <button
            type="button"
            onClick={() =>
              setChildren((cs) => [...cs, { monthlyCost: 800, disabled: false }])
            }
            className="rounded-lg border border-brand-700 px-4 py-2 text-sm font-semibold text-brand-700 transition hover:bg-brand-50 dark:text-brand-300 dark:hover:bg-slate-800"
          >
            + Add another child
          </button>
        )}
      </div>

      <div className="mt-6 rounded-xl bg-brand-50 p-4 dark:bg-slate-800/60 sm:p-5">
        <h2 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Your Tax-Free Childcare top-up
        </h2>
        <dl className="mt-3 grid gap-4 sm:grid-cols-3">
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Government adds per year
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.totalAnnualTopUp)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              You pay in per month
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.totalAnnualDeposit / 12)}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-600 dark:text-slate-300">
              Your real cost per month
            </dt>
            <dd className="text-2xl font-bold text-slate-900 dark:text-slate-50">
              {gbp.format(result.effectiveMonthlyCost)}
            </dd>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              of a {gbp.format(result.totalMonthlyBill)} bill
            </p>
          </div>
        </dl>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <th className="py-2 pr-3 font-semibold">Child</th>
                <th className="py-2 pr-3 font-semibold">Bill / 3 months</th>
                <th className="py-2 pr-3 font-semibold">Gov top-up / 3 months</th>
                <th className="py-2 pr-3 font-semibold">Top-up / year</th>
                <th className="py-2 font-semibold">Unused allowance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {result.perChild.map((c, idx) => (
                <tr key={idx}>
                  <td className="py-2 pr-3">
                    Child {idx + 1}
                    {c.disabled ? " (disabled)" : ""}
                  </td>
                  <td className="py-2 pr-3">{gbp.format(c.quarterlyBill)}</td>
                  <td className="py-2 pr-3">{gbp.format(c.quarterlyTopUp)}</td>
                  <td className="py-2 pr-3">{gbp.format(c.annualTopUp)}</td>
                  <td className="py-2">
                    {c.unusedQuarterlyTopUp > 0
                      ? `${gbp.format(c.unusedQuarterlyTopUp)} per quarter`
                      : "Full cap used"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-300">
          {result.overIncomeLimit && (
            <p className="font-medium text-red-600 dark:text-red-400">
              ⚠ On these incomes the claim fails: one parent expects over
              £100,000 adjusted net income, and Tax-Free Childcare stops
              completely — there is no taper. Pension contributions and
              salary sacrifice can bring adjusted net income back under
              the line.
            </p>
          )}
          {result.belowMinimumEarnings && (
            <p className="font-medium text-amber-600 dark:text-amber-400">
              ⚠ One parent&apos;s income is below the minimum-earnings
              line (about {gbp.format(result.minimumEarningsPerQuarter)}{" "}
              expected over the next 3 months). Most working parents clear
              it; some exceptions apply — for example if a parent is on
              parental leave or cannot work.
            </p>
          )}
          {!result.overIncomeLimit && (
            <p>
              The top-up is worked out in 3-month blocks, so a term-time
              bill that lands in one block can waste cap while another
              block sits empty. You must reconfirm eligibility every
              3 months, and you cannot claim Tax-Free Childcare at the
              same time as Universal Credit childcare support or old
              employer childcare vouchers.
            </p>
          )}
        </div>

        <PrintButton />
      </div>
      <StickyResultBar
        label="Government top-up per year"
        value={gbp.format(result.totalAnnualTopUp)}
      />
    </div>
  );
}
