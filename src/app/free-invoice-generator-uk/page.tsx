import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import InvoiceGenerator from "@/components/InvoiceGenerator";
import { computeInvoice } from "@/lib/invoice";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/free-invoice-generator-uk",
  "Free Invoice Generator UK — UK Invoices with VAT & CIS, No Sign-Up",
  "Free UK invoice generator: build an invoice in your browser with per-line VAT at 20%, 5% or 0%, an optional discount and CIS deductions, then print or save it as a PDF. No sign-up — your data never leaves your browser.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";

const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

function fmtMoney(n: number): string {
  return `£${n.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// The worked example in "What does a finished invoice look
// like?" — computed by the same function the tool above runs,
// so the page can never disagree with itself.
const SAMPLE = computeInvoice({
  items: [
    {
      description: "Kitchen fitting — labour (3 days)",
      quantity: 3,
      rate: 220,
      vatRate: "20",
      kind: "labour",
    },
    {
      description: "Kitchen units, worktops and handles (materials)",
      quantity: 1,
      rate: 1850,
      vatRate: "20",
      kind: "materials",
    },
  ],
  discountPercent: 0,
  cisPercent: 20,
});

const FAQS: { question: string; answer: string }[] = [
  {
    question: "What must a UK invoice include by law?",
    answer:
      "Nine things, on GOV.UK's list: a unique identification number; your company name, address and contact information; the company name and address of the customer you are invoicing; a clear description of what you are charging for; the date the goods or service were provided (the supply date); the date of the invoice; the amount(s) being charged; the VAT amount if applicable; and the total amount owed. Sole traders must also show their own name and any business name they trade under, with an address where legal documents can be delivered. A limited company must use its full company name exactly as it appears on the certificate of incorporation — and if it names any directors on the invoice, it must name them all.",
  },
  {
    question: "Is this invoice generator really free — and where does my data go?",
    answer:
      "Yes, it is free, with no sign-up and no watermark, and your data goes nowhere: the invoice is built entirely in your browser and nothing you type is uploaded to a server. Your own business and bank details are remembered only in this browser, on this device, so you do not have to retype them next time; client details and invoice lines are not stored at all. The PDF is made by your own browser when you print or save the invoice.",
  },
  {
    question: "Do I need to be VAT registered to send an invoice?",
    answer:
      "No — any business can send an invoice, but only a VAT-registered business may charge VAT or issue a VAT invoice. Registration becomes compulsory when your taxable turnover passes £90,000 in any rolling 12 months (the GOV.UK threshold), and you can also register voluntarily below that. If you are not registered, leave every line at 0% VAT and leave the VAT number box empty: showing a VAT amount or a VAT number when you are not registered is not allowed, and a client cannot reclaim VAT you never charged.",
  },
  {
    question: "Can I send an invoice without a company?",
    answer:
      "Yes. You do not need a limited company — or any company — to invoice someone. Sole traders and freelancers invoice in their own name: GOV.UK requires your own name, any business name you trade under, and an address where legal documents can be delivered to you. You also do not need to be VAT registered to send an invoice; you simply may not charge VAT or show a VAT number until you are. Most first invoices in the UK are sent exactly this way, by an individual, and this generator's form is built for it — the business name field takes your own name or trading name.",
  },
  {
    question: "What is a CIS deduction, and how is it worked out?",
    answer:
      "A CIS deduction is tax taken off a construction subcontractor's payment by the contractor, under HMRC's Construction Industry Scheme, and paid over to HMRC against the subcontractor's own tax bill. The rate is 20% if the subcontractor is registered with HMRC, 30% if they are not, and 0% with gross payment status. Crucially, the deduction comes only from the labour part of the invoice — never from materials, and never from the VAT. That is why the generator asks you to mark each line as labour or materials: on a £2,510 invoice where £660 is labour, the 20% deduction is £132, not £502.",
  },
  {
    question: "Can I charge interest if a client pays late?",
    answer:
      "Yes — on a business-to-business invoice you can claim statutory interest at 8% plus the Bank of England base rate under the Late Payment of Commercial Debts (Interest) Act 1998, plus a fixed compensation sum: £40 for a debt under £1,000, £70 from £1,000 to £9,999.99, and £100 at £10,000 or more. If you never agreed a payment date, the law gives the customer 30 days from receiving the invoice or the goods or service, whichever is later. Stating your terms and the due date on the invoice itself — as this generator does — is what makes the claim straightforward.",
  },
  {
    question: "How long must I keep copies of my invoices?",
    answer:
      "VAT-registered businesses must keep their VAT records, including invoices, for 6 years. Self-employed businesses must keep their records until 5 years after the 31 January tax return deadline for the year the invoice belongs to. Digital copies are fine — HMRC does not require paper originals — so saving the PDF this generator produces is enough, as long as it stays readable and backed up.",
  },
  {
    question: "How should I number my invoices?",
    answer:
      "Use one unbroken sequence and never reuse a number: every invoice gets the next number in line, even if the previous one was cancelled. Any format works — INV-0001, 2026-001, or your own prefix per client — as long as each number is unique and the sequence has no unexplained gaps. If an invoice is cancelled, keep it and mark it void rather than deleting it, so the sequence still explains itself to HMRC. A VAT invoice's number must be sequential and unique across the whole business.",
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
  name: "Free Invoice Generator UK",
  url: `${AppConfig.siteUrl}/free-invoice-generator-uk`,
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

export default function FreeInvoiceGeneratorUkPage() {
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

      <section className="space-y-3 print:hidden">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Free Invoice Generator UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A free invoice generator for UK sole traders, freelancers
          and small companies: fill in your details, add your lines
          with VAT at 20%, 5% or 0%, take a CIS deduction if the
          work is construction, and print or save a finished invoice
          as a PDF. No sign-up — your data never leaves your
          browser.
        </p>
      </section>

      <InvoiceGenerator />

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How to use this free invoice generator
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          UK Payroll Calculators is a free hub of UK payroll
          calculators and business tools, built on the April 2026
          rules published by GOV.UK and HMRC — no sign-up, no
          accounts, and every figure worked out in your browser.
          This generator follows the same pattern. Add your business
          details once (they are remembered only in this browser),
          then your client, the invoice number and dates, and your
          lines — a rate and a VAT rate for each, marked as labour
          or materials if the work is construction. The invoice
          builds itself underneath as you type: subtotal, any
          discount, the VAT split by rate, the CIS deduction where
          one applies, and the amount due. When it looks right,
          print it or save it as a PDF and send it. If you charge by
          the day, the{" "}
          <Link href="/day-rate-calculator" className={linkClass}>
            day rate calculator
          </Link>{" "}
          turns that rate into the yearly figure behind it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What must a UK invoice include?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          GOV.UK lists nine items every invoice must carry: a unique
          identification number; your company name, address and
          contact information; the company name and address of the
          customer you are invoicing; a clear description of what
          you are charging for; the date the goods or service were
          provided (the supply date); the date of the invoice; the
          amount(s) being charged; the VAT amount if applicable; and
          the total amount owed. The form above is built around that
          list — every one of the nine has a field, and the finished
          invoice shows all of them. The full list is on{" "}
          <a
            href="https://www.gov.uk/invoicing-and-taking-payment-from-customers"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            GOV.UK&apos;s invoicing guide
          </a>
          .
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Two things are not on the legal list but belong on every
          invoice anyway, because they are what gets you paid: a due
          date (without an agreed date, the law allows the customer
          30 days) and your bank details with the invoice number as
          the payment reference. Both are on the invoice this
          generator produces.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How does VAT work on an invoice?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If you are VAT registered, your invoice becomes a VAT
          invoice and carries more: your VAT registration number,
          the rate of VAT on each line, the total amount excluding
          VAT, and the total VAT charged, in sterling. That is why
          each line in the generator has its own VAT rate — a single
          invoice can mix standard-rated work, reduced-rate work and
          zero-rated or exempt lines, and the totals split the VAT
          out by rate, the way a VAT return needs it. For a
          VAT-registered customer and a total of £250 or less
          including VAT, a simplified invoice with fewer details is
          allowed; above that, issue the full invoice. Registration
          itself is compulsory once taxable turnover passes £90,000
          in any rolling 12 months. To check a price with the VAT
          added or taken out on its own, use the{" "}
          <Link href="/vat-calculator" className={linkClass}>
            VAT calculator
          </Link>
          .
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>VAT rate</th>
                <th className={thClass}>Charged on</th>
                <th className={thClass}>What it means on the invoice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>20% (standard)</td>
                <td className={tdClass}>
                  Most goods and services sold in the UK
                </td>
                <td className={tdClass}>
                  The default rate — if in doubt, a line is usually
                  standard-rated
                </td>
              </tr>
              <tr>
                <td className={tdClass}>5% (reduced)</td>
                <td className={tdClass}>
                  Domestic fuel and power, children&apos;s car seats,
                  some energy-saving and health products
                </td>
                <td className={tdClass}>
                  VAT is added at 5% of the net line amount
                </td>
              </tr>
              <tr>
                <td className={tdClass}>0% (zero-rated)</td>
                <td className={tdClass}>
                  Most food, books and newspapers, children&apos;s
                  clothes, passenger transport
                </td>
                <td className={tdClass}>
                  No VAT added, but the line still counts towards your
                  VAT-taxable turnover
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Exempt</td>
                <td className={tdClass}>
                  Insurance, finance, health and education services
                </td>
                <td className={tdClass}>
                  No VAT added, and the line does not count towards
                  the £90,000 registration threshold
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          The short version — GOV.UK&apos;s full VAT rates list runs
          to hundreds of items, so check the rate for anything
          unusual before you invoice it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          When the invoices pile up: keeping the records straight
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One invoice at a time, this generator is all you need. The
          work changes when the invoices become a system: numbers to
          keep in sequence across months, VAT to total up by rate
          for each return, part-paid invoices to chase, and a year of
          records HMRC can ask to see — VAT records for 6 years,
          self-employed records until 5 years after the 31 January
          deadline. That bookkeeping layer is what accounting
          software is for:{" "}
          <a
            href="https://go.zoho.com/aG2O"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Books
          </a>{" "}
          raises and numbers the invoices, records the payments
          against them and keeps the VAT split ready for the return,
          so the sequence this page starts becomes the record the
          business runs on. If you also pay people, the{" "}
          <Link href="/payslip-generator" className={linkClass}>
            payslip generator
          </Link>{" "}
          covers the wages side in the same browser-only way.
        </p>
        <p className="max-w-2xl text-sm leading-relaxed text-slate-500 dark:text-slate-400">
          We may earn a commission from some providers if you sign
          up after visiting them — it never changes the price you
          pay, and providers cannot pay to be ranked or included.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Excel template, PDF or a generator — which should you use?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Three honest options, and the right one depends on volume.
          An Excel or Word template costs nothing and is fine for an
          occasional invoice, but every total, VAT line and invoice
          number is typed by hand — the classic errors (a reused
          number, VAT added at the wrong rate, a subtotal that does
          not match the lines) are all manual ones. A PDF is not a
          way of making an invoice but the format to send it in:
          whatever you build it with, send the client a PDF, because
          it cannot be edited after sending and prints the same
          everywhere — this generator produces one through your
          browser&apos;s print or save-as-PDF step, with the VAT
          split, CIS deduction and numbering handled as you type.
          And when invoices become a weekly system rather than an
          occasional document, accounting software takes over the
          sequence, the VAT totals and the chasing — that step up is
          covered in the records section above.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How do CIS deductions change an invoice?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Under HMRC&apos;s Construction Industry Scheme, a
          contractor pays a subcontractor less than the invoice
          total: the difference is a deduction the contractor sends
          to HMRC, credited against the subcontractor&apos;s own tax
          bill. The deduction is a percentage of the labour part of
          the invoice only — materials are left alone, and so is the
          VAT. An invoice that lumps labour and materials into one
          line invites the deduction to be taken from the whole
          amount, which is why this generator separates the two and
          why the worked example below does the same. The contractor
          must give the subcontractor a statement showing the
          deduction — keep it; it is the proof that the tax was
          paid. If you work through an umbrella company instead, the{" "}
          <Link
            href="/umbrella-company-calculator"
            className={linkClass}
          >
            umbrella company calculator
          </Link>{" "}
          shows what an assignment rate leaves after its deductions.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Subcontractor status</th>
                <th className={thClass}>CIS deduction rate</th>
                <th className={thClass}>Taken from</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>
                  Registered with HMRC for CIS
                </td>
                <td className={tdClass}>20%</td>
                <td className={tdClass}>
                  The labour part of the payment, excluding VAT
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Not registered</td>
                <td className={tdClass}>30%</td>
                <td className={tdClass}>
                  The labour part of the payment, excluding VAT
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Gross payment status</td>
                <td className={tdClass}>0% (no deduction)</td>
                <td className={tdClass}>
                  Nothing — the contractor pays the invoice in full
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Sole trader or limited company — what changes on the
          invoice?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The nine GOV.UK items are the same for everyone; what
          changes is whose name goes at the top and which extra
          details follow it. A sole trader invoices in their own
          name — if you trade under a business name, both names
          appear, with an address where legal documents can be
          delivered to you. A limited company invoices in the
          company&apos;s full registered name, exactly as it appears
          on the certificate of incorporation, and should show its
          company registration number and registered office address —
          the generator has a field for the number, and the address
          goes in with the rest of the business details.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>On the invoice</th>
                <th className={thClass}>Sole trader</th>
                <th className={thClass}>Limited company</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Name at the top</td>
                <td className={tdClass}>
                  Your own name, plus any business name you trade
                  under
                </td>
                <td className={tdClass}>
                  The full company name, exactly as on the
                  certificate of incorporation
                </td>
              </tr>
              <tr>
                <td className={tdClass}>Extra details</td>
                <td className={tdClass}>
                  An address where legal documents can be delivered
                  to you
                </td>
                <td className={tdClass}>
                  Company registration number and registered office
                  address; if directors are named, all of them must
                  be
                </td>
              </tr>
              <tr>
                <td className={tdClass}>VAT</td>
                <td className={tdClass}>
                  Only if you are VAT registered — then a full VAT
                  invoice, as above
                </td>
                <td className={tdClass}>
                  Only if the company is VAT registered — then a full
                  VAT invoice, as above
                </td>
              </tr>
              <tr>
                <td className={tdClass}>The tax behind it</td>
                <td className={tdClass}>
                  The income is yours — it lands on your Self
                  Assessment return
                </td>
                <td className={tdClass}>
                  The income is the company&apos;s — it lands on the
                  company tax return
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What does a finished invoice look like?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          A real one, worked by the same maths as the generator
          above: a kitchen fitter invoices a contractor for three
          days of fitting and the units supplied, VAT registered,
          with the CIS deduction at 20% taken from the labour only.
          Watch what the deduction does — it comes off the £660 of
          labour, not off the {fmtMoney(SAMPLE.total)} total:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Description</th>
                <th className={thClass}>Qty</th>
                <th className={thClass}>Rate</th>
                <th className={thClass}>VAT</th>
                <th className={thClass}>Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {SAMPLE.lines.map((line) => (
                <tr key={line.description}>
                  <td className={tdClass}>
                    {line.description}
                    {line.kind !== "standard" && (
                      <span className="text-slate-500 dark:text-slate-400">
                        {" "}
                        ({line.kind})
                      </span>
                    )}
                  </td>
                  <td className={tdClass}>{line.quantity}</td>
                  <td className={tdClass}>{fmtMoney(line.rate)}</td>
                  <td className={tdClass}>{line.vatRate}%</td>
                  <td className={tdClass}>{fmtMoney(line.net)}</td>
                </tr>
              ))}
              <tr>
                <td className={tdClass} colSpan={4}>
                  Subtotal
                </td>
                <td className={tdClass}>{fmtMoney(SAMPLE.subtotal)}</td>
              </tr>
              <tr>
                <td className={tdClass} colSpan={4}>
                  VAT at 20% on {fmtMoney(SAMPLE.netTotal)}
                </td>
                <td className={tdClass}>{fmtMoney(SAMPLE.vatTotal)}</td>
              </tr>
              <tr>
                <td className={tdClass} colSpan={4}>
                  Invoice total
                </td>
                <td className={tdClass}>{fmtMoney(SAMPLE.total)}</td>
              </tr>
              <tr>
                <td className={tdClass} colSpan={4}>
                  Less CIS deduction at 20% (on labour of{" "}
                  {fmtMoney(SAMPLE.cisBase)})
                </td>
                <td className={tdClass}>
                  −{fmtMoney(SAMPLE.cisDeduction)}
                </td>
              </tr>
              <tr>
                <td
                  className={`${tdClass} font-semibold text-slate-900 dark:text-slate-50`}
                  colSpan={4}
                >
                  Amount the client pays
                </td>
                <td
                  className={`${tdClass} font-semibold text-slate-900 dark:text-slate-50`}
                >
                  {fmtMoney(SAMPLE.amountDue)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The subcontractor is not £132 worse off: the contractor
          pays that £132 to HMRC in the subcontractor&apos;s name,
          and it comes off the tax bill at the end of the year. What
          the subcontractor must not lose is the deduction statement
          that proves it.
        </p>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What can you charge if a client pays late?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          More than most small businesses realise. Under the Late
          Payment of Commercial Debts (Interest) Act 1998, an unpaid
          business-to-business invoice earns statutory interest at
          8% plus the Bank of England base rate, worked out daily
          from the day after payment was due — plus a fixed
          compensation sum on top, set by the size of the debt. If
          no payment date was agreed, GOV.UK&apos;s rule is that the
          customer must pay within 30 days of getting the invoice or
          the goods or service, whichever is later. The strongest
          protection costs nothing: agree the date up front, print
          it on the invoice as the due date — the generator does
          this from your payment terms — and keep the invoice itself
          as the record.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Size of the unpaid debt</th>
                <th className={thClass}>
                  Fixed compensation you can add
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>Under £1,000</td>
                <td className={tdClass}>£40</td>
              </tr>
              <tr>
                <td className={tdClass}>£1,000 to £9,999.99</td>
                <td className={tdClass}>£70</td>
              </tr>
              <tr>
                <td className={tdClass}>£10,000 or more</td>
                <td className={tdClass}>£100</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How should you number your invoices?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          One sequence, no gaps you cannot explain, and no number
          ever used twice. Start wherever you like — INV-0001 is
          fine, and so is a year prefix like 2026-001 — then simply
          take the next number for every invoice, including the ones
          that are later cancelled: a cancelled invoice stays in the
          sequence, marked void, rather than disappearing and
          leaving a hole HMRC will ask about. The generator follows
          the same rule: the number is yours to edit, and the
          &ldquo;Start a new invoice&rdquo; button steps it on by
          one, so the sequence keeps itself while you work.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Facts and rates on this page checked against GOV.UK on 22
          November 2026 — the nine invoice items and the 30-day
          default from GOV.UK&apos;s invoicing guide, the £90,000
          VAT registration threshold from GOV.UK&apos;s VAT guidance,
          the CIS rates from HMRC&apos;s Construction Industry
          Scheme guidance, and the late-payment figures from the
          Late Payment of Commercial Debts (Interest) Act 1998. This
          page is a working tool and a guide, not tax or legal
          advice.
        </p>
      </section>

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Frequently asked questions
        </h2>
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

      <RelatedCalculators href="/free-invoice-generator-uk" />
      <div className="print:hidden">
        <ShareButtons />
        <ReviewCard />
        <SubscribeBox />
      </div>
    </div>
  );
}
