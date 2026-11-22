/**
 * Free Invoice Generator UK — the invoice maths, kept separate
 * from the component so the page's worked example and the tool
 * itself can never disagree.
 *
 * Built 22 November 2026 for the "free invoice generator uk"
 * keyword (Semrush UK: 480/month, KD 28, CPC $4.92 — VERIFIED
 * weak-slot, top-10 entry: freelancercalc.co.uk, AS 7, holds
 * live #8 on roughly 77 visits a month). Competitor teardown
 * (22 Nov 2026): the ranking UK generator covers the basics but
 * has no CIS deduction support, no per-rate VAT breakdown, no
 * worked sample invoice and no invoice-numbering guidance; the
 * big global generators (invoice-generator.com, SumUp,
 * OnlineInvoices) are not UK-specific — no CIS, generic tax
 * labels — and push accounts, sign-ups or uploads. This tool
 * fills those gaps: per-item VAT rates with a VAT breakdown by
 * rate, an optional discount, CIS deductions taken the HMRC way
 * (from the labour part only, never from materials or VAT), and
 * everything worked out in the browser — nothing is uploaded.
 *
 * Conventions:
 *   - Every line is rounded to the penny from its own exact
 *     product (quantity × rate), never from an already-rounded
 *     line — the same house rule as the other tools.
 *   - A discount (a percentage of the net) is shared across the
 *     lines in proportion to each line's net amount, and VAT is
 *     then charged on the discounted net — the standard UK
 *     treatment when a discount is shown on the invoice itself.
 *   - "Exempt" lines carry no VAT, exactly like 0% lines, but
 *     print as "Exempt" — the two are not the same thing on a
 *     real VAT invoice, so the tool keeps them apart.
 *   - The CIS deduction is a percentage (20% for a registered
 *     subcontractor, 30% if not registered, per HMRC) of the
 *     discounted LABOUR total only: materials and VAT are never
 *     deducted from. The amount due is the invoice total
 *     (including VAT) minus the CIS deduction.
 */

export type VatRateOption = "20" | "5" | "0" | "exempt";

export type ItemKind = "standard" | "labour" | "materials";

export interface InvoiceItemInput {
  description: string;
  quantity: number;
  /** Unit price in £, excluding VAT. */
  rate: number;
  vatRate: VatRateOption;
  /** Only matters when a CIS deduction is switched on. */
  kind: ItemKind;
}

export interface InvoiceTotalsInput {
  items: InvoiceItemInput[];
  /** Optional discount, as a percentage of the net subtotal. */
  discountPercent: number;
  /** 0 = no CIS deduction, otherwise 20 or 30. */
  cisPercent: number;
}

export interface InvoiceLineResult extends InvoiceItemInput {
  /** quantity × rate, rounded to the penny. */
  net: number;
  /** This line's share of the discount, in £. */
  discountShare: number;
  /** Net after the discount share. */
  netAfterDiscount: number;
  /** VAT on netAfterDiscount at the line's rate (0 for exempt). */
  vat: number;
  /** netAfterDiscount + vat. */
  gross: number;
}

export interface VatBreakdownRow {
  vatRate: VatRateOption;
  /** Net (after discount) charged at this rate. */
  net: number;
  vat: number;
}

export interface InvoiceTotals {
  lines: InvoiceLineResult[];
  /** Sum of line nets, before any discount. */
  subtotal: number;
  /** Total discount taken off, in £. */
  discountAmount: number;
  /** Subtotal minus the discount. */
  netTotal: number;
  /** Total VAT across all lines. */
  vatTotal: number;
  /** VAT grouped by rate, in 20 / 5 / 0 / exempt order. */
  vatBreakdown: VatBreakdownRow[];
  /** netTotal + vatTotal — the invoice total. */
  total: number;
  /** The discounted labour total the CIS deduction is taken from. */
  cisBase: number;
  /** The CIS deduction itself, in £. */
  cisDeduction: number;
  /** total − cisDeduction — what the client actually pays. */
  amountDue: number;
}

function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

export function vatPercentOf(rate: VatRateOption): number {
  if (rate === "20") return 20;
  if (rate === "5") return 5;
  return 0;
}

const VAT_ORDER: VatRateOption[] = ["20", "5", "0", "exempt"];

export function computeInvoice(input: InvoiceTotalsInput): InvoiceTotals {
  const discountPercent = Math.min(
    100,
    Math.max(0, input.discountPercent || 0),
  );
  const cisPercent = Math.max(0, input.cisPercent || 0);

  const rawLines = input.items.map((item) => ({
    ...item,
    net: round2(Math.max(0, item.quantity || 0) * Math.max(0, item.rate || 0)),
  }));

  const subtotal = round2(rawLines.reduce((sum, l) => sum + l.net, 0));
  const discountAmount =
    subtotal > 0 ? round2((subtotal * discountPercent) / 100) : 0;

  const lines: InvoiceLineResult[] = rawLines.map((line, i) => {
    // The discount is shared in proportion to each line's net;
    // the last non-zero line takes whatever rounding leaves, so
    // the shares always add back up to the discount exactly.
    let discountShare = 0;
    if (subtotal > 0 && discountAmount > 0) {
      const laterNet = rawLines
        .slice(i + 1)
        .reduce((sum, l) => sum + l.net, 0);
      if (laterNet === 0 && line.net > 0) {
        const earlierShares = rawLines
          .slice(0, i)
          .reduce(
            (sum, l) => sum + round2((discountAmount * l.net) / subtotal),
            0,
          );
        discountShare = round2(discountAmount - earlierShares);
      } else {
        discountShare = round2((discountAmount * line.net) / subtotal);
      }
    }
    const netAfterDiscount = round2(line.net - discountShare);
    const vat = round2((netAfterDiscount * vatPercentOf(line.vatRate)) / 100);
    return {
      ...line,
      discountShare,
      netAfterDiscount,
      vat,
      gross: round2(netAfterDiscount + vat),
    };
  });

  const netTotal = round2(lines.reduce((s, l) => s + l.netAfterDiscount, 0));
  const vatTotal = round2(lines.reduce((s, l) => s + l.vat, 0));
  const total = round2(netTotal + vatTotal);

  const vatBreakdown: VatBreakdownRow[] = VAT_ORDER.flatMap((rate) => {
    const rows = lines.filter((l) => l.vatRate === rate);
    if (rows.length === 0) return [];
    return [
      {
        vatRate: rate,
        net: round2(rows.reduce((s, l) => s + l.netAfterDiscount, 0)),
        vat: round2(rows.reduce((s, l) => s + l.vat, 0)),
      },
    ];
  });

  const cisBase = round2(
    lines
      .filter((l) => l.kind === "labour")
      .reduce((s, l) => s + l.netAfterDiscount, 0),
  );
  const cisDeduction =
    cisPercent > 0 ? round2((cisBase * cisPercent) / 100) : 0;

  return {
    lines,
    subtotal,
    discountAmount,
    netTotal,
    vatTotal,
    vatBreakdown,
    total,
    cisBase,
    cisDeduction,
    amountDue: round2(total - cisDeduction),
  };
}
