"use client";

import ResultActions from "@/components/ResultActions";
import StickyResultBar from "@/components/StickyResultBar";

import { useMemo, useState } from "react";
import { calculateCis } from "@/lib/cis";
import { CIS, type CisStatus } from "@/lib/rates";

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

const STATUS_LABELS: Record<CisStatus, string> = {
  verified: "Registered and verified — 20%",
  unverified: "Not registered or not verified — 30%",
  gross: "Gross payment status — 0%",
};

export default function CisDeductionCalculator() {
  const [status, setStatus] = useState<CisStatus>("verified");
  const [labour, setLabour] = useState("1000");
  const [materials, setMaterials] = useState("400");
  const [plantHire, setPlantHire] = useState("0");
  const [consumables, setConsumables] = useState("0");
  const [prefab, setPrefab] = useState("0");
  const [vat, setVat] = useState("0");

  const reset = () => {
    setStatus("verified");
    setLabour("1000");
    setMaterials("400");
    setPlantHire("0");
    setConsumables("0");
    setPrefab("0");
    setVat("0");
  };

  const result = useMemo(
    () =>
      calculateCis({
        status,
        labour: parseAmount(labour),
        materials: parseAmount(materials),
        plantHire: parseAmount(plantHire),
        consumables: parseAmount(consumables),
        prefabMaterials: parseAmount(prefab),
        vat: parseAmount(vat),
      }),
    [status, labour, materials, plantHire, consumables, prefab, vat],
  );

  return (
    <div className="relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm print:border-slate-300 print:shadow-none sm:p-6">
      <div className="grid gap-4 print:hidden sm:grid-cols-2">
        <div>
          <label htmlFor="cis-status" className={labelClass}>
            Subcontractor&apos;s CIS status
          </label>
          <select
            id="cis-status"
            value={status}
            onChange={(e) => setStatus(e.target.value as CisStatus)}
            className={inputClass}
          >
            <option value="verified">Registered and verified — deduct 20%</option>
            <option value="unverified">
              Not registered or not verified — deduct 30%
            </option>
            <option value="gross">Gross payment status — deduct 0%</option>
          </select>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            HMRC sets the rate when the contractor verifies the
            subcontractor — it is not a choice.
          </p>
        </div>
        <div>
          <label htmlFor="cis-labour" className={labelClass}>
            Labour element (£)
          </label>
          <input
            id="cis-labour"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={labour}
            onChange={(e) => setLabour(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            The part of the payment for the work itself, before VAT.
            This is the only part the deduction is taken from.
          </p>
        </div>
        <div>
          <label htmlFor="cis-materials" className={labelClass}>
            Materials (£)
          </label>
          <input
            id="cis-materials"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={materials}
            onChange={(e) => setMaterials(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            What the subcontractor actually paid for materials, at
            cost — any mark-up on materials counts as labour.
          </p>
        </div>
        <div>
          <label htmlFor="cis-plant" className={labelClass}>
            Plant hire (£)
          </label>
          <input
            id="cis-plant"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={plantHire}
            onChange={(e) => setPlantHire(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Hired plant and equipment charged on the invoice, before
            VAT. Left out of the deduction.
          </p>
        </div>
        <div>
          <label htmlFor="cis-consumables" className={labelClass}>
            Consumable stores &amp; fuel (£)
          </label>
          <input
            id="cis-consumables"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={consumables}
            onChange={(e) => setConsumables(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consumables and fuel used on the job — but not fuel for
            travelling, which stays in the deduction.
          </p>
        </div>
        <div>
          <label htmlFor="cis-prefab" className={labelClass}>
            Manufacturing / prefab materials (£)
          </label>
          <input
            id="cis-prefab"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={prefab}
            onChange={(e) => setPrefab(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Materials used in manufacturing or prefabricating
            materials for the job. Left out of the deduction.
          </p>
        </div>
        <div>
          <label htmlFor="cis-vat" className={labelClass}>
            VAT charged (£, if any)
          </label>
          <input
            id="cis-vat"
            type="number"
            inputMode="decimal"
            min="0"
            step="1"
            value={vat}
            onChange={(e) => setVat(e.target.value)}
            className={inputClass}
          />
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            VAT never enters the deduction and is paid over in full.
            Leave at £0 under the domestic reverse charge.
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 dark:border-brand-900 bg-brand-50 dark:bg-brand-900/30 p-5 print:mt-0 print:border-slate-300">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-brand-700 dark:text-brand-300">
          Your result
        </h2>

        <div className="mt-2 hidden text-sm leading-relaxed text-slate-700 dark:text-slate-300 print:block">
          <p className="font-semibold text-slate-900 dark:text-slate-50">
            CIS deduction calculation — inputs used
          </p>
          <p>
            Status: {STATUS_LABELS[status]} · Labour:{" "}
            {gbp.format(parseAmount(labour))} · Materials:{" "}
            {gbp.format(parseAmount(materials))} · Plant hire:{" "}
            {gbp.format(parseAmount(plantHire))} · Consumables &amp;
            fuel: {gbp.format(parseAmount(consumables))} · Prefab
            materials: {gbp.format(parseAmount(prefab))} · VAT:{" "}
            {gbp.format(parseAmount(vat))}.
          </p>
        </div>

        <p className="mt-2 text-4xl font-bold tracking-tight text-brand-800 dark:text-brand-300">
          {gbp.format(result.deduction)}
        </p>
        <p className="text-sm text-slate-600 dark:text-slate-300">
          {result.ratePercent > 0 ? (
            <>
              CIS deduction at {result.ratePercent}% of the{" "}
              {gbp.format(result.deductionBase)} labour element. The
              subcontractor receives{" "}
              {gbp.format(result.netToSubcontractor)} and{" "}
              {gbp.format(result.hmrcPayment)} goes to HMRC as an
              advance payment towards the subcontractor&apos;s own
              tax bill.
            </>
          ) : (
            <>
              No CIS deduction — with gross payment status the
              subcontractor is paid the full{" "}
              {gbp.format(result.netToSubcontractor)} and nothing is
              sent to HMRC from this payment.
            </>
          )}
        </p>

        <div className="mt-5 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <table className="w-full text-left text-sm table-stack">
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Labour — the deduction is taken from this
                </td>
                <td className="px-4 py-2">
                  {gbp.format(result.deductionBase)}
                </td>
              </tr>
              {result.materials > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Materials at cost — excluded
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.materials)}
                  </td>
                </tr>
              )}
              {result.plantHire > 0 && (
                <tr>
                  <td className="px-4 py-2">Plant hire — excluded</td>
                  <td className="px-4 py-2">
                    {gbp.format(result.plantHire)}
                  </td>
                </tr>
              )}
              {result.consumables > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Consumable stores &amp; fuel — excluded
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.consumables)}
                  </td>
                </tr>
              )}
              {result.prefabMaterials > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    Manufacturing / prefab materials — excluded
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.prefabMaterials)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2 font-medium">
                  Gross payment (before VAT)
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(result.grossPayment)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  CIS deduction at {result.ratePercent}%
                </td>
                <td className="px-4 py-2">
                  −{gbp.format(result.deduction)}
                </td>
              </tr>
              {result.vat > 0 && (
                <tr>
                  <td className="px-4 py-2">
                    VAT — paid over in full, never deducted from
                  </td>
                  <td className="px-4 py-2">
                    {gbp.format(result.vat)}
                  </td>
                </tr>
              )}
              <tr>
                <td className="px-4 py-2 font-medium">
                  Net paid to the subcontractor
                </td>
                <td className="px-4 py-2 font-medium">
                  {gbp.format(result.netToSubcontractor)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <dl className="mt-4 space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
          <div>
            <dt className="inline font-medium">Contractor: </dt>
            <dd className="inline">
              report this payment on the CIS300 monthly return due by
              the {CIS.returnDueDay}th, pay{" "}
              {gbp.format(result.hmrcPayment)} to HMRC by the{" "}
              {CIS.payDueDayElectronic}nd of the following month (
              {CIS.payDueDayPost}th by post), and give the
              subcontractor a payment and deduction statement within{" "}
              {CIS.statementDays} days of the end of the tax month.
            </dd>
          </div>
          <div>
            <dt className="inline font-medium">Subcontractor: </dt>
            <dd className="inline">
              {result.deduction > 0 ? (
                <>
                  you receive {gbp.format(result.netToSubcontractor)}.
                  The {gbp.format(result.deduction)} deduction is not
                  extra tax — it is a payment on account that you set
                  against your own tax bill, on your Self Assessment
                  return if you are a sole trader or partner, or
                  through payroll on an Employer Payment Summary if
                  you trade as a limited company. Keep the payment
                  and deduction statement as your evidence.
                </>
              ) : (
                <>
                  you receive the full{" "}
                  {gbp.format(result.netToSubcontractor)} — there is
                  no deduction to claim back from this payment.
                </>
              )}
            </dd>
          </div>
          {result.grossPayment > 0 && result.deduction > 0 && (
            <div>
              <dt className="inline font-medium">The real bite: </dt>
              <dd className="inline">
                because the rate applies to labour only, the deduction
                is {result.effectivePercentOfGross}% of the whole{" "}
                {gbp.format(result.grossPayment)} payment —{" "}
                {gbp.format(result.excludedTotal)} of excluded costs
                were left out of the calculation.
              </dd>
            </div>
          )}
        </dl>

        <ResultActions
          image={{
            title: "CIS Deduction",
            headline: gbp.format(result.deduction),
            headlineNote: `At ${result.ratePercent}% on ${gbp.format(result.deductionBase)} of labour`,
            rows: [
              {
                label: "Deduction base (labour)",
                value: gbp.format(result.deductionBase),
              },
              {
                label: "Excluded costs",
                value: gbp.format(result.excludedTotal),
              },
              {
                label: "Gross payment",
                value: gbp.format(result.grossPayment),
              },
              {
                label: "Net to subcontractor",
                value: gbp.format(result.netToSubcontractor),
              },
            ],
            fileName: "payrollcalc-cis-deduction-result.png",
          }}
          onReset={reset}
        />
      </div>
      <StickyResultBar
        label={`CIS deduction at ${result.ratePercent}%`}
        value={gbp.format(result.deduction)}
      />
    </div>
  );
}
