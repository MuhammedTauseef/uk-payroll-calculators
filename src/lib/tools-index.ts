import { AppConfig } from "@/utils/AppConfig";

/**
 * The static tools index (UX Phase 3, 2026-11-20): every calculator
 * and converter with its category and search keywords, derived from
 * AppConfig.nav so a tool added to the nav appears here — and in the
 * sidebar and the header search — automatically.
 *
 * This is plain build-time data. It ships inside the client bundle
 * for the sidebar and the search box, so searching costs no server
 * work at all: no API route, no per-keystroke request. Blog articles
 * are the one thing this file cannot know (they live in the
 * database); the search box adds them client-side from the sitemap
 * the site already publishes.
 *
 * Categories are the site's own groupings, first used by the
 * homepage directory: Pay & Tax, Leave & Family, Employers &
 * Contractors, Converters, then the US and Australia tools.
 */
export const TOOL_CATEGORY_ORDER = [
  "Pay & Tax",
  "Leave & Family",
  "Employers & Contractors",
  "Converters",
  "US",
  "Australia",
] as const;

/** Shared with the homepage directory (its original home). */
export const CATEGORY_BY_HREF: Record<string, string> = {
  "/ssp-calculator": "Leave & Family",
  "/notice-period-calculator": "Employers & Contractors",
  "/pro-rata-salary-calculator": "Pay & Tax",
  "/employer-national-insurance-calculator": "Employers & Contractors",
  "/employer-cost-calculator": "Employers & Contractors",
  "/nhs-maternity-pay-calculator": "Leave & Family",
  "/nhs-pay-calculator": "Pay & Tax",
  "/paternity-pay-calculator": "Leave & Family",
  "/maternity-pay-calculator": "Leave & Family",
  "/redundancy-pay-calculator": "Leave & Family",
  "/holiday-pay-calculator": "Leave & Family",
  "/40k-after-tax-uk": "Pay & Tax",
  "/payslip-calculator": "Pay & Tax",
  "/payslip-generator": "Pay & Tax",
  "/salary-sacrifice-calculator": "Pay & Tax",
  "/student-loan-repayment-calculator": "Pay & Tax",
  "/umbrella-company-calculator": "Employers & Contractors",
  "/capital-gains-tax-calculator": "Pay & Tax",
  "/hmrc-tax-code-checker": "Pay & Tax",
  "/annual-leave-calculator": "Leave & Family",
  "/pro-rata-holiday-calculator": "Leave & Family",
  "/term-time-pay-calculator": "Leave & Family",
  "/overtime-calculator": "Pay & Tax",
  "/hourly-rate-converter": "Pay & Tax",
  "/ir35-calculator": "Employers & Contractors",
  "/vat-calculator": "Pay & Tax",
  "/annuity-calculator": "Pay & Tax",
  "/childcare-calculator": "Leave & Family",
  "/pension-drawdown-calculator": "Pay & Tax",
  "/cms-calculator": "Leave & Family",
};

