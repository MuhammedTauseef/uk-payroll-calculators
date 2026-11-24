import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Link from "next/link";
import Script from "next/script";
import "@/styles/global.css";
import { BaseTemplate } from "@/templates/BaseTemplate";
import SiteNav from "@/components/SiteNav";
import MobileNav from "@/components/MobileNav";
import SiteSearch from "@/components/SiteSearch";
import ThemeToggle from "@/components/ThemeToggle";
import FooterNote from "@/components/FooterNote";
import PageSchema from "@/components/PageSchema";
import { AppConfig } from "@/utils/AppConfig";

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
    <html lang="en-GB" className={inter.variable} suppressHydrationWarning>
      <body>
        {/* Theme init — must run before first paint to avoid a flash
            of the wrong theme: saved localStorage choice wins, else
            the visitor's system preference. The header ThemeToggle
            owns the class after this. (CSP allows inline scripts.) */}
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            try {
              var saved = localStorage.getItem('theme');
              var dark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
              document.documentElement.classList.toggle('dark', dark);
              document.documentElement.style.colorScheme = dark ? 'dark' : 'light';
            } catch (e) {}
          `}
        </Script>
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
        {/* AdSense site verification (account created 24 Nov 2026) —
            loads the adsbygoogle library only; no ad units are placed
            by this tag, ad display stays under owner control. */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-8300728790043914"
          strategy="beforeInteractive"
          crossOrigin="anonymous"
        />
        <PageSchema />
        <BaseTemplate
          leftNav={<SiteNav />}
          mobileNav={<MobileNav />}
          rightNav={
            <>
              <SiteSearch />
              <ThemeToggle />
              <Link
                href="/ssp-calculator"
              className="hidden min-h-11 items-center rounded-full bg-brand-700 px-4 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition hover:bg-brand-800 min-[480px]:flex"
            >
              {/* Short label at every width: the full "Try the SSP
                  calculator" pill made the xl header row overflow
                  (logo + 8 nav pills + CTA > container). The hero
                  button keeps the full wording. Below 480px the pill
                  yields entirely: with the Phase 3 search button the
                  header cannot hold a one-line site name plus four
                  44px controls on a 360–390px phone (BaseTemplate
                  header note). The hero button and the mobile menu
                  keep the SSP route one tap away there. */}
                <span>Try SSP</span>
              </Link>
            </>
          }
          footerNote={<FooterNote />}
        >
          {children}
        </BaseTemplate>
      </body>
    </html>
  );
}
