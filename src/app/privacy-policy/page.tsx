import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/privacy-policy",
  "Privacy Policy",
  "The privacy position of UK Payroll Calculators in plain English: the calculators run in your browser, there are no accounts, and the site does not collect or store the numbers you enter.",
);

export default function PrivacyPolicyPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The short version: this site has no accounts and no forms that
          send your figures anywhere. Every calculation happens in your
          own browser, and the numbers you type in are never collected,
          stored or shared by this site.
        </p>
        <p className="max-w-2xl text-sm text-slate-500">
          Last updated: 7 November 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Calculations happen on your device
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Each calculator does its maths locally, in the browser on your
          phone or computer, the moment you type. The pay figures, dates
          and other numbers you enter are not transmitted to us and are
          not saved anywhere by this site — when you close the page, they
          are gone. The &ldquo;Print / save this result&rdquo; buttons
          simply open your own browser&apos;s print view.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          No accounts, no tracking cookies
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          There is nothing to sign up for and no sign-in. The site itself
          sets no tracking cookies and runs no advertising or visitor
          profiling. If that ever changes — for example, if privacy-first
          analytics are added — this page will be updated first, before
          the change goes live.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Hosting and server logs
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          The site is hosted by Vercel. Like every web host, Vercel keeps
          standard server logs of requests (such as the page requested,
          the time, and the visitor&apos;s IP address) so it can deliver
          the site and protect it from abuse. Those logs are the
          host&apos;s operational records; we do not use them to identify
          or profile visitors.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900">
          Links to other websites
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700">
          Pages here link to official guidance on GOV.UK. Once you follow
          a link and leave this site, that website&apos;s own privacy
          policy applies to anything you do there.
        </p>
      </section>
    </div>
  );
}
