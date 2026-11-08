import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/privacy-policy",
  "Privacy Policy",
  "UK Payroll Calculators' privacy position in plain English: calculators run in your browser, there are no accounts, and your numbers are not collected or stored.",
);

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The short version: this site has no accounts and no forms that
          send your figures anywhere. Every calculation happens in your
          own browser, and the numbers you type in are never collected,
          stored or shared by this site.
        </p>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Last updated: 8 November 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Calculations happen on your device
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Each calculator does its maths locally, in the browser on your
          phone or computer, the moment you type. The pay figures, dates
          and other numbers you enter are not transmitted to us and are
          not saved anywhere by this site — when you close the page, they
          are gone. The &ldquo;Print / save this result&rdquo; buttons
          simply open your own browser&apos;s print view.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          No accounts
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          There is nothing to sign up for and no sign-in for visitors.
          The only sign-in on the site is the admin area used by the
          people who run it.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Analytics
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          We use Google Analytics (GA4) to count visits and see which
          pages are used, in aggregate. It sets cookies such as _ga for
          that purpose. It never receives the figures you type into the
          calculators — those stay in your browser, as the section above
          explains. You can opt out with Google&apos;s Analytics opt-out
          add-on, or by blocking cookies in your browser.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Advertising
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The site currently shows no adverts. If advertising is
          introduced later, third-party vendors, including Google, will
          use cookies to serve ads based on your prior visits to this
          and other sites, and you can opt out of personalised
          advertising at{" "}
          <a
            className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900 dark:text-slate-50 dark:decoration-slate-500 dark:hover:decoration-slate-50"
            href="https://www.google.com/settings/ads"
          >
            google.com/settings/ads
          </a>{" "}
          and{" "}
          <a
            className="font-medium text-slate-900 underline decoration-slate-400 underline-offset-4 hover:decoration-slate-900 dark:text-slate-50 dark:decoration-slate-500 dark:hover:decoration-slate-50"
            href="https://www.aboutads.info/choices"
          >
            aboutads.info/choices
          </a>
          . This page will be updated before any such change goes live.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Hosting and server logs
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The site is hosted by Vercel. Like every web host, Vercel keeps
          standard server logs of requests (such as the page requested,
          the time, and the visitor&apos;s IP address) so it can deliver
          the site and protect it from abuse. Those logs are the
          host&apos;s operational records; we do not use them to identify
          or profile visitors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Links to other websites
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Pages here link to official guidance on GOV.UK. Once you follow
          a link and leave this site, that website&apos;s own privacy
          policy applies to anything you do there.
        </p>
      </section>
    </div>
  );
}
