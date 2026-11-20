/**
 * Centralised application configuration.
 *
 * Modelled on the AppConfig convention from ixartz/Next-js-Boilerplate
 * (MIT licence — see the LICENSE file in the project root), stripped of
 * its Clerk and i18n parts: this site is single-locale and has no
 * accounts, no database and no external services.
 */
export const AppConfig = {
  name: "UK Payroll Calculators",
  // Production origin (custom domain payrollcalc.co.uk, since 15 Nov 2026). Used by the
  // sitemap and robots files — update here if the domain ever changes.
  siteUrl: "https://payrollcalc.co.uk",
  tagline: "Free UK employer & payroll calculators",
  description:
    "Free UK payroll calculators: SSP, notice period, pro-rata salary, employer NI, NHS maternity pay, maternity pay, NHS pay, paternity pay, redundancy pay, holiday pay, take-home pay, a payslip generator, a payslip calculator, a tax code checker, an annual leave calculator, a pro-rata holiday calculator, a term-time pay calculator, a salary sacrifice calculator, a student loan repayment calculator, an umbrella company calculator, a capital gains tax calculator, an overtime calculator, an hourly rate converter, an IR35 calculator, a VAT calculator, a CMS child maintenance calculator, an annuity calculator, a childcare calculator, a pension drawdown calculator, and five unit converters — stone to kg, kg to stone, miles to km, cm to inches and litres to gallons — April 2026 rules.",
  locale: "en-GB",
  nav: [
    { href: "/", label: "Home", icon: "🏠", flag: "" },
    { href: "/ssp-calculator", label: "SSP Calculator", icon: "🤒", flag: "🇬🇧" },
    {
      href: "/notice-period-calculator",
      label: "Notice Period Calculator",
      icon: "📩",
      flag: "🇬🇧",
    },
    {
      href: "/pro-rata-salary-calculator",
      label: "Pro-Rata Salary",
      icon: "⚖️",
      flag: "🇬🇧",
    },
    {
      href: "/employer-national-insurance-calculator",
      label: "Employer NI",
      icon: "🛡️",
      flag: "🇬🇧",
    },
    {
      href: "/employer-cost-calculator",
      label: "Employer Cost",
      icon: "💷",
      flag: "🇬🇧",
    },
    {
      href: "/nhs-maternity-pay-calculator",
      label: "Maternity Pay",
      icon: "🤰",
      flag: "🇬🇧",
    },
    {
      href: "/nhs-pay-calculator",
      label: "NHS Pay",
      icon: "🏥",
      flag: "🇬🇧",
    },
    { href: "/vat-calculator", label: "VAT Calculator", icon: "🧮", flag: "🇬🇧" },
    { href: "/cms-calculator", label: "CMS Calculator", icon: "👨‍👧", flag: "🇬🇧" },
    { href: "/annuity-calculator", label: "Annuity Calculator", icon: "🏦", flag: "🇬🇧" },
    { href: "/childcare-calculator", label: "Childcare Calculator", icon: "🧸", flag: "🇬🇧" },
    { href: "/pension-drawdown-calculator", label: "Pension Drawdown", icon: "📉", flag: "🇬🇧" },
    {
      href: "/paternity-pay-calculator",
      label: "Paternity Pay",
      icon: "👨‍🍼",
      flag: "🇬🇧",
    },
    {
      href: "/maternity-pay-calculator",
      label: "Maternity Pay",
      icon: "🤱",
      flag: "🇬🇧",
    },
    {
      href: "/redundancy-pay-calculator",
      label: "Redundancy Pay",
      icon: "💼",
      flag: "🇬🇧",
    },
    {
      href: "/holiday-pay-calculator",
      label: "Holiday Pay",
      icon: "🏖️",
      flag: "🇬🇧",
    },
    { href: "/40k-after-tax-uk", label: "Take-Home Pay", icon: "💰", flag: "🇬🇧" },
    { href: "/payslip-calculator", label: "Payslip Calculator", icon: "🧮", flag: "🇬🇧" },
    { href: "/payslip-generator", label: "Payslip Generator", icon: "🧾", flag: "🇬🇧" },
    {
      href: "/salary-sacrifice-calculator",
      label: "Salary Sacrifice",
      icon: "🐷",
      flag: "🇬🇧",
    },
    {
      href: "/student-loan-repayment-calculator",
      label: "Student Loan Repayments",
      icon: "🎓",
      flag: "🇬🇧",
    },
    {
      href: "/umbrella-company-calculator",
      label: "Umbrella Company",
      icon: "☂️",
      flag: "🇬🇧",
    },
    {
      href: "/capital-gains-tax-calculator",
      label: "Capital Gains Tax",
      icon: "📈",
      flag: "🇬🇧",
    },
    { href: "/hmrc-tax-code-checker", label: "Tax Code Checker", icon: "🏷️", flag: "🇬🇧" },
    { href: "/annual-leave-calculator", label: "Annual Leave", icon: "🌴", flag: "🇬🇧" },
    {
      href: "/pro-rata-holiday-calculator",
      label: "Pro Rata Holiday",
      icon: "🗓️",
      flag: "🇬🇧",
    },
    {
      href: "/term-time-pay-calculator",
      label: "Term Time Pay",
      icon: "🎓",
      flag: "🇬🇧",
    },
    { href: "/overtime-calculator", label: "Overtime", icon: "⏰", flag: "🇬🇧" },
    {
      href: "/hourly-rate-converter",
      label: "Hourly Rate Converter",
      icon: "🔁",
      flag: "🇬🇧",
    },
    {
      href: "/stone-to-kg-converter",
      label: "Stone to Kg Converter",
      icon: "⚖️",
      flag: "🇬🇧",
    },
    {
      href: "/kg-to-stone-converter",
      label: "Kg to Stone Converter",
      icon: "⚖️",
      flag: "🇬🇧",
    },
    {
      href: "/miles-to-km-converter",
      label: "Miles to Km Converter",
      icon: "🛣️",
      flag: "🇬🇧",
    },
    {
      href: "/cm-to-inches-converter",
      label: "Cm to Inches Converter",
      icon: "📏",
      flag: "🇬🇧",
    },
    {
      href: "/litres-to-gallons-converter",
      label: "Litres to Gallons Converter",
      icon: "⛽",
      flag: "🇬🇧",
    },
    { href: "/ir35-calculator", label: "IR35 Calculator", icon: "💼", flag: "🇬🇧" },
    {
      href: "/us/texas-paycheck-calculator",
      label: "Texas Paycheck",
      icon: "🤠",
      flag: "🇺🇸",
    },
    {
      href: "/us/ohio-paycheck-calculator",
      label: "Ohio Paycheck",
      icon: "🌰",
      flag: "🇺🇸",
    },
    {
      href: "/au/tax-rate-calculator",
      label: "AU Tax Rate",
      icon: "🦘",
      flag: "🇦🇺",
    },
    { href: "/blog", label: "Blog", icon: "📰", flag: "" },
  ],
  guides: [
    {
      href: "/best-hr-software-for-small-business-uk",
      label: "Best HR Software for Small Business UK",
    },
    { href: "/what-is-statutory-sick-pay", label: "What is Statutory Sick Pay?" },
    {
      href: "/how-much-is-statutory-sick-pay",
      label: "How much is Statutory Sick Pay?",
    },
    { href: "/ssp-rate", label: "SSP Rate" },
    { href: "/how-much-is-ssp-per-week", label: "How much is SSP per week?" },
    { href: "/how-is-ssp-calculated", label: "How is SSP calculated?" },
  ],
  siteLinks: [
    { href: "/about", label: "About" },
    { href: "/methodology", label: "Methodology" },
    { href: "/editorial-policy", label: "Editorial Policy" },
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/unsubscribe", label: "Unsubscribe" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};
