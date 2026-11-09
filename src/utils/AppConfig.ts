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
  // Production origin (Vercel subdomain; no custom domain). Used by the
  // sitemap and robots files — update here if the domain ever changes.
  siteUrl: "https://uk-payroll-calculators.vercel.app",
  tagline: "Free UK employer & payroll calculators",
  description:
    "Free UK payroll calculators: SSP, notice period, pro-rata salary, employer NI, NHS maternity pay, paternity pay, take-home pay, a payslip generator, a tax code checker, an annual leave calculator, an overtime calculator and an IR35 calculator — April 2026 rules.",
  locale: "en-GB",
  nav: [
    { href: "/", label: "Home" },
    { href: "/ssp-calculator", label: "SSP Calculator" },
    { href: "/notice-period-calculator", label: "Notice Period Calculator" },
    { href: "/pro-rata-salary-calculator", label: "Pro-Rata Salary" },
    {
      href: "/employer-national-insurance-calculator",
      label: "Employer NI",
    },
    {
      href: "/nhs-maternity-pay-calculator",
      label: "Maternity Pay",
    },
    { href: "/paternity-pay-calculator", label: "Paternity Pay" },
    { href: "/40k-after-tax-uk", label: "Take-Home Pay" },
    { href: "/payslip-generator", label: "Payslip Generator" },
    { href: "/hmrc-tax-code-checker", label: "Tax Code Checker" },
    { href: "/annual-leave-calculator", label: "Annual Leave" },
    { href: "/overtime-calculator", label: "Overtime" },
    { href: "/ir35-calculator", label: "IR35 Calculator" },
    { href: "/blog", label: "Blog" },
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
    { href: "/contact", label: "Contact" },
    { href: "/blog", label: "Blog" },
    { href: "/privacy-policy", label: "Privacy Policy" },
    { href: "/cookies", label: "Cookie Policy" },
    { href: "/terms", label: "Terms of Use" },
    { href: "/disclaimer", label: "Disclaimer" },
  ],
};
