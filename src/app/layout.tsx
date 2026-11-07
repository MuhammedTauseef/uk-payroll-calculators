import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "@/styles/global.css";
import { BaseTemplate } from "@/templates/BaseTemplate";
import SiteNav from "@/components/SiteNav";
import MobileNav from "@/components/MobileNav";
import { AppConfig } from "@/utils/AppConfig";
import { RATES_RULES_LABEL } from "@/lib/rates";

const GA_MEASUREMENT_ID = "G-0R7G7GZ0CK";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(AppConfig.siteUrl),
  title: {
    default: `${AppConfig.name} — UK employer & payroll calculators`,
    template: `%s | ${AppConfig.name}`,
  },
  description: AppConfig.description,
  verification: {
    google: "OqzJ7p9A53jE79MV7_VOsJqKOAMiv0dQy4S957lDxpU",
  },
  icons: {
    icon: [
      {
        url: "/favicon.ico",
        type: "image/x-icon",
        sizes: "16x16 24x24 32x32 48x48 64x64",
      },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    siteName: AppConfig.name,
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en-GB" className={inter.variable}>
      <body>
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
        <BaseTemplate
          leftNav={<SiteNav />}
          mobileNav={<MobileNav />}
          rightNav={
            <Link
              href="/ssp-calculator"
              className="flex min-h-9 items-center rounded-full bg-brand-700 px-3 text-[13px] font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-brand-800 lg:min-h-0 lg:px-4 lg:py-2 lg:text-sm"
            >
              <span className="lg:hidden">Try SSP</span>
              <span className="hidden lg:inline">Try the SSP calculator</span>
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
