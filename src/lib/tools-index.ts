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
 * Categories follow the grouped layout the owner settled on
 * 22 Nov 2026 (the Tiny Calculators directory pattern): Pay &
 * Salary, Tax & HMRC, Family & Baby, Money & Finance, Business
 * Tools and Converters, then the US, Australia and Switzerland
 * tools under their own country names.
 */
export const TOOL_CATEGORY_ORDER = [
  "Pay & Salary",
  "Tax & HMRC",
  "Family & Baby",
  "Money & Finance",
  "Business Tools",
  "Converters",
  "US",
  "Australia",
  "Switzerland",
] as const;

/**
 * Flags shown before the country-category headings in the
 * homepage directory (the US, Australia and Switzerland tools
 * sit under their country names; the UK groups sit under the
 * homepage's "The calculators 🇬🇧" heading).
 */
export const CATEGORY_FLAGS: Record<string, string> = {
  US: "🇺🇸",
  Australia: "🇦🇺",
  Switzerland: "🇨🇭",
};

/** Shared with the homepage directory (its original home). */
export const CATEGORY_BY_HREF: Record<string, string> = {
  "/ssp-calculator": "Pay & Salary",
  "/notice-period-calculator": "Business Tools",
  "/pro-rata-salary-calculator": "Pay & Salary",
  "/employer-national-insurance-calculator": "Business Tools",
  "/employer-cost-calculator": "Business Tools",
  "/nhs-maternity-pay-calculator": "Family & Baby",
  "/nhs-pay-calculator": "Pay & Salary",
  "/teaching-pay-calculator": "Pay & Salary",
  "/nhs-annual-leave-calculator": "Pay & Salary",
  "/paternity-pay-calculator": "Family & Baby",
  "/maternity-pay-calculator": "Family & Baby",
  "/shared-parental-leave-calculator": "Family & Baby",
  "/redundancy-pay-calculator": "Pay & Salary",
  "/holiday-pay-calculator": "Pay & Salary",
  "/40k-after-tax-uk": "Pay & Salary",
  "/pay-rise-calculator": "Pay & Salary",
  "/payslip-calculator": "Pay & Salary",
  "/reverse-salary-calculator": "Pay & Salary",
  "/payslip-generator": "Pay & Salary",
  "/salary-sacrifice-calculator": "Pay & Salary",
  "/student-loan-repayment-calculator": "Pay & Salary",
  "/umbrella-company-calculator": "Business Tools",
  "/capital-gains-tax-calculator": "Tax & HMRC",
  "/hmrc-tax-code-checker": "Tax & HMRC",
  "/marriage-allowance-calculator": "Tax & HMRC",
  "/side-hustle-tax-calculator-uk": "Tax & HMRC",
  "/second-job-tax-calculator": "Tax & HMRC",
  "/salary-comparison-calculator": "Pay & Salary",
  "/dividend-tax-calculator": "Tax & HMRC",
  "/corporation-tax-calculator": "Tax & HMRC",
  "/day-rate-calculator": "Pay & Salary",
  "/free-invoice-generator-uk": "Business Tools",
  "/annual-leave-calculator": "Pay & Salary",
  "/pro-rata-holiday-calculator": "Pay & Salary",
  "/term-time-pay-calculator": "Pay & Salary",
  "/overtime-calculator": "Pay & Salary",
  "/hourly-rate-converter": "Pay & Salary",
  "/ir35-calculator": "Business Tools",
  "/vat-calculator": "Tax & HMRC",
  "/annuity-calculator": "Money & Finance",
  "/childcare-calculator": "Family & Baby",
  "/adjusted-net-income-calculator": "Tax & HMRC",
  "/tapered-annual-allowance-calculator": "Tax & HMRC",
  "/pension-drawdown-calculator": "Money & Finance",
  "/cms-calculator": "Family & Baby",
  "/stone-to-kg-converter": "Converters",
  "/kg-to-stone-converter": "Converters",
  "/miles-to-km-converter": "Converters",
  "/cm-to-inches-converter": "Converters",
  "/litres-to-gallons-converter": "Converters",
};

/**
 * The related-calculators web (22 Nov 2026): every tool page ends
 * with the standard RelatedCalculators block linking the 3–4
 * tools a visitor to that page is most likely to need next —
 * leave tools to leave tools, converters to converters, employer
 * tools to employer tools. Hand-picked per tool; titles, icons
 * and categories are read from TOOLS_INDEX at render time, so
 * this map only ever holds hrefs.
 */
