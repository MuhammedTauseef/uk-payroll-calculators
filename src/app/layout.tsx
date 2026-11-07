import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import "@/styles/global.css";
import { BaseTemplate } from "@/templates/BaseTemplate";
import SiteNav from "@/components/SiteNav";
import { AppConfig } from "@/utils/AppConfig";
import { RATES_RULES_LABEL } from "@/lib/rates";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${AppConfig.name} — UK employer & payroll calculators`,
    template: `%s | ${AppConfig.name}`,
  },
  description: AppConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>
        <BaseTemplate
          leftNav={<SiteNav />}
          rightNav={
            <Link
              href="/ssp-calculator"
              className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800"
            >
              Try the SSP calculator
            </Link>
          }
          footerNote={
            <p>
              This site provides general guidance only, based on the{" "}
              {RATES_RULES_LABEL.charAt(0).toLowerCase() +
                RATES_RULES_LABEL.slice(1)}
              . It is not affiliated with GOV.UK or HMRC. Always check the
              official guidance on GOV.UK for your specific circumstances.
            </p>
          }
        >
          {children}
        </BaseTemplate>
      </body>
    </html>
  );
}
