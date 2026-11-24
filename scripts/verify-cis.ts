/**
 * Hand-computed verification of the CIS deduction calculator
 * (deduction base, deduction, invoice total and net payment).
 *
 * Run with:  npm run verify:cis
 *
 * Every expected figure below is worked by hand from the GOV.UK
 * rules in the research pack (24 November 2026): the deduction is
 * the status rate (20% verified, 30% unverified, 0% gross payment
 * status) applied to the LABOUR element only — materials at direct
 * cost, plant hire, consumable stores, non-travel fuel and prefab
 * materials are excluded first, and VAT never enters the
 * calculation. Cases A–C are the standard published examples:
 * £1,000 of labour with £400 of materials deducts £200 at 20%,
 * £300 at 30% and nothing at 0%. Exits non-zero if any figure
 * disagrees.
 */
import { calculateCis } from "../src/lib/cis.ts";

let failures = 0;

function check(caseName: string, field: string, actual: number, expected: number) {
  if (Math.abs(actual - expected) > 0.001) {
    failures += 1;
    console.error(`FAIL ${caseName} — ${field}: got ${actual}, expected ${expected}`);
  }
}

const zero = { plantHire: 0, consumables: 0, prefabMaterials: 0, vat: 0 };

// Case A — verified at 20%: £1,000 labour + £400 materials.
// Base £1,000, deduction £200, gross £1,400, net £1,200.
{
  const r = calculateCis({
    status: "verified",
    labour: 1000,
    materials: 400,
    ...zero,
  });
  check("A", "ratePercent", r.ratePercent, 20);
  check("A", "deductionBase", r.deductionBase, 1000);
  check("A", "deduction", r.deduction, 200);
  check("A", "grossPayment", r.grossPayment, 1400);
  check("A", "netToSubcontractor", r.netToSubcontractor, 1200);
  check("A", "hmrcPayment", r.hmrcPayment, 200);
}

// Case B — unverified at 30%: same invoice as Case A.
// Deduction £300, net £1,100.
{
  const r = calculateCis({
    status: "unverified",
    labour: 1000,
    materials: 400,
    ...zero,
  });
  check("B", "ratePercent", r.ratePercent, 30);
  check("B", "deduction", r.deduction, 300);
  check("B", "netToSubcontractor", r.netToSubcontractor, 1100);
}

// Case C — gross payment status at 0%: same invoice as Case A.
// No deduction, the subcontractor is paid in full.
{
  const r = calculateCis({
    status: "gross",
    labour: 1000,
    materials: 400,
    ...zero,
  });
  check("C", "ratePercent", r.ratePercent, 0);
  check("C", "deduction", r.deduction, 0);
  check("C", "netToSubcontractor", r.netToSubcontractor, 1400);
}

// Case D — itemised exclusions at 30%: £2,500 labour + £600
// materials + £150 plant hire. Base £2,500, deduction £750,
// gross £3,250, net £2,500.
{
  const r = calculateCis({
    status: "unverified",
    labour: 2500,
    materials: 600,
    plantHire: 150,
    consumables: 0,
    prefabMaterials: 0,
    vat: 0,
  });
  check("D", "excludedTotal", r.excludedTotal, 750);
  check("D", "deductionBase", r.deductionBase, 2500);
  check("D", "deduction", r.deduction, 750);
  check("D", "grossPayment", r.grossPayment, 3250);
  check("D", "netToSubcontractor", r.netToSubcontractor, 2500);
}

// Case E — gross payment status on a bigger job: £5,000 labour +
// £1,200 materials. No deduction, net £6,200.
{
  const r = calculateCis({
    status: "gross",
    labour: 5000,
    materials: 1200,
    ...zero,
  });
  check("E", "deduction", r.deduction, 0);
  check("E", "netToSubcontractor", r.netToSubcontractor, 6200);
}

// Case F — VAT at 20%: £800 labour + £200 materials + £200 VAT
// (20% of the £1,000 net). The deduction is 20% of the £800
// labour = £160; the invoice total is £1,200 and the
// subcontractor receives £1,040 — the VAT is paid over in full.
{
  const r = calculateCis({
    status: "verified",
    labour: 800,
    materials: 200,
    plantHire: 0,
    consumables: 0,
    prefabMaterials: 0,
    vat: 200,
  });
  check("F", "deductionBase", r.deductionBase, 800);
  check("F", "deduction", r.deduction, 160);
  check("F", "invoiceTotal", r.invoiceTotal, 1200);
  check("F", "netToSubcontractor", r.netToSubcontractor, 1040);
}

// Case G — every exclusion field at once, at 20%: labour £1,000,
// materials £400, plant hire £100, consumables £50, prefab
// materials £75. Excluded £625, base £1,000, deduction £200,
// gross £1,625, net £1,425.
{
  const r = calculateCis({
    status: "verified",
    labour: 1000,
    materials: 400,
    plantHire: 100,
    consumables: 50,
    prefabMaterials: 75,
    vat: 0,
  });
  check("G", "excludedTotal", r.excludedTotal, 625);
  check("G", "deduction", r.deduction, 200);
  check("G", "grossPayment", r.grossPayment, 1625);
  check("G", "netToSubcontractor", r.netToSubcontractor, 1425);
}

// Case H — no labour: a materials-only invoice deducts nothing
// at any rate. £900 of materials at 30% → deduction £0, net £900.
{
  const r = calculateCis({
    status: "unverified",
    labour: 0,
    materials: 900,
    ...zero,
  });
  check("H", "deductionBase", r.deductionBase, 0);
  check("H", "deduction", r.deduction, 0);
  check("H", "netToSubcontractor", r.netToSubcontractor, 900);
}

// Case I — the page's plasterer scenario at 20%: £2,400 labour +
// £600 materials. Deduction £480, gross £3,000, net £2,520.
{
  const r = calculateCis({
    status: "verified",
    labour: 2400,
    materials: 600,
    ...zero,
  });
  check("I", "deduction", r.deduction, 480);
  check("I", "grossPayment", r.grossPayment, 3000);
  check("I", "netToSubcontractor", r.netToSubcontractor, 2520);
}

// Case J — the page's contractor's month: the plasterer (£480),
// the unverified labourer of Case B (£300) and the gross-status
// groundworks company of Case E (£0) in one tax month. The CIS300
// shows £10,600 of payments and £780 of deductions.
{
  const plasterer = calculateCis({
    status: "verified",
    labour: 2400,
    materials: 600,
    ...zero,
  });
  const labourer = calculateCis({
    status: "unverified",
    labour: 1000,
    materials: 400,
    ...zero,
  });
  const groundworks = calculateCis({
    status: "gross",
    labour: 5000,
    materials: 1200,
    ...zero,
  });
  check(
    "J",
    "monthDeductions",
    plasterer.deduction + labourer.deduction + groundworks.deduction,
    780,
  );
  check(
    "J",
    "monthPayments",
    plasterer.grossPayment + labourer.grossPayment + groundworks.grossPayment,
    10600,
  );
}

if (failures > 0) {
  console.error(`verify-cis: ${failures} failure(s)`);
  process.exit(1);
}
console.log("verify-cis: all cases pass");