export const RELATED_BY_HREF: Record<string, string[]> = {
  "/ssp-calculator": [
    "/annual-leave-calculator",
    "/pro-rata-salary-calculator",
    "/holiday-pay-calculator",
    "/employer-cost-calculator",
  ],
  "/notice-period-calculator": [
    "/redundancy-pay-calculator",
    "/employer-cost-calculator",
    "/annual-leave-calculator",
    "/pro-rata-salary-calculator",
  ],
  "/pro-rata-salary-calculator": [
    "/pro-rata-holiday-calculator",
    "/hourly-rate-converter",
    "/term-time-pay-calculator",
    "/annual-leave-calculator",
  ],
  "/employer-national-insurance-calculator": [
    "/employer-cost-calculator",
    "/payslip-generator",
    "/ssp-calculator",
    "/umbrella-company-calculator",
  ],
  "/employer-cost-calculator": [
    "/employer-national-insurance-calculator",
    "/ssp-calculator",
    "/redundancy-pay-calculator",
    "/payslip-generator",
  ],
  "/nhs-maternity-pay-calculator": [
    "/maternity-pay-calculator",
    "/nhs-pay-calculator",
    "/nhs-annual-leave-calculator",
    "/paternity-pay-calculator",
  ],
  "/nhs-pay-calculator": [
    "/nhs-annual-leave-calculator",
    "/nhs-maternity-pay-calculator",
    "/teaching-pay-calculator",
    "/pay-rise-calculator",
  ],
  "/teaching-pay-calculator": [
    "/term-time-pay-calculator",
    "/nhs-pay-calculator",
    "/student-loan-repayment-calculator",
    "/pay-rise-calculator",
  ],
  "/nhs-annual-leave-calculator": [
    "/annual-leave-calculator",
    "/nhs-pay-calculator",
    "/nhs-maternity-pay-calculator",
    "/pro-rata-holiday-calculator",
  ],
  "/paternity-pay-calculator": [
    "/maternity-pay-calculator",
    "/shared-parental-leave-calculator",
    "/nhs-maternity-pay-calculator",
    "/childcare-calculator",
    "/cms-calculator",
  ],
  "/maternity-pay-calculator": [
    "/paternity-pay-calculator",
    "/shared-parental-leave-calculator",
    "/nhs-maternity-pay-calculator",
    "/childcare-calculator",
    "/annual-leave-calculator",
  ],
  "/shared-parental-leave-calculator": [
    "/maternity-pay-calculator",
    "/paternity-pay-calculator",
    "/childcare-calculator",
    "/adjusted-net-income-calculator",
  ],
  "/redundancy-pay-calculator": [
    "/notice-period-calculator",
    "/employer-cost-calculator",
    "/40k-after-tax-uk",
    "/ssp-calculator",
  ],
  "/holiday-pay-calculator": [
    "/annual-leave-calculator",
    "/pro-rata-holiday-calculator",
    "/overtime-calculator",
    "/ssp-calculator",
  ],
  "/40k-after-tax-uk": [
    "/payslip-calculator",
    "/marriage-allowance-calculator",
    "/hmrc-tax-code-checker",
    "/hourly-rate-converter",
    "/reverse-salary-calculator",
  ],
  "/pay-rise-calculator": [
    "/40k-after-tax-uk",
    "/payslip-calculator",
    "/salary-sacrifice-calculator",
    "/overtime-calculator",
    "/reverse-salary-calculator",
    "/salary-comparison-calculator",
  ],
  "/payslip-calculator": [
    "/payslip-generator",
    "/40k-after-tax-uk",
    "/hmrc-tax-code-checker",
    "/marriage-allowance-calculator",
    "/reverse-salary-calculator",
    "/second-job-tax-calculator",
  ],
  "/reverse-salary-calculator": [
    "/payslip-calculator",
    "/pro-rata-salary-calculator",
    "/salary-sacrifice-calculator",
    "/hourly-rate-converter",
    "/40k-after-tax-uk",
    "/salary-comparison-calculator",
  ],
  "/payslip-generator": [
    "/payslip-calculator",
    "/employer-cost-calculator",
    "/employer-national-insurance-calculator",
    "/40k-after-tax-uk",
    "/free-invoice-generator-uk",
  ],
  "/salary-sacrifice-calculator": [
    "/pension-drawdown-calculator",
    "/payslip-calculator",
    "/40k-after-tax-uk",
    "/pay-rise-calculator",
    "/salary-comparison-calculator",
  ],
  "/student-loan-repayment-calculator": [
    "/40k-after-tax-uk",
    "/teaching-pay-calculator",
    "/payslip-calculator",
    "/salary-sacrifice-calculator",
    "/salary-comparison-calculator",
  ],
  "/umbrella-company-calculator": [
    "/ir35-calculator",
    "/employer-cost-calculator",
    "/day-rate-calculator",
    "/hourly-rate-converter",
    "/dividend-tax-calculator",
  ],
  "/capital-gains-tax-calculator": [
    "/vat-calculator",
    "/annuity-calculator",
    "/pension-drawdown-calculator",
    "/hmrc-tax-code-checker",
  ],
  "/hmrc-tax-code-checker": [
    "/payslip-calculator",
    "/40k-after-tax-uk",
    "/pay-rise-calculator",
    "/marriage-allowance-calculator",
    "/second-job-tax-calculator",
  ],
  "/annual-leave-calculator": [
    "/pro-rata-holiday-calculator",
    "/holiday-pay-calculator",
    "/nhs-annual-leave-calculator",
    "/ssp-calculator",
  ],
  "/pro-rata-holiday-calculator": [
    "/annual-leave-calculator",
    "/holiday-pay-calculator",
    "/pro-rata-salary-calculator",
    "/term-time-pay-calculator",
  ],
  "/term-time-pay-calculator": [
    "/teaching-pay-calculator",
    "/pro-rata-salary-calculator",
    "/pro-rata-holiday-calculator",
    "/annual-leave-calculator",
  ],
  "/overtime-calculator": [
    "/hourly-rate-converter",
    "/holiday-pay-calculator",
    "/pay-rise-calculator",
    "/pro-rata-salary-calculator",
  ],
  "/hourly-rate-converter": [
    "/overtime-calculator",
    "/pro-rata-salary-calculator",
    "/40k-after-tax-uk",
    "/day-rate-calculator",
  ],
  "/ir35-calculator": [
    "/umbrella-company-calculator",
    "/vat-calculator",
    "/day-rate-calculator",
    "/employer-cost-calculator",
    "/side-hustle-tax-calculator-uk",
    "/dividend-tax-calculator",
  ],
  "/vat-calculator": [
    "/capital-gains-tax-calculator",
    "/ir35-calculator",
    "/umbrella-company-calculator",
    "/employer-cost-calculator",
    "/free-invoice-generator-uk",
  ],
  "/annuity-calculator": [
    "/pension-drawdown-calculator",
    "/salary-sacrifice-calculator",
    "/capital-gains-tax-calculator",
  ],
  "/childcare-calculator": [
    "/cms-calculator",
    "/maternity-pay-calculator",
    "/paternity-pay-calculator",
    "/term-time-pay-calculator",
  ],
  "/adjusted-net-income-calculator": [
    "/tapered-annual-allowance-calculator",
    "/childcare-calculator",
    "/salary-sacrifice-calculator",
    "/40k-after-tax-uk",
    "/pension-drawdown-calculator",
  ],
  "/tapered-annual-allowance-calculator": [
    "/adjusted-net-income-calculator",
    "/pension-drawdown-calculator",
    "/salary-sacrifice-calculator",
    "/annuity-calculator",
  ],
  "/pension-drawdown-calculator": [
    "/annuity-calculator",
    "/salary-sacrifice-calculator",
    "/capital-gains-tax-calculator",
  ],
  "/cms-calculator": [
    "/childcare-calculator",
    "/maternity-pay-calculator",
    "/paternity-pay-calculator",
    "/40k-after-tax-uk",
  ],
  "/stone-to-kg-converter": [
    "/kg-to-stone-converter",
    "/cm-to-inches-converter",
    "/miles-to-km-converter",
    "/litres-to-gallons-converter",
  ],
  "/kg-to-stone-converter": [
    "/stone-to-kg-converter",
    "/cm-to-inches-converter",
    "/miles-to-km-converter",
    "/litres-to-gallons-converter",
  ],
  "/miles-to-km-converter": [
    "/litres-to-gallons-converter",
    "/cm-to-inches-converter",
    "/kg-to-stone-converter",
    "/stone-to-kg-converter",
  ],
  "/cm-to-inches-converter": [
    "/kg-to-stone-converter",
    "/stone-to-kg-converter",
    "/miles-to-km-converter",
    "/litres-to-gallons-converter",
  ],
  "/litres-to-gallons-converter": [
    "/miles-to-km-converter",
    "/cm-to-inches-converter",
    "/stone-to-kg-converter",
    "/kg-to-stone-converter",
  ],
  "/us/texas-paycheck-calculator": [
    "/us/ohio-paycheck-calculator",
    "/us/colorado-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
  ],
  "/us/ohio-paycheck-calculator": [
    "/us/texas-paycheck-calculator",
    "/us/colorado-paycheck-calculator",
    "/40k-after-tax-uk",
    "/salary-calculator-switzerland",
  ],
  "/us/colorado-paycheck-calculator": [
    "/us/texas-paycheck-calculator",
    "/us/ohio-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
  ],
  "/us/arizona-paycheck-calculator": [
    "/us/colorado-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/florida-paycheck-calculator": [
    "/us/texas-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/illinois-paycheck-calculator": [
    "/us/ohio-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/north-carolina-paycheck-calculator": [
    "/us/florida-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/pennsylvania-paycheck-calculator": [
    "/us/new-jersey-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/new-jersey-paycheck-calculator": [
    "/us/pennsylvania-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/us/oregon-paycheck-calculator": [
    "/us/colorado-paycheck-calculator",
    "/40k-after-tax-uk",
    "/au/tax-rate-calculator",
    "/salary-calculator-switzerland",
  ],
  "/au/tax-rate-calculator": [
    "/40k-after-tax-uk",
    "/us/texas-paycheck-calculator",
    "/us/ohio-paycheck-calculator",
    "/salary-calculator-switzerland",
  ],
  "/salary-calculator-switzerland": [
    "/us/texas-paycheck-calculator",
    "/us/ohio-paycheck-calculator",
    "/au/tax-rate-calculator",
    "/40k-after-tax-uk",
  ],
  "/day-rate-calculator": [
    "/ir35-calculator",
    "/umbrella-company-calculator",
    "/hourly-rate-converter",
    "/employer-cost-calculator",
    "/free-invoice-generator-uk",
    "/side-hustle-tax-calculator-uk",
  ],
  "/free-invoice-generator-uk": [
    "/payslip-generator",
    "/vat-calculator",
    "/day-rate-calculator",
    "/umbrella-company-calculator",
    "/side-hustle-tax-calculator-uk",
  ],
  "/marriage-allowance-calculator": [
    "/hmrc-tax-code-checker",
    "/payslip-calculator",
    "/40k-after-tax-uk",
    "/salary-sacrifice-calculator",
  ],
  "/side-hustle-tax-calculator-uk": [
    "/day-rate-calculator",
    "/free-invoice-generator-uk",
    "/ir35-calculator",
    "/hmrc-tax-code-checker",
    "/second-job-tax-calculator",
  ],
  "/second-job-tax-calculator": [
    "/side-hustle-tax-calculator-uk",
    "/hmrc-tax-code-checker",
    "/payslip-calculator",
    "/student-loan-repayment-calculator",
    "/salary-sacrifice-calculator",
    "/reverse-salary-calculator",
    "/salary-comparison-calculator",
    "/dividend-tax-calculator",
  ],
  "/salary-comparison-calculator": [
    "/second-job-tax-calculator",
    "/pay-rise-calculator",
    "/reverse-salary-calculator",
    "/payslip-calculator",
    "/salary-sacrifice-calculator",
    "/student-loan-repayment-calculator",
  ],
  "/dividend-tax-calculator": [
    "/corporation-tax-calculator",
    "/salary-sacrifice-calculator",
    "/ir35-calculator",
    "/umbrella-company-calculator",
    "/hmrc-tax-code-checker",
    "/student-loan-repayment-calculator",
  ],
  "/corporation-tax-calculator": [
    "/dividend-tax-calculator",
    "/ir35-calculator",
    "/employer-cost-calculator",
    "/salary-sacrifice-calculator",
  ],
};

const KEYWORDS_BY_HREF: Record<string, string> = {
  "/ssp-calculator": "statutory sick pay sick leave sick note fit note",
  "/notice-period-calculator": "notice resignation dismissal redundancy notice",
  "/pro-rata-salary-calculator": "part time pro rata salary fte",
  "/employer-national-insurance-calculator": "employer ni national insurance contributions secondary",
  "/employer-cost-calculator": "cost of employing staff employer cost total employment cost",
  "/nhs-maternity-pay-calculator": "nhs maternity occupational pay omp agenda for change",
  "/nhs-pay-calculator": "nhs pay bands agenda for change salary spine point",
  "/nhs-annual-leave-calculator": "nhs annual leave holiday entitlement agenda for change hours days pro rata",
  "/teaching-pay-calculator": "teacher pay teaching salary take home stpcd pay point tlr sen teachers pension",
  "/paternity-pay-calculator": "statutory paternity pay spp partner leave",
  "/maternity-pay-calculator": "statutory maternity pay smp maternity leave",
  "/shared-parental-leave-calculator": "shared parental leave shpp shared parental pay spl blocks partner curtail maternity split leave",
  "/redundancy-pay-calculator": "statutory redundancy pay severance laid off",
  "/holiday-pay-calculator": "holiday pay rolled up accrued leave pay",
  "/40k-after-tax-uk": "take home pay after tax net salary 40k after tax",
  "/pay-rise-calculator": "pay rise salary increase raise promotion new salary after tax",
  "/payslip-calculator": "payslip calculator pay slip deductions check",
  "/reverse-salary-calculator": "required salary calculator reverse salary calculator net to gross salary needed take home target lifestyle budget",
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
  "/day-rate-calculator": "day rate contractor daily rate salary equivalent freelance interim",
  "/free-invoice-generator-uk": "invoice generator free uk invoice maker vat cis sole trader freelancer pdf bill",
  "/marriage-allowance-calculator": "marriage allowance married couples tax allowance transfer 1260 save 252",
  "/side-hustle-tax-calculator-uk": "side hustle tax calculator second income trading allowance self employed extra income etsy vinted freelance self assessment",
  "/second-job-tax-calculator": "second job tax calculator two jobs tax calculator two job salary calculator second job tax br code d0 national insurance per job two incomes take home",
  "/salary-comparison-calculator": "salary comparison calculator compare two salaries salary comparison compare salaries after tax job offer comparison take home difference keep percentage marginal tax rate 60% tax trap total reward employer pension part time hourly",
  "/dividend-tax-calculator": "dividend tax calculator uk dividend tax calculator tax on dividends dividend allowance 500 salary vs dividends director salary dividend optimiser best salary dividend mix limited company take home self assessment set aside",
  "/corporation-tax-calculator": "corporation tax calculator uk corporation tax calculator limited company tax calculator ltd company tax marginal relief small profits rate 19% 25% associated companies taxable profit builder ct600 deadline pay corporation tax",
  "/ir35-calculator": "ir35 off payroll contractor status",
  "/vat-calculator": "vat value added tax add remove 20%",
  "/annuity-calculator": "annuity pension income retirement",
  "/adjusted-net-income-calculator": "adjusted net income ani 100k tax trap child benefit charge personal allowance grossed up pension gift aid",
  "/tapered-annual-allowance-calculator": "tapered annual allowance pension taper threshold income adjusted income carry forward mpaa high earner pension tax",
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
  "/us/colorado-paycheck-calculator": "colorado paycheck take home salary denver famli us",
  "/us/arizona-paycheck-calculator": "arizona paycheck take home salary phoenix us",
  "/us/florida-paycheck-calculator": "florida paycheck take home salary no state tax us",
  "/us/illinois-paycheck-calculator": "illinois paycheck take home salary chicago us",
  "/us/north-carolina-paycheck-calculator": "north carolina nc paycheck take home salary us",
  "/us/pennsylvania-paycheck-calculator": "pennsylvania pa paycheck take home salary philadelphia eit us",
  "/us/new-jersey-paycheck-calculator": "new jersey nj paycheck take home salary us",
  "/us/oregon-paycheck-calculator": "oregon paycheck take home salary portland paid leave us",
  "/au/tax-rate-calculator": "australia tax rate ato take home",
  "/salary-calculator-switzerland":
    "switzerland salary net gross tax canton zurich zug",
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
  if (flag === "🇨🇭") return "Switzerland";
  if (CATEGORY_BY_HREF[href]) return CATEGORY_BY_HREF[href];
  if (href.includes("converter")) return "Converters";
  return "Pay & Salary";
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
