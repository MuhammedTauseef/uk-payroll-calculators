import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import { SSP_GUIDES } from "@/components/GuideSections";
import { pageMetadata } from "@/utils/metadata";
import { AppConfig } from "@/utils/AppConfig";
import { formatDateGB } from "@/lib/blog/format";
import { listPublishedBlogPosts } from "@/lib/blog/queries";

export const metadata = pageMetadata(
  "/",
  "UK Payroll Calculators — UK employer & payroll calculators",
  "Free UK payroll calculators: SSP, employer NI, take-home pay, payslip generator, tax code checker, annual leave, overtime and IR35 — April 2026 rules.",
);

// ISR (1h): only the "Latest from the blog" strip reads the database;
// admin publishes revalidate the affected paths on save
// (saveBlogPostAction → revalidatePath — there is no deploy hook), so a
// new post appears on publish — anything changed without a save shows
// within the hour. Repeat hits stop re-reading blog_posts on every
// request (Vercel CPU cost, 2026-11-12).
export const revalidate = 3600;

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

function EmployerCostIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="7.5" width="18" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3 12.5h18" />
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

function PayslipIcon() {
  return (
    <svg {...iconProps}>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

function TaxCodeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4.3-4.3M8.8 11l1.7 1.7 3-3.2" />
    </svg>
  );
}

function AnnualLeaveIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M2 12h2M20 12h2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M19.1 4.9l-1.4 1.4M6.3 17.7l-1.4 1.4" />
    </svg>
  );
}

function OvertimeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 2.5h6" />
    </svg>
  );
}

function Ir35Icon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v18M5 7l7-4 7 4M3 13l2-2 2 2 2-2 2 2 2-2 2 2 2-2 2 2" />
      <path d="M8 21h8" />
    </svg>
  );
}

function TexasIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3.5l2.5 5.3 5.8.7-4.3 4 1.1 5.7L12 16.4l-5.1 2.8L8 13.5 3.7 9.5l5.8-.7z" />
    </svg>
  );
}

function AuIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="8" cy="8" r="2.4" />
      <circle cx="16" cy="16" r="2.4" />
      <path d="M17 5L7 19" />
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
      className="h-4 w-4 text-brand-700 dark:text-brand-300"
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
    href: "/employer-cost-calculator",
    icon: <EmployerCostIcon />,
    title: "Employer Cost Calculator",
    description:
      "What a salary really costs the employer: gross pay plus employer National Insurance at 15% above the £5,000 Secondary Threshold and workplace pension on qualifying earnings — the total cost of employing, per year and per month.",
    linkText: "Open the employer cost calculator →",
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
  {
    href: "/payslip-generator",
    icon: <PayslipIcon />,
    title: "Payslip Generator",
    description:
      "Create a UK payslip from an employer name, an employee name, the gross pay and a tax code: Income Tax and employee National Insurance worked out monthly or weekly, ready to print or save as a PDF.",
    linkText: "Open the payslip generator →",
  },
  {
    href: "/hmrc-tax-code-checker",
    icon: <TaxCodeIcon />,
    title: "Tax Code Checker",
    description:
      "Check what your tax code means — 1257L, BR, D0, 0T, a K code or an emergency W1/M1 ending: the tax-free allowance it gives you, what each part stands for, and how much more or less tax it takes than the standard 1257L on your salary.",
    linkText: "Open the tax code checker →",
  },
  {
    href: "/annual-leave-calculator",
    icon: <AnnualLeaveIcon />,
    title: "Annual Leave Calculator",
    description:
      "Work out statutory holiday entitlement: 5.6 weeks a year in your own working days — 28 days on a five-day week, pro-rata part-time, part-year starters, and the 12.07% accrual for irregular-hours workers — less the leave already taken.",
    linkText: "Open the annual leave calculator →",
  },
  {
    href: "/overtime-calculator",
    icon: <OvertimeIcon />,
    title: "Overtime Calculator",
    description:
      "Work out overtime pay at the rate in your contract — flat, time and a quarter, time and a half or double time — from an hourly rate or a salary, with a National Minimum Wage check on your average pay.",
    linkText: "Open the overtime calculator →",
  },
  {
    href: "/ir35-calculator",
    icon: <Ir35Icon />,
    title: "IR35 Calculator",
    description:
      "Check whether a contract is inside or outside IR35 from eight questions about control, substitution and the other status factors, then compare inside vs outside take-home pay on your day rate.",
    linkText: "Open the IR35 calculator →",
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
    .then((posts) => posts.slice(0, 2))
    .catch(() => []);

  return (
    <div className="space-y-10 sm:space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
      />
      {/* Full-screen hero (owner order 9 Nov 2026, evening —
          "carousel full screen par show hon laptop"): the section
          breaks out of <main>'s centred max-w-6xl column to the
          full viewport width (w-[100vw] + the centring negative
          margin; global.css clips any scrollbar-width overshoot
          on body so no horizontal scrollbar can appear), the
          negative top margin cancels <main>'s py-8/sm:py-12 so
          the hero starts directly under the sticky h-16 header,
          and min-height fills the rest of the first screen
          (100svh - 4rem header). No rounded card, no side
          margins: the carousel photos run edge to edge, with the
          copy centred over them in its own readable column. */}
      <section className="relative -mt-8 ml-[calc(50%-50vw)] flex min-h-[calc(100svh-4rem)] w-[100vw] flex-col justify-center overflow-hidden px-4 py-12 text-center sm:-mt-12 sm:px-8 sm:py-16">
        {/* Background photo carousel: full-screen UK photos
            crossfade behind the hero copy (see HeroCarousel). */}
        <HeroCarousel />
        <div className="relative z-10 space-y-6">
        <p className="inline-block rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 px-3 py-1 text-xs font-semibold tracking-wide text-brand-800 dark:text-brand-300 uppercase">
          Built on the April 2026 rules
        </p>
        <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-5xl">
          UK payroll,{" "}
          <span className="text-brand-700 dark:text-brand-300">worked out properly.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300 sm:text-lg">
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
            className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-6 py-3 text-sm font-semibold text-slate-700 dark:text-slate-300 shadow-sm transition hover:border-brand-300 dark:hover:border-brand-700 hover:text-brand-800 dark:hover:text-brand-300"
          >
            Browse all calculators
          </Link>
        </div>
        <ul className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-sm font-medium text-slate-600 dark:text-slate-300">
          {TRUST_POINTS.map((point) => (
            <li key={point} className="flex items-center gap-1.5">
              <CheckIcon />
              {point}
            </li>
          ))}
        </ul>
        </div>
      </section>

      <section id="calculators" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          The calculators 🇬🇧
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {CALCULATORS.map((calc, i) => {
            // Odd card out (odd counts): the last card spans the
            // full row as a wide feature card instead of leaving a
            // half-empty slot beside it.
            const wide = i === CALCULATORS.length - 1 && CALCULATORS.length % 2 === 1;
            return (
              <Link
                key={calc.href}
                href={calc.href}
                className={`group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md ${wide ? "sm:col-span-2 sm:flex sm:items-start sm:gap-5" : ""}`}
              >
                <span
                  className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm ${wide ? "sm:mb-0" : ""}`}
                >
                  {calc.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {calc.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {calc.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                    {calc.linkText}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section id="us-calculators" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          US Calculators 🇺🇸
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          The hub&apos;s first United States section — the same
          shows-its-working treatment as the UK tools, run on IRS rules
          instead of HMRC ones.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Single US tool so far: the card spans the full row as a
              wide feature card, same treatment as the odd card out in
              the grids above. */}
          <Link
            href="/us/texas-paycheck-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md sm:col-span-2 sm:flex sm:items-start sm:gap-5"
          >
            <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm sm:mb-0">
              <TexasIcon />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Texas Paycheck Calculator
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Net pay on a Texas salary or hourly wage under the 2026
                IRS rules: federal income tax withholding, Social
                Security and Medicare worked out line by line — and a
                Texas state income tax line of exactly $0, because Texas
                has none.
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                Open the Texas paycheck calculator →
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section id="au-calculators" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          AU Calculators 🇦🇺
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          The hub&apos;s Australia section — the same
          shows-its-working treatment as the UK and US tools, run on
          ATO rules instead of HMRC or IRS ones.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Single AU tool so far: the card spans the full row as a
              wide feature card, same treatment as the US section. */}
          <Link
            href="/au/tax-rate-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md sm:col-span-2 sm:flex sm:items-start sm:gap-5"
          >
            <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm sm:mb-0">
              <AuIcon />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Australia Tax Rate Calculator
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                Income tax and the Medicare levy on any Australian
                income under the ATO 2025–26 rates — your marginal
                and effective tax rate side by side, for residents
                and non-residents alike.
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                Open the Australia tax rate calculator →
              </span>
            </div>
          </Link>
        </div>
      </section>

      <section id="guides" className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          SSP guides
        </h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Straight answers to the sick-pay questions employers and employees
          actually ask — what SSP is, how much it pays, the current rate,
          and how the calculation works.
        </p>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {SSP_GUIDES.map((guide, i) => {
            // Odd card out (5 guides): the last card spans the full
            // row as a wide feature card, same treatment as the
            // calculators grid above.
            const wide = i === SSP_GUIDES.length - 1 && SSP_GUIDES.length % 2 === 1;
            return (
              <Link
                key={guide.href}
                href={guide.href}
                className={`group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md ${wide ? "sm:col-span-2 sm:flex sm:items-start sm:gap-5" : ""}`}
              >
                <span
                  className={`mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm ${wide ? "sm:mb-0" : ""}`}
                >
                  <GuideIcon />
                </span>
                <div className="min-w-0">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {guide.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {guide.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                    Read the guide →
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="scroll-mt-32">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          More guides
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2">
          {/* Single guide in a 2-column grid: the card spans the
              full row as a wide feature card (icon left, text right
              from sm up) so the section never looks half-empty. */}
          <Link
            href="/best-hr-software-for-small-business-uk"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md sm:col-span-2 sm:flex sm:items-start sm:gap-5"
          >
            <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm sm:mb-0">
              <GuideIcon />
            </span>
            <div className="min-w-0">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-50">
                Best HR Software for Small Business UK
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                The quick shortlist: five systems on one page — who
                each one suits, in one line each. For full prices and
                limits, see the in-depth blog guide.
              </p>
              <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                Read the guide →
              </span>
            </div>
          </Link>
        </div>
      </section>

      {latestPosts.length > 0 && (
        <section className="scroll-mt-32">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
            Latest from the blog
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            {latestPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
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
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                      {formatDateGB(post.published_at)}
                    </p>
                  )}
                  <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-slate-50">
                    {post.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                    {post.description}
                  </p>
                  <span className="mt-3 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
                    Read the guide →
                  </span>
                </div>
              </Link>
            ))}
          </div>
          <p className="mt-6">
            <Link
              href="/blog"
              className="text-sm font-semibold text-brand-700 dark:text-brand-300 hover:text-brand-800 dark:hover:text-brand-300"
            >
              View all articles →
            </Link>
          </p>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">
          How it works
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm"
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30 text-sm font-bold text-brand-800 dark:text-brand-300">
                {i + 1}
              </span>
              <h3 className="mt-3 text-base font-semibold text-slate-900 dark:text-slate-50">
                {step.title}
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {step.text}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
