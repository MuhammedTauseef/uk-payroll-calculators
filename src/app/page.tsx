import Link from "next/link";
import { SSP_GUIDES } from "@/components/GuideSections";

const iconProps = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  viewBox: "0 0 24 24",
  className: "h-6 w-6",
  "aria-hidden": true,
} as const;

function SspIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function NoticeIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4" />
    </svg>
  );
}

function ProRataIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 3v9h9" />
    </svg>
  );
}

function EmployerNiIcon() {
  return (
    <svg {...iconProps}>
      <rect x="2" y="6" width="20" height="12" rx="2" />
      <circle cx="12" cy="12" r="2.5" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}

function GuideIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14z" />
      <path d="M4 19.5A2.5 2.5 0 0 0 6.5 22H20v-5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      viewBox="0 0 24 24"
      className="h-4 w-4 text-brand-700"
      aria-hidden
    >
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}

const CALCULATORS = [
  {
    href: "/ssp-calculator",
    icon: <SspIcon />,
    title: "SSP Calculator",
    description:
      "Work out Statutory Sick Pay under the April 2026 rules: the lower of £123.25 a week or 80% of average weekly earnings, payable from the first full day of sickness.",
    linkText: "Open the SSP calculator →",
  },
  {
    href: "/notice-period-calculator",
    icon: <NoticeIcon />,
    title: "Notice Period Calculator",
    description:
      "Work out the statutory minimum notice for employers and employees under the Employment Rights Act 1996, compare it with the contract period, and find the earliest last working day.",
    linkText: "Open the notice period calculator →",
  },
  {
    href: "/pro-rata-salary-calculator",
    icon: <ProRataIcon />,
    title: "Pro Rata Salary Calculator",
    description:
      "Work out part-time pay from the full-time salary, by hours or days per week: pro-rata annual, monthly and weekly pay, the FTE fraction, and pro-rata holiday entitlement in days.",
    linkText: "Open the pro-rata calculator →",
  },
  {
    href: "/employer-national-insurance-calculator",
    icon: <EmployerNiIcon />,
    title: "Employer National Insurance Calculator",
    description:
      "Work out employer Class 1 NICs on a salary — 15% on earnings above the £5,000 Secondary Threshold (2026/27 rates) — with the Employment Allowance, and see the total cost of employing someone.",
    linkText: "Open the employer NI calculator →",
  },
];

const TRUST_POINTS = [
  "Free to use",
  "No sign-up needed",
  "Shows its working",
  "April 2026 rules",
];

const STEPS = [
  {
    title: "Enter your numbers",
    text: "Your own pay, hours or dates — each calculator starts from the figures in front of you.",
  },
  {
    title: "See the working",
    text: "Rates, thresholds and rules are shown step by step, so you can check every figure yourself.",
  },
  {
    title: "Use the result",
    text: "Weekly rates, daily rates and totals you can take straight into payroll or a conversation.",
  },
];

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6 pt-4 text-center sm:pt-8">
        <p className="inline-block rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800 uppercase">
          Built on the April 2026 rules
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
          UK payroll,{" "}
          <span className="text-brand-700">worked out properly.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
          Free calculators for UK statutory payments, built on the April 2026
          rules. Each calculator shows its working from your own numbers —
          weekly rates, daily rates and totals — so you can see exactly how a
          figure is reached before it goes anywhere near payroll.
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <Link
            href="/ssp-calculator"
            className="rounded-full bg-brand-700 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
          >
            Try the SSP calculator
          </Link>
          <Link
            href="#calculators"
            className="rounded-full border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-brand-300 hover:text-brand-800"
          >
            Browse all calculators
          </Link>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm font-medium text-slate-600">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <CheckIcon />
              {point}
            </li>
          ))}
        </ul>
      </section>

      <section id="calculators" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          The calculators
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {CALCULATORS.map((calc) => (
            <Link
              key={calc.href}
              href={calc.href}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                {calc.icon}
              </span>
              <h3 className="text-lg font-semibold text-slate-900">
                {calc.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {calc.description}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                {calc.linkText}
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section id="guides" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          SSP guides
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600">
          Straight answers to the sick-pay questions employers and employees
          actually ask — what SSP is, how much it pays, the current rate,
          and how the calculation works.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {SSP_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                <GuideIcon />
              </span>
              <h3 className="text-lg font-semibold text-slate-900">
                {guide.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {guide.description}
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                Read the guide →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          How it works
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 text-sm font-bold text-brand-800">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
