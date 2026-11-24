import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CisDeductionCalculator from "@/components/CisDeductionCalculator";
import { calculateCis } from "@/lib/cis";
import { CIS } from "@/lib/rates";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/cis-deduction-calculator",
  "CIS Deduction Calculator — CIS Tax 2026/27",
  "Work out a CIS deduction: 20% for a verified subcontractor, 30% if unverified, 0% with gross payment status — taken from labour only, never materials or VAT.",
);

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const h2Class = "text-xl font-semibold text-slate-900 dark:text-slate-50";

const noExtras = {
  plantHire: 0,
  consumables: 0,
  prefabMaterials: 0,
  vat: 0,
};

// A self-employed plasterer, registered and verified, invoicing a
// builder for a house renovation: £2,400 labour + £600 materials.
const exPlasterer = calculateCis({
  status: "verified",
  labour: 2400,
  materials: 600,
  ...noExtras,
});
// A labourer whose details do not match HMRC's records at
// verification: £1,000 labour + £400 materials, deducted at 30%.
const exShock = calculateCis({
  status: "unverified",
  labour: 1000,
  materials: 400,
  ...noExtras,
});
// The same invoice at the standard 20% rate, for comparison.
const exShockAt20 = calculateCis({
  status: "verified",
  labour: 1000,
  materials: 400,
  ...noExtras,
});
// An established groundworks company with gross payment status:
// £5,000 labour + £1,200 materials, paid in full.
const exGroundworks = calculateCis({
  status: "gross",
  labour: 5000,
  materials: 1200,
  ...noExtras,
});
// A VAT-registered roofer: £800 labour + £200 materials + £200 VAT.
const exVat = calculateCis({
  status: "verified",
  labour: 800,
  materials: 200,
  plantHire: 0,
  consumables: 0,
  prefabMaterials: 0,
  vat: 200,
});
// A joiner's fully itemised invoice: labour, materials, hired
// tools, consumables and materials used prefabricating units.
const exJoiner = calculateCis({
  status: "verified",
  labour: 1000,
  materials: 400,
  plantHire: 100,
  consumables: 50,
  prefabMaterials: 75,
  vat: 0,
});
// The contractor's month: the three payments above in one tax
// month — total deductions for the CIS300 return.
const monthDeductions =
  Math.round(
    (exPlasterer.deduction + exShock.deduction + exGroundworks.deduction) *
      100,
  ) / 100;
const monthPayments =
  Math.round(
    (exPlasterer.grossPayment +
      exShock.grossPayment +
      exGroundworks.grossPayment) *
      100,
  ) / 100;