const KEYWORDS_BY_HREF: Record<string, string> = {
  "/ssp-calculator": "statutory sick pay sick leave sick note fit note",
  "/notice-period-calculator": "notice resignation dismissal redundancy notice",
  "/pro-rata-salary-calculator": "part time pro rata salary fte",
  "/employer-national-insurance-calculator": "employer ni national insurance contributions secondary",
  "/employer-cost-calculator": "cost of employing staff employer cost total employment cost",
  "/nhs-maternity-pay-calculator": "nhs maternity occupational pay omp agenda for change",
  "/nhs-pay-calculator": "nhs pay bands agenda for change salary spine point",
  "/paternity-pay-calculator": "statutory paternity pay spp partner leave",
  "/maternity-pay-calculator": "statutory maternity pay smp maternity leave",
  "/redundancy-pay-calculator": "statutory redundancy pay severance laid off",
  "/holiday-pay-calculator": "holiday pay rolled up accrued leave pay",
  "/40k-after-tax-uk": "take home pay after tax net salary 40k after tax",
  "/payslip-calculator": "payslip calculator pay slip deductions check",
  "/payslip-generator": "payslip generator make create payslip pdf",
  "/salary-sacrifice-calculator": "salary sacrifice pension sacrifice exchange",
  "/student-loan-repayment-calculator": "student loan repayment plan 1 plan 2 plan 5 postgraduate",
  "/umbrella-company-calculator": "umbrella company take home contractor",
  "/capital-gains-tax-calculator": "capital gains tax cgt shares property",
  "/hmrc-tax-code-checker": "tax code checker 1257l hmrc code meaning",
  "/annual-leave-calculator": "annual leave holiday entitlement days hours",
  "/pro-rata-holiday-calculator": "pro rata holiday entitlement part time leave",
  "/term-time-pay-calculator": "term time only pay school staff tto",
  "/overtime-calculator": "overtime pay rate extra hours",
  "/hourly-rate-converter": "hourly rate to salary salary to hourly wage",
  "/ir35-calculator": "ir35 off payroll contractor status",
  "/vat-calculator": "vat value added tax add remove 20%",
  "/annuity-calculator": "annuity pension income retirement",
  "/childcare-calculator": "childcare tax free childcare hours funding",
  "/pension-drawdown-calculator": "pension drawdown flexi access income",
  "/cms-calculator": "child maintenance service cms child support",
  "/stone-to-kg-converter": "stone to kg kilograms weight",
  "/kg-to-stone-converter": "kg to stone kilograms weight",
  "/miles-to-km-converter": "miles to km kilometres distance",
  "/cm-to-inches-converter": "cm to inches centimetres height",
  "/litres-to-gallons-converter": "litres to gallons fuel mpg",
  "/us/texas-paycheck-calculator": "texas paycheck take home salary us",
  "/us/ohio-paycheck-calculator": "ohio paycheck take home salary us",
  "/au/tax-rate-calculator": "australia tax rate ato take home",
};

export interface ToolIndexEntry {
  href: string;
  title: string;
  category: string;
  icon: string;
  keywords: string;
}

function categoryFor(href: string, flag: string): string {
  if (flag === "🇺🇸") return "US";
  if (flag === "🇦🇺") return "Australia";
  if (href.includes("converter")) return "Converters";
  return CATEGORY_BY_HREF[href] ?? "Pay & Tax";
}

export const TOOLS_INDEX: ToolIndexEntry[] = AppConfig.nav
  .filter((item) => item.href !== "/" && item.href !== "/blog")
  .map((item) => ({
    href: item.href,
    title: item.label,
    category: categoryFor(item.href, item.flag),
    icon: item.icon,
    keywords: KEYWORDS_BY_HREF[item.href] ?? "",
  }));

export interface SearchEntry {
  href: string;
  title: string;
  kind: "Calculator" | "Guide" | "Page" | "Article";
  haystack: string;
}

/** Tools + guides + site pages as one static search list. */
export const STATIC_SEARCH_INDEX: SearchEntry[] = [
  ...TOOLS_INDEX.map((tool) => ({
    href: tool.href,
    title: tool.title,
    kind: "Calculator" as const,
    haystack:
      `${tool.title} ${tool.category} ${tool.keywords} ${tool.href}`.toLowerCase(),
  })),
  ...AppConfig.guides.map((guide) => ({
    href: guide.href,
    title: guide.label,
    kind: "Guide" as const,
    haystack: `${guide.label} ${guide.href} ssp statutory sick pay guide`.toLowerCase(),
  })),
  ...AppConfig.siteLinks
    .filter((item) => item.href !== "/blog")
    .map((item) => ({
      href: item.href,
      title: item.label,
      kind: "Page" as const,
      haystack: `${item.label} ${item.href}`.toLowerCase(),
    })),
  {
    href: "/blog",
    title: "Blog",
    kind: "Page" as const,
    haystack: "blog articles guides news payroll",
  },
];
