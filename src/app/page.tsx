import Image from "next/image";
import Link from "next/link";
import { SSP_GUIDES } from "@/components/GuideSections";
import { pageMetadata } from "@/utils/metadata";
import { AppConfig } from "@/utils/AppConfig";
import { formatDateGB } from "@/lib/blog/format";
import { listPublishedBlogPosts } from "@/lib/blog/queries";

export const metadata = pageMetadata(
  "/",
  "UK Payroll Calculators — UK employer & payroll calculators",
  AppConfig.description,
);

// Dynamic on purpose (same as /blog): the "Latest from the blog"
// section below reads published posts at request time, so a post
// published from the admin panel appears on the front page straight
// away — a static prerender would freeze the list at build time.
export const dynamic = "force-dynamic";

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: AppConfig.name,
  url: AppConfig.siteUrl,
};


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

function MaternityIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 20.5s-7-4.6-9-9A5.2 5.2 0 0 1 12 6.4a5.2 5.2 0 0 1 9 5.1c-2 4.4-9 9-9 9z" />
    </svg>
  );
}

function PaternityIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <circle cx="17.2" cy="9.5" r="2.3" />
      <path d="M16 15.2c2.3.3 3.9 1.9 4.4 4.3" />
    </svg>
  );
}

function TakeHomeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 12l6.5-6.5M8.6 9.4h.01M15.4 14.6h.01" />
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
  {
    href: "/nhs-maternity-pay-calculator",
    icon: <MaternityIcon />,
    title: "NHS Maternity Pay Calculator",
    description:
      "Maternity pay under Agenda for Change — 8 weeks at full pay, 18 weeks at half pay plus SMP, 13 weeks at SMP — or Statutory Maternity Pay only, stage by stage from your salary.",
    linkText: "Open the maternity pay calculator →",
  },
  {
    href: "/paternity-pay-calculator",
    icon: <PaternityIcon />,
    title: "Paternity Pay Calculator",
    description:
      "Statutory Paternity Pay for one or two weeks of leave: the lower of £194.32 a week or 90% of average weekly earnings, with the two weeks taken together or separately.",
    linkText: "Open the paternity pay calculator →",
  },
  {
    href: "/40k-after-tax-uk",
    icon: <TakeHomeIcon />,
    title: "£40k After Tax UK",
    description:
      "Take-home pay on a £40,000 salary in 2026/27 — £32,319.60 a year after Income Tax and National Insurance — with a calculator that works for any salary you enter.",
    linkText: "Open the take-home calculator →",
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

export default async function HomePage() {
  const latestPosts = await listPublishedBlogPosts()
    .then((posts) => posts.slice(0, 3))
    .catch(() => []);

  return (
    <div className="space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
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

      <section className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          More guides
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          <Link
            href="/best-hr-software-for-small-business-uk"
            className="group block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
          >
            <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
              <GuideIcon />
            </span>
            <h3 className="text-lg font-semibold text-slate-900">
              Best HR Software for Small Business UK
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600">
              Breathe HR, PeopleHR, Sage HR, Ciphr and Xero Payroll
              compared: who each one suits, what it costs, and how to
              choose without overbuying.
            </p>
            <span className="mt-3 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
              Read the guide →
            </span>
          </Link>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="scroll-mt-32">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900">
            Latest from the blog
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md"
              >
                {post.cover_image_url && (
                  <Image
                    src={post.cover_image_url}
                    alt={post.title}
                    width={1280}
                    height={720}
                    className="aspect-video w-full object-cover"
                  />
                )}
                <div className="p-6">
                  {!post.cover_image_url && (
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
                      <GuideIcon />
                    </span>
                  )}
                  {post.published_at && (
                    <p className="text-sm font-medium text-slate-500">
                      {formatDateGB(post.published_at)}
                    </p>
                  )}
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600">
                    {post.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-700 group-hover:text-brand-800">
                    Read the guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-brand-700 hover:text-brand-800"
            >
              View all articles →
            </Link>
          </p>
        </section>
      )}

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