const FAQS: { question: string; answer: string }[] = [
  {
    question: "Does CIS apply to materials?",
    answer:
      "No. The deduction is taken from the labour element of the payment only. The cost of materials the subcontractor paid for directly is taken off before the percentage is applied — but only the actual cost: if the subcontractor adds a mark-up to materials, the mark-up counts as labour and is deducted from. Contractors can ask for receipts or invoices as evidence of the materials cost, and where there is no evidence they are entitled to estimate it, which is why an itemised invoice protects the subcontractor.",
  },
  {
    question: "Do you deduct CIS from VAT?",
    answer:
      "No. VAT never enters the CIS calculation at all: the deduction is worked out on the payment excluding VAT, and any VAT charged is paid to the subcontractor in full on top. In practice, most invoices from one VAT-registered construction business to another carry no VAT anyway, because the domestic reverse charge makes the customer account for the VAT instead — so the VAT field on the calculator is £0 on the majority of real CIS invoices.",
  },
  {
    question: "What happens if I file the CIS300 return late?",
    answer:
      "The penalties start at £100 for a return one day late, then a further £200 at two months, £300 or 5% of the deductions (whichever is higher) at six months and again at twelve months, with further penalties of up to £3,000 or 100% of the deductions after that. Since April 2026 the nil return is back: a month with no subcontractor payments still needs a return — or an advance notice to HMRC that no payments will be made — so a quiet month is no longer a safe month to file nothing.",
  },
  {
    question: "Why is my CIS deduction more than the tax I actually owe?",
    answer:
      "Because the deduction is not a tax calculation. It is a flat 20% (or 30%) of the labour element, taken with no regard to your personal allowance, your expenses or your other income — a payment on account, nothing more. Sole traders with modest profits routinely have more deducted than their final bill, and the excess comes back: through the Self Assessment return for sole traders and partners, or through the Employer Payment Summary for limited companies. It is a cash-flow problem, not a lost-money problem — but only if the returns are filed.",
  },
  {
    question: "Can I claim CIS deductions back if I stop trading mid-year?",
    answer:
      "Yes. A sole trader or partner who stops trading part-way through the tax year does not have to wait for the Self Assessment return: HMRC has a dedicated in-year repayment claim for subcontractors who have stopped working in construction, supported by the payment and deduction statements from contractors. Limited companies work differently — they offset deductions against their PAYE bill month by month through the Employer Payment Summary during the year, and claim any remaining refund after the tax year ends.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "CIS Deduction Calculator",
  url: `${AppConfig.siteUrl}/cis-deduction-calculator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

export default function CisDeductionCalculatorPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          CIS Deduction Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          A CIS deduction is taken from the labour part of a
          subcontractor&apos;s payment only: 20% if the subcontractor
          is registered and verified, 30% if they are not, and nothing
          if they hold gross payment status. Materials, plant hire and
          VAT are never deducted from. Enter the payment split to see
          the deduction and the net pay.
        </p>
        <p className={bodyClass}>
          PayrollCalc — UK Payroll Calculators — is a free library of UK
          pay, tax and leave calculators published by Muhammad Tauseef.
          Every calculator on the site prints the rates and sources
          behind its figures instead of hiding them, and this page uses
          the Construction Industry Scheme rules exactly as GOV.UK and
          HMRC set them out.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Rules verified
          24 November 2026 against GOV.UK.
        </p>
      </section>

      <CisDeductionCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>
          How much CIS will be deducted? Five real invoices
        </h2>
        <p className={bodyClass}>
          The figures below are not round-number illustrations — they
          are the invoices this calculation actually meets on site,
          worked by the same engine as the calculator above. Notice
          what drives every result: the rate matters, but the split
          between labour and everything else matters just as much,
          because the percentage only ever touches the labour.
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  The job
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Labour
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Other costs
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  CIS deduction
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Paid to subcontractor
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Self-employed plasterer, verified
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exPlasterer.labour)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exPlasterer.excludedTotal)} materials
                </td>
                <td className="px-4 py-2">{exPlasterer.ratePercent}%</td>
                <td className="px-4 py-2">
                  {gbp.format(exPlasterer.deduction)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exPlasterer.netToSubcontractor)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Labourer whose details did not verify
                </td>
                <td className="px-4 py-2">{gbp.format(exShock.labour)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exShock.excludedTotal)} materials
                </td>
                <td className="px-4 py-2">{exShock.ratePercent}%</td>
                <td className="px-4 py-2">{gbp.format(exShock.deduction)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exShock.netToSubcontractor)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Groundworks company, gross payment status
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exGroundworks.labour)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exGroundworks.excludedTotal)} materials
                </td>
                <td className="px-4 py-2">{exGroundworks.ratePercent}%</td>
                <td className="px-4 py-2">
                  {gbp.format(exGroundworks.deduction)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exGroundworks.netToSubcontractor)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">VAT-registered roofer</td>
                <td className="px-4 py-2">{gbp.format(exVat.labour)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exVat.excludedTotal)} materials +{" "}
                  {gbp.format(exVat.vat)} VAT
                </td>
                <td className="px-4 py-2">{exVat.ratePercent}%</td>
                <td className="px-4 py-2">{gbp.format(exVat.deduction)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exVat.netToSubcontractor)}
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Joiner with a fully itemised invoice
                </td>
                <td className="px-4 py-2">{gbp.format(exJoiner.labour)}</td>
                <td className="px-4 py-2">
                  {gbp.format(exJoiner.excludedTotal)} across materials,
                  plant hire, consumables and prefab materials
                </td>
                <td className="px-4 py-2">{exJoiner.ratePercent}%</td>
                <td className="px-4 py-2">
                  {gbp.format(exJoiner.deduction)}
                </td>
                <td className="px-4 py-2">
                  {gbp.format(exJoiner.netToSubcontractor)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The plasterer first. A self-employed plasterer finishes a
          house renovation and invoices the builder{" "}
          {gbp.format(exPlasterer.grossPayment)}:{" "}
          {gbp.format(exPlasterer.labour)} for his labour and{" "}
          {gbp.format(exPlasterer.materials)} for the plaster and
          boards he bought himself. He is registered for CIS and the
          builder has verified him, so the deduction is 20% of the
          labour only — {gbp.format(exPlasterer.deduction)}. He
          receives {gbp.format(exPlasterer.netToSubcontractor)}, and
          the builder sends the{" "}
          {gbp.format(exPlasterer.deduction)} to HMRC, where it sits
          as a credit against the plasterer&apos;s own tax bill. If
          the builder had wrongly deducted from the whole invoice, the
          deduction would have been £600 and the plasterer £120 out of
          pocket until his tax return sorted it out — the materials
          split is real money, not paperwork.
        </p>
        <p className={bodyClass}>
          Now the case that causes the phone calls. A labourer starts
          with a new contractor at short notice and invoices{" "}
          {gbp.format(exShock.grossPayment)} —{" "}
          {gbp.format(exShock.labour)} of labour and{" "}
          {gbp.format(exShock.materials)} of materials. When the
          contractor verifies him, his details do not match
          HMRC&apos;s records — a transposed digit in a UTR is the
          usual cause — so the contractor has no choice: the rate is
          30%, the deduction is {gbp.format(exShock.deduction)}, and
          the labourer receives{" "}
          {gbp.format(exShock.netToSubcontractor)} instead of the{" "}
          {gbp.format(exShockAt20.netToSubcontractor)} he was
          expecting at 20%. That is{" "}
          {gbp.format(
            exShockAt20.netToSubcontractor - exShock.netToSubcontractor,
          )}{" "}
          less in his account that month. The money is not lost: the{" "}
          {gbp.format(exShock.deduction)} is still credited to him,
          the payment and deduction statement shows the verification
          reference he needs, and it comes back through his Self
          Assessment. But the fix for next time is on him — register
          for CIS, check the details HMRC holds, and get verified
          before the next payment, because the contractor cannot
          lawfully deduct 20% out of sympathy.
        </p>
        <p className={bodyClass}>
          At the other end of the scale, an established groundworks
          company with gross payment status invoices{" "}
          {gbp.format(exGroundworks.grossPayment)} —{" "}
          {gbp.format(exGroundworks.labour)} of labour and{" "}
          {gbp.format(exGroundworks.materials)} of materials — and is
          paid every penny of it: the deduction is{" "}
          {gbp.format(exGroundworks.deduction)}. Gross status is
          earned, not claimed, and the tests for it are covered below.
          The VAT-registered roofer shows the last moving part: his
          invoice is {gbp.format(exVat.grossPayment)} net plus{" "}
          {gbp.format(exVat.vat)} of VAT, the deduction is 20% of his{" "}
          {gbp.format(exVat.labour)} labour —{" "}
          {gbp.format(exVat.deduction)} — and he receives{" "}
          {gbp.format(exVat.netToSubcontractor)}, VAT included in
          full. On most subcontractor-to-contractor work the domestic
          reverse charge means no VAT is charged at all, which is why
          the calculator&apos;s VAT field usually stays at £0.
        </p>
        <p className={bodyClass}>
          Finally, the joiner — the lesson in how to invoice. His bill
          for a kitchen fit itemises everything:{" "}
          {gbp.format(exJoiner.labour)} labour,{" "}
          {gbp.format(exJoiner.materials)} of materials,{" "}
          {gbp.format(exJoiner.plantHire)} of hired tools,{" "}
          {gbp.format(exJoiner.consumables)} of blades, fixings and
          site fuel, and {gbp.format(exJoiner.prefabMaterials)} of
          materials used building the units in his workshop. His
          deduction is {gbp.format(exJoiner.deduction)} — 20% of the
          labour and nothing else. Had he sent one unitemised bill for{" "}
          {gbp.format(exJoiner.grossPayment)}, the contractor would
          have had to estimate the materials element, and estimates
          rarely favour the subcontractor.
        </p>
        <p className={bodyClass}>
          And the contractor&apos;s side of the same month: the
          builder who paid the plasterer also paid the labourer and
          the groundworks company in the same tax month. His CIS300
          return, due by the 19th of the next month, lists all three
          payments — {gbp.format(monthPayments)} in total — and{" "}
          {gbp.format(monthDeductions)} of deductions, which he pays
          over to HMRC by the 22nd. Each of the three subcontractors
          gets a payment and deduction statement within 14 days of the
          end of the tax month. One month&apos;s CIS, start to finish,
          is those three dates and that one total.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How do I calculate CIS deductions?</h2>
        <p className={bodyClass}>
          However the question is phrased — how to work out CIS
          deductions, or what the formula for calculating CIS is — the
          calculation has four steps, and the formula is one line:
          <strong>
            {" "}
            deduction = rate × (gross payment − VAT − materials −
            plant hire − consumables − prefab materials)
          </strong>
          . Step one: take the gross amount of the payment, before any
          deduction but ignoring VAT entirely. Step two: take off the
          excluded costs — the materials the subcontractor paid for
          directly, plant hire, consumable stores, fuel other than
          travelling fuel, and materials used in manufacturing or
          prefabricating. What is left is the labour element. Step
          three: apply the rate HMRC set at verification — 20%, 30% or
          0%. Step four: pay the subcontractor the invoice total minus
          the deduction, and put the deduction aside for HMRC. The
          calculator above runs exactly these steps, with a field for
          every exclusion, so a real invoice can be checked line by
          line.
        </p>
        <p className={bodyClass}>
          Two details decide whether the answer is right. First, only
          the direct cost of materials comes off: if a subcontractor
          buys materials for £400 and charges £500 for them, the £100
          mark-up is labour and stays in the calculation. Second,
          travel and subsistence recharged to the contractor stay in
          as well — they feel like expenses, but HMRC treats them as
          part of the payment for the work. Fuel is the mirror image:
          fuel burned on site comes off, fuel burned getting to site
          does not.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is CIS calculated on gross or net?</h2>
        <p className={bodyClass}>
          Neither, quite — and this is where most wrong deductions
          start. CIS is calculated on the gross amount of the payment
          (the invoice total before the deduction itself, so it is not
          a “net of tax” figure), but only after the excluded costs
          have been stripped out, and with VAT left outside the
          calculation altogether. So the base is best described as the
          gross payment minus materials and the other excluded costs —
          in practice, the labour element. A contractor who deducts
          20% of the full invoice including materials has over-deducted;
          a subcontractor checking a statement should always rebuild
          the base first: invoice, minus VAT, minus materials at cost,
          minus plant hire and the rest. If what remains is not the
          labour figure on the invoice, the deduction is wrong.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What are the CIS tax rates for 2026?</h2>
        <p className={bodyClass}>
          The CIS tax rates for 2026 are the same three rates the
          scheme has used for years — they did not change in April
          2026, and they are unchanged for 2026/27:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Rate
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Who it applies to
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Set by
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">0% — no deduction</td>
                <td className="px-4 py-2">
                  Subcontractors with gross payment status
                </td>
                <td className="px-4 py-2">
                  HMRC, on application and the three tests
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">20% — the standard rate</td>
                <td className="px-4 py-2">
                  Subcontractors registered for CIS and verified
                </td>
                <td className="px-4 py-2">
                  HMRC, at verification
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">30% — the higher rate</td>
                <td className="px-4 py-2">
                  Subcontractors who are not registered, or whose
                  details cannot be verified
                </td>
                <td className="px-4 py-2">
                  HMRC, at verification
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          The CIS 20% deduction is the standard case, and it is the
          one most working subcontractors live with: registered,
          verified, and a fifth of the labour element of every payment
          sent to HMRC as they go. So is CIS 20% or 30%? For a
          registered subcontractor whose details check out, 20% —
          the 30% rate is not a different tax, it is the same scheme
          applying its penalty rate to someone HMRC cannot identify
          as registered. Nobody chooses between them: the contractor
          asks HMRC, and HMRC&apos;s verification answer names the
          rate.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Why am I paying 30% CIS tax?</h2>
        <p className={bodyClass}>
          Because, as far as HMRC&apos;s records are concerned, you
          are either not registered for CIS or not verifiable — and
          the scheme deducts first and asks questions later. The usual
          causes are mundane: you never registered as a subcontractor;
          you registered, but the contractor has a detail wrong (the
          UTR, the National Insurance number for a sole trader, the
          company registration number for a limited company) and the
          details must match HMRC&apos;s records exactly; or you have
          not been verified by this contractor yet, which has to
          happen before the first payment. Temporary National Insurance
          numbers cannot be verified at all. The remedy runs in that
          order: register, correct the details, get verified — and the
          30% already deducted is not lost, because it is credited to
          you and claimed back as described below. What you cannot do
          is negotiate the rate with the contractor: if verification
          says 30%, 30% is what they must deduct.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How do I check my CIS deduction?</h2>
        <p className={bodyClass}>
          Your evidence is the payment and deduction statement, which
          the contractor must give you within 14 days of the end of
          each tax month in which they paid you. It shows the
          contractor&apos;s name and employer reference, your details,
          the gross payment, the cost of materials taken off, and the
          deduction made — and where the 30% rate was used, the
          verification reference (ending in one or two letters) that
          you need in order to claim the credit. Checking a deduction
          takes two minutes with this calculator: rebuild the payment
          from the statement, and confirm the percentage was applied
          to the labour figure only, at the rate your status carries.
          If the statement shows a deduction taken from materials, or
          the wrong rate, raise it with the contractor first — most
          errors are bookkeeping, and the return can be corrected.
          Keep every statement: they are the proof behind your tax
          return claim, and if a contractor will not provide them,
          HMRC can still trace the deductions from the returns the
          contractor filed.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How much tax do you pay on CIS?</h2>
        <p className={bodyClass}>
          Strictly, none — CIS is not a tax. The 20% or 30% is a
          payment on account, deducted from your labour and held by
          HMRC against whatever your real tax bill turns out to be.
          Your actual tax is worked out the normal self-employed way:
          Income Tax on your profits (after expenses and your personal
          allowance) plus National Insurance, calculated on your tax
          return. That is why the deduction so often overshoots the
          bill — 20% of labour takes no account of a £12,570 personal
          allowance or a van&apos;s worth of expenses — and why the
          difference comes back as a refund or a reduced bill rather
          than vanishing. Think of CIS as PAYE&apos;s rougher cousin:
          money taken at source during the year, trued up at the end
          of it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How to claim back CIS deductions</h2>
        <p className={bodyClass}>
          The route depends on how you trade. Sole traders and
          partners claim on the Self Assessment tax return: your total
          pay before deductions goes in as income, the total of your
          CIS deductions goes in the CIS deductions box, and HMRC sets
          them against the tax and National Insurance you owe,
          refunding the excess. If you stop trading mid-year, you can
          claim the refund in-year instead of waiting for the return.
          Limited companies claim through payroll, not the tax return:
          the company files its usual Full Payment Summary, then an
          Employer Payment Summary showing the total CIS deductions it
          has suffered year to date, and HMRC reduces the
          company&apos;s PAYE bill by that amount — carrying any
          surplus forward within the same tax year and refunding the
          rest after the year ends. One warning worth printing in
          bold: never claim CIS deductions on the Corporation Tax
          return — HMRC can charge a penalty for it. Keep form CIS132
          records and every payment and deduction statement either
          way; without the statements, the claim is an argument
          instead of a calculation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Is CIS better than PAYE?</h2>
        <p className={bodyClass}>
          They are not alternatives you pick between — they are the
          two ways the same work gets taxed depending on the working
          relationship, and the relationship decides, not preference.
          Under CIS the worker is self-employed: deductions are a flat
          20% or 30% of labour with no personal allowance in the
          calculation, there is no employer National Insurance, no
          holiday pay and no pension, and the worker files a tax
          return and claims expenses. Under PAYE the worker is an
          employee: tax follows their tax code, the employer pays
          employer National Insurance on top (the true cost is in our{" "}
          <Link href="/employer-cost-calculator" className={linkClass}>
            employer cost calculator
          </Link>
          ), and employment rights come with the job. CIS looks
          cheaper month to month mainly because the deduction ignores
          the allowance and expenses the tax return later restores —
          and because the costs PAYE loads onto the employer are
          simply absent. What CIS is not is a status you can elect: a
          contractor who puts someone who is really an employee on the
          CIS300 return faces a penalty of up to £3,000 for the wrong
          status declaration, quite apart from the tax at stake. For
          contractors working through their own company, our{" "}
          <Link href="/ir35-calculator" className={linkClass}>
            IR35 calculator
          </Link>{" "}
          covers the off-payroll version of the same question, and our{" "}
          <Link
            href="/umbrella-company-calculator"
            className={linkClass}
          >
            umbrella company calculator
          </Link>{" "}
          shows the third route, where an umbrella employs the worker
          and PAYE applies.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Can I pay a subcontractor without CIS?
        </h2>
        <p className={bodyClass}>
          Only in three situations. First, the subcontractor holds
          gross payment status — then there is nothing to deduct, and
          verification will tell you so. Second, the payment falls
          under one of the exemptions listed in the next section.
          Third, the work is outside the scheme altogether: CIS only
          covers construction work, so a payment for something that is
          not construction — delivering materials, hiring scaffolding
          without labour, fitting carpets — carries no deduction
          because CIS never applied to it. In every other case, if you
          are a contractor paying a subcontractor for construction
          work, the deduction is compulsory: paying gross because the
          subcontractor asked, or because the paperwork is a nuisance,
          leaves the contractor liable for the deduction that should
          have been made, plus penalties. “Without CIS” is a status
          HMRC grants or a category the work falls into — never a
          favour between businesses.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Who is exempt from CIS tax?</h2>
        <p className={bodyClass}>
          Exemption works at three levels. Some subcontractors are
          exempt from deduction because they hold gross payment status
          — the nearest thing to a personal exemption the scheme has.
          Some payments are exempt whoever receives them: work paid for
          by a charity or trust; work paid for by a school governing
          body or head teacher for a local education authority; work on
          the subcontractor&apos;s own property worth less than £1,000
          excluding materials; and, for deemed contractors, work on
          property for their own business use and contracts under
          £1,000 excluding materials — the property exemptions are
          claimed through the CIS helpline. Since 6 April 2026,
          payments to local authorities and certain public bodies are
          also exempt by law. And some work is simply outside CIS:
          architecture and surveying, scaffolding hire without labour,
          carpet fitting, delivering materials, and non-construction
          work on a construction site such as running the canteen.
          Employees are outside CIS too, in the other direction — they
          are paid through PAYE, and putting them through CIS is the
          one route that is never available.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>When do you deduct CIS?</h2>
        <p className={bodyClass}>
          At every payment. Whenever a contractor pays a subcontractor
          under a construction contract — each invoice, each stage
          payment, each month — the deduction is calculated on that
          payment and taken before the money moves. The scheme then
          runs on a fixed monthly rhythm, with tax months running from
          the 6th to the 5th:
        </p>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Obligation
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Deadline
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Payment and deduction statement to each subcontractor
                  paid
                </td>
                <td className="px-4 py-2">
                  Within {CIS.statementDays} days of the end of the tax
                  month
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  CIS300 monthly return (including a nil return since
                  April 2026)
                </td>
                <td className="px-4 py-2">
                  The {CIS.returnDueDay}th of the following month
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Deductions paid to HMRC (usually with PAYE)
                </td>
                <td className="px-4 py-2">
                  The {CIS.payDueDayElectronic}nd of the following
                  month electronically; the {CIS.payDueDayPost}th by
                  post
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">CIS records kept</td>
                <td className="px-4 py-2">
                  At least {CIS.recordsYears} years after the tax year
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Miss the return deadline and the penalties are automatic:
          £100 at a day late, a further £200 at two months, then £300
          or 5% of the deductions — whichever is higher — at six
          months and again at twelve, with further penalties of up to
          £3,000 or 100% of the deductions beyond that. Failing to
          produce CIS records when HMRC asks can itself be fined up to
          £3,000.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>What changed for CIS in April 2026?</h2>
        <p className={bodyClass}>
          The rates did not change — 0%, 20% and 30% still apply for
          2026/27 — but the rules around them tightened in three ways.
          First, nil returns are back: contractors must file a CIS300
          for every tax month, filing a nil return for a month with no
          payments, unless they have told HMRC in advance that no
          payments will be made (an inactivity notice covers up to six
          months). The obligation had been switched off in 2015; the
          full late-filing penalty regime now applies to it again.
          Second, payments to local authorities and certain public
          bodies became exempt from CIS by law, replacing the old
          concession that treated them as gross. Third, a new
          anti-fraud package: where a business knew or should have
          known that a payment, or a CIS credit it claimed, was
          connected to deliberate non-compliance in its supply chain,
          HMRC can now assess the lost tax — 20% of the payment, or
          100% of a false credit — add a penalty of up to 30% that can
          also fall on directors personally, and cancel gross payment
          status immediately, with a five-year bar on reapplying
          instead of the old one year. For an honest contractor the
          practical effect is simple: verification records are no
          longer just admin, they are the evidence that you checked.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Gross payment status: how to stop deductions altogether
        </h2>
        <p className={bodyClass}>
          Gross payment status is the subcontractor&apos;s way out of
          deductions entirely — paid in full, tax settled through the
          return like any other business. HMRC grants it only when
          three tests are passed. The business test: the business does
          construction work in the UK (or supplies labour for it) and
          is run to a substantial extent through a bank account. The
          turnover test: net construction turnover — excluding VAT and
          materials — of at least{" "}
          {gbp.format(CIS.grossStatusTurnoverPerPerson)} in the last
          12 months for a sole trader; for a partnership or company,{" "}
          {gbp.format(CIS.grossStatusTurnoverPerPerson)} per partner
          or director, or{" "}
          {gbp.format(CIS.grossStatusTurnoverWholeBusiness)} for the
          business as a whole, whichever is lower. The compliance
          test: over the previous 12 months, every return filed and
          every tax and National Insurance bill paid on time — VAT
          returns have counted towards the test since April 2024.
          Apply online through HMRC&apos;s CIS service, or on form
          CIS302 (sole trader), CIS304 (partnership) or CIS305
          (company). HMRC reviews status holders annually and can
          withdraw status for non-compliance — and since April 2026,
          status lost on fraud grounds cannot be reapplied for for
          five years.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>A note for contractors</h2>
        <p className={bodyClass}>
          The contractor&apos;s duties start before the first payment:
          register for CIS before taking on your first subcontractor
          (you must register if you pay subcontractors for
          construction work, or if your business spends more than{" "}
          {gbp.format(CIS.deemedContractorThreshold)} on construction
          in the 12 months since its first payment, even if
          construction is not your trade), and verify every new
          subcontractor before paying them — through HMRC&apos;s CIS
          online service, or commercial software, which is compulsory
          once you have more than 50 subcontractors. The monthly cycle
          and its penalties are set out above; the two habits that
          keep contractors out of trouble are keeping records for at
          least {CIS.recordsYears} years, and never letting the
          CIS300 carry someone who is really an employee — the return
          itself includes a declaration that none of the workers on it
          are employees, and a false one costs up to £3,000. When you
          issue invoices of your own under CIS, show the labour and
          materials split on the invoice itself: our{" "}
          <Link href="/free-invoice-generator-uk" className={linkClass}>
            free invoice generator
          </Link>{" "}
          is built for UK invoices with exactly that split in mind.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          CIS rates and deadlines used by this calculator
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Item
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700 dark:text-slate-300">
                  Figure
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className="px-4 py-2">
                  Standard deduction rate (verified)
                </td>
                <td className="px-4 py-2">
                  {CIS.standardRate * 100}% of the labour element
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Higher deduction rate (unverified)
                </td>
                <td className="px-4 py-2">
                  {CIS.higherRate * 100}% of the labour element
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Gross payment status rate</td>
                <td className="px-4 py-2">
                  {CIS.grossRate * 100}% — paid in full
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">Deduction base</td>
                <td className="px-4 py-2">
                  Labour only — VAT, materials at cost, plant hire,
                  consumable stores, non-travel fuel and prefab
                  materials are excluded; travel and subsistence stay
                  in
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">CIS300 return deadline</td>
                <td className="px-4 py-2">
                  {CIS.returnDueDay}th of the following month (tax
                  months run 6th to 5th)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2">
                  Deductions to HMRC deadline
                </td>
                <td className="px-4 py-2">
                  {CIS.payDueDayElectronic}nd electronically,{" "}
                  {CIS.payDueDayPost}th by post
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Rates and rules: GOV.UK “Construction Industry Scheme:
          contractor guide” and “subcontractor guide”, and the
          April 2026 CIS simplification and anti-fraud measures.
          Rules verified 24 November 2026.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={h2Class}>Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div
              key={f.question}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {f.question}
              </h3>
              <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <RelatedCalculators href="/cis-deduction-calculator" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
