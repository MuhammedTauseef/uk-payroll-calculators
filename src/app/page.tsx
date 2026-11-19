import Image from "next/image";
import Link from "next/link";
import { HeroCarousel } from "@/components/HeroCarousel";
import ToolsDirectory, { type DirectoryTool } from "@/components/ToolsDirectory";
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

// ISR (7 days): only the "Latest from the blog" strip reads the database;
// admin publishes revalidate the affected paths on save
// (saveBlogPostAction → revalidatePath — there is no deploy hook), so a
// new post appears on publish — anything changed without a save shows
// within the week. Repeat hits stop re-reading blog_posts on every
// request (Vercel CPU cost, 2026-11-12).
export const revalidate = 604800;

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: AppConfig.name,
  url: AppConfig.siteUrl,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UK Payroll Calculators",
  url: "https://payrollcalc.co.uk",
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

function NhsPayIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function VatIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="8" cy="8" r="2.4" />
      <circle cx="16" cy="16" r="2.4" />
      <path d="M17.5 5.5L6.5 18.5" />
    </svg>
  );
}

function AnnuityIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 20h16M7 20v-5M11 20v-9M15 20v-7M19 20V7" />
    </svg>
  );
}

function ChildcareIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 20c.8-3.6 3.4-5.4 6.5-5.4s5.7 1.8 6.5 5.4" />
    </svg>
  );
}

function DrawdownIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 5v14h16" />
      <path d="M7 15l3.5-4 3 2.5L18 8" />
      <path d="M15.5 8H18v2.5" />
    </svg>
  );
}

function ProRataHolidayIcon() {
  return (
    <svg {...iconProps}>
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M3 10h18M8 3v4M16 3v4M8 16h5" />
    </svg>
  );
}

function TermTimeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 4L2 9l10 5 10-5-10-5z" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5" />
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

function SalarySacrificeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3v3M12 18v3M16.5 6.5c-.8-1-2.4-1.5-4.5-1.5-3 0-5 1.6-5 4 0 5.5 10 2.5 10 7 0 2.4-2 4-5 4-2.1 0-3.7-.6-4.5-1.6" />
    </svg>
  );
}

function StudentLoanIcon() {
  return (
    <svg {...iconProps}>
      <path d="M22 9L12 4 2 9l10 5 10-5z" />
      <path d="M6 11.5V16c0 1.7 2.7 3 6 3s6-1.3 6-3v-4.5M22 9v5" />
    </svg>
  );
}

function UmbrellaIcon() {
  return (
    <svg {...iconProps}>
      <path d="M12 3a9 9 0 0 1 9 9H3a9 9 0 0 1 9-9z" />
      <path d="M12 12v6a2.5 2.5 0 0 0 5 0" />
    </svg>
  );
}

function CapitalGainsIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-5 3 3 5-7" />
      <path d="M19 6h-3M19 6v3" />
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

function OhioIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 4v2.5M12 17.5V20M4 12h2.5M17.5 12H20" />
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

function CmsIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 20c.6-3.2 2.8-5 5.5-5s4.9 1.8 5.5 5" />
      <path d="M15.5 5.5h5M15.5 9.5h5M15.5 13.5h3" />
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

