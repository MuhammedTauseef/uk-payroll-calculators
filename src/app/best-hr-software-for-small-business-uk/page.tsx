import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import { PAYE_RATES_LABEL, RATES_LAST_VERIFIED } from "@/lib/rates";

export const metadata: Metadata = pageMetadata(
  "/best-hr-software-for-small-business-uk",
  "Best HR Software for Small Business UK — Compared",
  "Breathe HR, PeopleHR, Sage HR, Ciphr and Xero Payroll compared for UK small businesses — who each one suits, what it costs, and how to choose.",
);

interface Product {
  name: string;
  url: string;
  bestFor: string;
  standout: string;
  body: string[];
  watchOut: string;
}

const PRODUCTS: Product[] = [
  {
    name: "Breathe HR",
    url: "https://www.breathehr.com",
    bestFor: "Very small teams (roughly 2–50 staff) who want the basics done simply",
    standout: "Built only for small businesses, so nothing is buried in enterprise menus",
    body: [
      "Breathe HR is made in the UK specifically for small employers, and it shows: holiday and absence tracking, employee records, documents and performance basics are all set up the way a small firm actually works. There is no payroll module of its own — it is designed to sit alongside whatever payroll you already use.",
      "If your current system is a spreadsheet and a shared drive, Breathe is usually the gentlest first step: quick to set up, easy for staff to book leave on their phones, and priced for small headcounts.",
    ],
    watchOut:
      "No built-in payroll — budget for a separate payroll tool or bureau if you need one.",
  },
  {
    name: "PeopleHR",
    url: "https://www.peoplehr.com",
    bestFor: "Growing firms that want the most features for the money",
    standout: "Published per-employee pricing and a 14-day free trial",
    body: [
      "PeopleHR (part of Access Group) packs in more than most small-business tools: recruitment tracking, performance management, expenses, and reporting, on top of the usual holiday, absence and document storage. Its pricing is public, which makes shortlisting easier — when we checked its site in November 2026, plans were listed from £4 per employee per month (Starter), £6.25 (Core), £9.25 (Pro) and £11 (Elite+), with a 14-day free trial.",
      "That makes PeopleHR the natural pick if you want one system that can grow with you from 10 staff towards 100, and you are willing to spend a little setup time to use the extra features.",
    ],
    watchOut:
      "The feature list is long, so set-up takes longer than the simplest tools — plan an afternoon, not an hour.",
  },
  {
    name: "Sage HR",
    url: "https://www.sage.com/en-gb/products/sage-hr/",
    bestFor: "Businesses already using Sage for payroll or accounts",
    standout: "Sits inside the Sage ecosystem your accountant probably already knows",
    body: [
      "Sage HR covers the core small-business ground — leave and absence, employee records, shift scheduling and expenses — and its real advantage is fit: if your payroll or bookkeeping already runs on Sage, keeping HR in the same family means fewer exports, fewer logins and an accountant who is already at home in the system.",
      "For a business that pays staff through Sage Payroll, that joined-up feel usually beats a slightly longer feature list elsewhere.",
    ],
    watchOut:
      "The value drops if you are not already a Sage customer — compare it on features alone before assuming it wins.",
  },
  {
    name: "Ciphr",
    url: "https://www.ciphr.com",
    bestFor: "Larger SMEs (roughly 50–250+ staff) with onboarding and integration needs",
    standout: "A mid-market HR platform rather than a small-business tool",
    body: [
      "Ciphr is the step up on this list: a fuller HR platform with onboarding workflows, learning and recruitment modules, and integrations aimed at organisations with a dedicated HR person or team. For a firm of 15 people it is more system than you need; for a firm of 150 with real onboarding volume, it is the class of tool you will end up on.",
      "Shortlist Ciphr when you are replacing a first HR system that you have outgrown, rather than buying your first one.",
    ],
    watchOut:
      "Pricing is quote-based rather than published, and implementation is a project, not a sign-up form.",
  },
  {
    name: "Xero Payroll",
    url: "https://www.xero.com/uk/payroll-software/",
    bestFor: "Businesses whose main job is payroll, not HR",
    standout: "Payroll inside the accounts software many UK small firms already use",
    body: [
      "Xero Payroll is not a full HR system — it is here because for many small employers the honest answer to 'HR software' is actually 'payroll that handles people properly'. It runs pay, pensions auto-enrolment, leave balances and HMRC filing inside Xero's accounting software, with employee self-service for payslips and leave requests.",
      "If your admin pain is pay day rather than performance reviews, Xero Payroll plus a simple HR tool (or even Breathe alongside it) is a combination many UK small firms land on.",
    ],
    watchOut:
      "No performance management, recruitment or document workflows — pair it with an HR tool if you need those.",
  },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does HR software cost a small business in the UK?",
    answer:
      "Most small-business HR software is priced per employee per month. As a concrete anchor, PeopleHR listed plans from £4 per employee per month when we checked in November 2026, with fuller plans at £6.25, £9.25 and £11. For a team of 15, that is roughly £60 to £165 a month depending on the tier — usually far less than the admin time it replaces. Some providers (like Ciphr) price by quote instead.",
  },
  {
    question: "What is the difference between HR software and payroll software?",
    answer:
      "HR software looks after people records: contracts and documents, holiday and absence, onboarding, performance and training. Payroll software works out pay, tax, National Insurance and pensions and files them with HMRC. Some products do both, many do one well and integrate with the other — which is why this list includes Xero Payroll alongside HR tools.",
  },
  {
    question: "Do I legally need HR software?",
    answer:
      "No — there is no legal requirement to use HR software at any size. What the law does require is accurate records: right-to-work checks, working time and holiday records, payroll and pension records, and contracts issued on or before day one. Software simply makes keeping those records reliably much easier once you pass a handful of employees.",
  },
  {
    question: "Can HR software run my payroll?",
    answer:
      "Sometimes. A few HR tools include payroll or a payroll add-on, but many — Breathe HR, for example — deliberately leave payroll to a separate product and integrate with it instead. If payroll is your main headache, start from the payroll side (Sage or Xero) and add HR; if people admin is the headache, start from the HR side.",
  },
  {
    question: "Is my employee data safe in cloud HR software?",
    answer:
      "The established UK providers store data under UK GDPR with encryption, access controls and audit trails, and act as your data processor — you remain the data controller. Before signing up, check where data is hosted, who can access it, and how you get your data back if you leave. A reputable provider answers all three plainly.",
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

export default function BestHrSoftwarePage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Best HR Software for Small Business UK
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          For most UK small businesses the shortlist is short: Breathe HR
          for simplicity, PeopleHR for features per pound, Sage HR if you
          already live in Sage, Ciphr when you have outgrown the others,
          and Xero Payroll when payroll is the real job. Here is who each
          one suits, what it costs, and where each one falls short.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          The shortlist at a glance
        </h2>
        <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <th className="px-4 py-2 font-semibold text-slate-700">
                  Product
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700">
                  Best for
                </th>
                <th className="px-4 py-2 font-semibold text-slate-700">
                  Standout point
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRODUCTS.map((p) => (
                <tr key={p.name}>
                  <td className="px-4 py-2 font-medium text-slate-900">
                    {p.name}
                  </td>
                  <td className="px-4 py-2">{p.bestFor}</td>
                  <td className="px-4 py-2">{p.standout}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {PRODUCTS.map((p, i) => (
        <section key={p.name} className="space-y-3">
          <h2 className="text-xl font-semibold text-slate-900">
            {i + 1}. {p.name} — {p.bestFor.toLowerCase()}
          </h2>
          {p.body.map((para) => (
            <p
              key={para.slice(0, 24)}
              className="max-w-2xl text-base leading-relaxed text-slate-700"
            >
              {para}
            </p>
          ))}
          <p className="max-w-2xl rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-base leading-relaxed text-amber-900">
            <span className="font-semibold">Watch out: </span>
            {p.watchOut}
          </p>
          <p>
            <a
              href={p.url}
              target="_blank"
              rel="noopener"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              Visit {p.name} →
            </a>
          </p>
        </section>
      ))}

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How do I choose the right one?
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Start from the job that hurts most. If it is holiday requests and
          absence records, the simplest tool (Breathe) wins. If it is
          recruitment and performance as you grow, shortlist PeopleHR. If
          pay day is the pain, start from payroll (Sage or Xero) and add HR
          around it. Then run a trial with your real data — enter ten real
          employees, book real leave, and see whether the system matches
          how your business actually works. Nearly every provider here
          offers a trial or a demo; use it before you commit, because
          switching later means moving every employee record by hand.
        </p>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Finally, count the whole cost of employing people, not just the
          software. Our{" "}
          <Link
            href="/employer-national-insurance-calculator"
            className="font-semibold text-brand-700 underline decoration-brand-300 underline-offset-2 hover:text-brand-800"
          >
            employer National Insurance calculator
          </Link>{" "}
          shows the NICs and pension costs that sit on top of every salary
          — the numbers HR software will be tracking for you.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          How this guide is put together
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          UK Payroll Calculators is a free calculator site for UK employers
          and employees. This guide is based on each provider&apos;s own
          published product and pricing pages, checked in November 2026;
          prices and features change, so confirm them on the
          provider&apos;s site before you buy. We may earn a commission
          from some providers if you sign up after visiting them — it never
          changes the price you pay, and providers cannot pay to be ranked
          or included. Links on this page currently go straight to the
          providers&apos; own websites.
        </p>
        <p className="text-sm text-slate-500">
          Guide checked: {RATES_LAST_VERIFIED}. Calculator rates on this
          site: {PAYE_RATES_LABEL}.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div
              key={f.question}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900">
                {f.question}
              </h3>
              <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">
          Related calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/employer-national-insurance-calculator"
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900">
              Employer National Insurance Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              The full cost of employing someone — employer NICs, the
              Employment Allowance and pension contributions.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/pro-rata-salary-calculator"
            className="group block rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900">
              Pro Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Part-time pay and pro-rata holiday entitlement, worked out
              from the full-time role.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
