import { CIS, type CisStatus } from "./rates.ts";

/**
 * Construction Industry Scheme (CIS) — the deduction calculation.
 *
 * Rules (GOV.UK "Construction Industry Scheme: contractor guide"
 * and "Construction Industry Scheme: subcontractor guide",
 * verified 24 November 2026):
 *   - A contractor paying a subcontractor under a construction
 *     contract deducts a percentage of the payment and pays it to
 *     HMRC as an advance payment towards the subcontractor's own
 *     tax and National Insurance.
 *   - The rate is set by HMRC at verification, not chosen by the
 *     contractor: 20% for a registered, verified subcontractor,
 *     30% for one who is unregistered or cannot be verified, and
 *     0% where the subcontractor holds gross payment status.
 *   - The deduction is worked out on the LABOUR element only.
 *     Before applying the rate, take off: VAT (which never enters
 *     the calculation at all), the cost of materials the
 *     subcontractor paid for directly (a mark-up on materials
 *     counts as labour and stays in), consumable stores, fuel
 *     used other than for travelling, plant hire, and materials
 *     used in manufacturing or prefabricating materials. Travel
 *     and subsistence recharged to the contractor stay IN the
 *     amount the deduction is calculated on.
 *   - The subcontractor is paid the invoice total minus the
 *     deduction: the VAT is paid over in full (where VAT was
 *     charged at all — under the domestic reverse charge no VAT
 *     is charged on the invoice), and the deduction goes to HMRC
 *     by the 22nd of the following month (19th by post), with
 *     the payment reported on the CIS300 return due by the 19th.
 *
 * The inputs mirror an itemised subcontractor invoice: a labour
 * figure plus one field per GOV.UK exclusion, so a real invoice
 * can be reproduced line by line.
 */

export interface CisInput {
  /** Payment status HMRC set at verification. */
  status: CisStatus;
  /** Labour element of the payment, £ (excl. VAT). */
  labour: number;
  /** Materials the subcontractor paid for directly, at cost, £ (excl. VAT). */
  materials: number;
  /** Plant hire charged on the invoice, £ (excl. VAT). */
  plantHire: number;
  /** Consumable stores and fuel other than travelling fuel, £ (excl. VAT). */
  consumables: number;
  /** Materials used in manufacturing or prefabricating materials, £ (excl. VAT). */
  prefabMaterials: number;
  /** VAT charged on the invoice, £ (0 under the domestic reverse charge). */
  vat: number;
}

export interface CisResult {
  status: CisStatus;
  /** Deduction rate as a fraction (0.2, 0.3 or 0). */
  rateFraction: number;
  /** Deduction rate as a percentage (20, 30 or 0). */
  ratePercent: number;
  /** Labour element entered, £. */
  labour: number;
  /** Materials excluded, £. */
  materials: number;
  /** Plant hire excluded, £. */
  plantHire: number;
  /** Consumables and non-travel fuel excluded, £. */
  consumables: number;
  /** Prefab/manufacturing materials excluded, £. */
  prefabMaterials: number;
  /** Total of every excluded cost, £. */
  excludedTotal: number;
  /** The payment before VAT: labour plus every excluded cost, £. */
  grossPayment: number;
  /** The amount the rate is applied to — the labour element, £. */
  deductionBase: number;
  /** The CIS deduction itself, £. */
  deduction: number;
  /** VAT charged on the invoice, £ — never deducted from. */
  vat: number;
  /** Gross payment plus VAT, £. */
  invoiceTotal: number;
  /** What the subcontractor actually receives: invoice total minus deduction, £. */
  netToSubcontractor: number;
  /** What the contractor pays HMRC — the deduction, £. */
  hmrcPayment: number;
  /** The deduction as a percentage of the gross payment (excl. VAT). */
  effectivePercentOfGross: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

function nonNegative(n: number): number {
  return Math.max(0, n || 0);
}

export function cisRateForStatus(status: CisStatus): number {
  if (status === "unverified") return CIS.higherRate;
  if (status === "gross") return CIS.grossRate;
  return CIS.standardRate;
}

export function calculateCis(input: CisInput): CisResult {
  const labour = nonNegative(input.labour);
  const materials = nonNegative(input.materials);
  const plantHire = nonNegative(input.plantHire);
  const consumables = nonNegative(input.consumables);
  const prefabMaterials = nonNegative(input.prefabMaterials);
  const vat = nonNegative(input.vat);

  const rateFraction = cisRateForStatus(input.status);
  const excludedTotal = round2(
    materials + plantHire + consumables + prefabMaterials,
  );
  const grossPayment = round2(labour + excludedTotal);
  const deductionBase = round2(labour);
  const deduction = round2(deductionBase * rateFraction);
  const invoiceTotal = round2(grossPayment + vat);
  const netToSubcontractor = round2(invoiceTotal - deduction);

  return {
    status: input.status,
    rateFraction,
    ratePercent: Math.round(rateFraction * 100),
    labour: round2(labour),
    materials: round2(materials),
    plantHire: round2(plantHire),
    consumables: round2(consumables),
    prefabMaterials: round2(prefabMaterials),
    excludedTotal,
    grossPayment,
    deductionBase,
    deduction,
    vat: round2(vat),
    invoiceTotal,
    netToSubcontractor,
    hmrcPayment: deduction,
    effectivePercentOfGross:
      grossPayment > 0 ? round2((deduction / grossPayment) * 100) : 0,
  };
}