function ConverterIcon() {
  return (
    <svg {...iconProps}>
      <path d="M4 7h13M13 3.5L16.5 7 13 10.5" />
      <path d="M20 17H7M11 13.5L7.5 17l3.5 3.5" />
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
    href: "/nhs-pay-calculator",
    icon: <NhsPayIcon />,
    title: "NHS Pay Calculator",
    description:
      "NHS pay on the 2025/26 Agenda for Change scales for England: pick your band and pay step for annual, monthly, weekly and hourly pay, plus an estimated take-home after NHS pension, tax and NI.",
    linkText: "Open the NHS pay calculator →",
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
  {
    href: "/vat-calculator",
    icon: <VatIcon />,
    title: "VAT Calculator UK",
    description:
      "Add VAT to a net price or strip it out of a gross price at 20%, 5% or 0% — with the UK VAT rates, the manual formulas and the VAT fraction explained.",
    linkText: "Open the VAT calculator →",
  },
  {
    href: "/annuity-calculator",
    icon: <AnnuityIcon />,
    title: "Annuity Calculator UK",
    description:
      "Estimate the guaranteed income a pension pot buys at 55 to 75 — single or joint life, level or rising payments, guarantee periods — with the full annuity rate table printed, not hidden.",
    linkText: "Open the annuity calculator →",
  },
  {
    href: "/childcare-calculator",
    icon: <ChildcareIcon />,
    title: "Childcare Calculator UK",
    description:
      "Work out your Tax-Free Childcare top-up per child — up to £2,000 a year, £4,000 if disabled — what to pay in each month, and whether the £100,000 rule or the minimum-earnings check stops your claim.",
    linkText: "Open the childcare calculator →",
  },
  {
    href: "/pension-drawdown-calculator",
    icon: <DrawdownIcon />,
    title: "Pension Drawdown Calculator UK",
    description:
      "See how long your pension pot lasts in drawdown, year by year, with 2026/27 tax, the 25% tax-free amount, the State Pension alongside, and the withdrawal that lasts to 95.",
    linkText: "Open the drawdown calculator →",
  },
  {
    href: "/pro-rata-holiday-calculator",
    icon: <ProRataHolidayIcon />,
    title: "Pro Rata Holiday Calculator",
    description:
      "Holiday entitlement for part-time staff and mid-year starters or leavers: the full-time entitlement pro-rated by days worked, checked against the statutory 5.6-week floor, in days and hours.",
    linkText: "Open the pro-rata holiday calculator →",
  },
  {
    href: "/term-time-pay-calculator",
    icon: <TermTimeIcon />,
    title: "Term Time Pay Calculator",
    description:
      "Term-time-only pay from the full-time salary — working weeks plus the statutory holiday uplift most calculators miss — per year, per month and per week.",
    linkText: "Open the term-time pay calculator →",
  },
  {
    href: "/payslip-calculator",
    icon: <PayslipIcon />,
    title: "Payslip Calculator",
    description:
      "What your monthly payslip will show: gross pay, tax from your tax code, National Insurance, pension and student loan — line by line, before payday.",
    linkText: "Open the payslip calculator →",
  },
  {
    href: "/salary-sacrifice-calculator",
    icon: <SalarySacrificeIcon />,
    title: "Salary Sacrifice Calculator",
    description:
      "What sacrificing salary into a pension saves in tax AND National Insurance — the cost per £1 in the pension, and the employer NI saving on top.",
    linkText: "Open the salary sacrifice calculator →",
  },
  {
    href: "/student-loan-repayment-calculator",
    icon: <StudentLoanIcon />,
    title: "Student Loan Repayment Calculator",
    description:
      "What you repay each month and year on Plans 1, 2, 4 and 5 and the Postgraduate Loan, at the 2026/27 GOV.UK thresholds.",
    linkText: "Open the student loan calculator →",
  },
  {
    href: "/umbrella-company-calculator",
    icon: <UmbrellaIcon />,
    title: "Umbrella Company Calculator",
    description:
      "Take-home pay from the assignment rate with every deduction shown — margin, employer NI, apprenticeship levy, holiday pay, tax and NI.",
    linkText: "Open the umbrella calculator →",
  },
  {
    href: "/capital-gains-tax-calculator",
    icon: <CapitalGainsIcon />,
    title: "Capital Gains Tax Calculator",
    description:
      "The tax on a gain at the 2026/27 rates — £3,000 allowance, 18% inside the basic-rate band, 24% above — using GOV.UK's own method and examples.",
    linkText: "Open the capital gains calculator →",
  },
];

const CONVERTERS = [
  {
    href: "/stone-to-kg-converter",
    icon: <ConverterIcon />,
    title: "Stone to Kg Converter",
    description:
      "Stones and pounds into kilograms — enter both parts for the exact figure, with the formula and the full conversion table from 1 to 60 stone, half-stone combinations included.",
    linkText: "Open the stone to kg converter →",
  },
  {
    href: "/kg-to-stone-converter",
    icon: <ConverterIcon />,
    title: "Kg to Stone Converter",
    description:
      "Kilograms split into stones and pounds — 76 kg is 11 st 13.6 lb — with the formula and a kilogram-by-kilogram table from 40 to 150 kg.",
    linkText: "Open the kg to stone converter →",
  },
  {
    href: "/miles-to-km-converter",
    icon: <ConverterIcon />,
    title: "Miles to Km Converter",
    description:
      "Miles to kilometres and back again, with the 5K, 10K and marathon distances worked out and the full 1–100 mile table.",
    linkText: "Open the miles to km converter →",
  },
  {
    href: "/cm-to-inches-converter",
    icon: <ConverterIcon />,
    title: "Cm to Inches Converter",
    description:
      "Centimetres to inches — and to feet and inches for heights — with the formula and a full table from 1 to 200 cm.",
    linkText: "Open the cm to inches converter →",
  },
  {
    href: "/litres-to-gallons-converter",
    icon: <ConverterIcon />,
    title: "Litres to Gallons Converter",
    description:
      "Litres into UK imperial gallons for fuel and mpg figures — with US gallons shown separately, and the full 1–100 litre table.",
    linkText: "Open the litres to gallons converter →",
  },
];

// The all-calculators directory: every tool on the homepage in one
// searchable, chip-filtered list (the ToolsDirectory client
// component filters it entirely in the browser — the list is
// rendered into the static page, no search endpoint exists).
// Categories follow the groups the tools naturally fall into.
const CATEGORY_BY_HREF: Record<string, string> = {
  "/ssp-calculator": "Leave & Family",
  "/notice-period-calculator": "Employers & Contractors",
  "/pro-rata-salary-calculator": "Pay & Tax",
  "/employer-national-insurance-calculator": "Employers & Contractors",
  "/employer-cost-calculator": "Employers & Contractors",
  "/nhs-maternity-pay-calculator": "Leave & Family",
  "/nhs-pay-calculator": "Pay & Tax",
  "/paternity-pay-calculator": "Leave & Family",
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
};

const DIRECTORY_TOOLS: DirectoryTool[] = [
  ...CALCULATORS.map((c) => ({
    href: c.href,
    title: c.title,
    description: c.description,
    linkText: c.linkText,
    category: CATEGORY_BY_HREF[c.href] ?? "Pay & Tax",
    icon: c.icon,
  })),
  {
    href: "/cms-calculator",
    title: "CMS Calculator",
    description:
      "Child maintenance under the Child Maintenance Service: the weekly figure on the standard rates from the paying parent's gross income, for the Direct Pay and Collect & Pay arrangements.",
    linkText: "Open the CMS calculator →",
    category: "Leave & Family",
    icon: <CmsIcon />,
  },
  ...CONVERTERS.map((c) => ({
    href: c.href,
    title: c.title,
    description: c.description,
    linkText: c.linkText,
    category: "Converters",
    icon: c.icon,
  })),
  {
    href: "/us/texas-paycheck-calculator",
    title: "Texas Paycheck Calculator",
    description:
      "Net pay on a Texas salary or hourly wage under the 2026 IRS rules: federal income tax withholding, Social Security and Medicare worked out line by line — and a Texas state income tax line of exactly $0, because Texas has none.",
    linkText: "Open the Texas paycheck calculator →",
    category: "US & AU",
    icon: <TexasIcon />,
  },
  {
    href: "/us/ohio-paycheck-calculator",
    title: "Ohio Paycheck Calculator",
    description:
      "Net pay on an Ohio salary or hourly wage under the 2026 rules: federal tax and FICA, the Ohio HB 96 flat tax (0% on the first $26,050, then 2.75%), plus your city income tax and school district tax where they apply.",
    linkText: "Open the Ohio paycheck calculator →",
    category: "US & AU",
    icon: <OhioIcon />,
  },
  {
    href: "/au/tax-rate-calculator",
    title: "Australia Tax Rate Calculator",
    description:
      "Income tax and the Medicare levy on any Australian income under the ATO 2025–26 rates — your marginal and effective tax rate side by side, for residents and non-residents alike.",
    linkText: "Open the Australia tax rate calculator →",
    category: "US & AU",
    icon: <AuIcon />,
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Full-screen hero (owner order 9 Nov 2026, evening —
          "carousel full screen par show hon laptop"): the section
          breaks out of <main>'s centred max-w-6xl column to the
          full viewport width (w-[100vw] + the centring negative
          margin; global.css clips any scrollbar-width overshoot
          on body so no horizontal scrollbar can appear), the
          negative top margin cancels <main>'s py-8/sm:py-12 so
          the hero starts directly under the sticky h-16 header,
          and min-height fills most of the first screen. Reduced
          19 Nov 2026 (desktop/mobile-friendly audit): the hero no
          longer stretches to the full first screen (100svh left
          large empty bands above and below the centred copy on
          tall screens) — it is now 78svh less the header, sized
          to the copy it holds. No rounded card, no side
          margins: the carousel photos run edge to edge, with the
          copy centred over them in its own readable column. */}
      <section className="relative -mt-8 ml-[calc(50%-50vw)] flex min-h-[calc(78svh-4rem)] w-[100vw] flex-col justify-center overflow-hidden px-4 py-12 text-center sm:-mt-12 sm:px-8 sm:py-16">
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
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-slate-600 dark:text-slate-300">
          Every calculator and converter on the hub in one list —
          search by name or keyword, or filter by category. The US and
          Australia tools are in the same list, under their own chip.
        </p>
        <div className="mt-6">
          <ToolsDirectory tools={DIRECTORY_TOOLS} />
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
          {SSP_GUIDES.map((guide) => (
            // All five cards are equal half-width cards
            // (friendly-fix, 19 Nov 2026): the odd fifth card
            // used to stretch across the full row as a wide
            // feature card; it now takes a natural half-width
            // slot in the last row, like the other four.
            <Link
              key={guide.href}
              href={guide.href}
              className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
            >
              <span className="mb-4 flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-700 text-white shadow-sm">
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
          ))}
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
