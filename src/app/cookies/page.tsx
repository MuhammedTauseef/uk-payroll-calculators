import { pageMetadata } from "@/utils/metadata";

export const metadata = pageMetadata(
  "/cookies",
  "Cookie Policy",
  "UK Payroll Calculators' cookie policy: the strictly necessary cookies the site uses, Google Analytics, and how to control cookies.",
);

export default function CookiesPage() {
  return (
    <div className="space-y-10">
      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Cookie Policy
        </h1>
        <p className="max-w-2xl text-sm text-slate-500 dark:text-slate-400">
          Last updated: 8 November 2026.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          What cookies are
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Cookies are small text files that a website asks your browser
          to store on your device. They let a site remember things
          between pages and visits — for example, that someone is signed
          in, or that a visit is a returning visit rather than a new one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Strictly necessary cookies
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          Our host sets cookies that the site needs in order to work and
          stay secure — delivering pages and protecting the site from
          abuse. The site&apos;s admin area also uses sign-in session
          cookies, but only for the people who run the site; ordinary
          visitors never receive them.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Analytics cookies
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          We use Google Analytics (GA4) to count visits and see which
          pages are used, in aggregate. It sets cookies such as _ga for
          that purpose. Google Analytics never sees the figures typed
          into the calculators — those stay in your browser and are not
          sent anywhere by this site.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Advertising cookies
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          The site currently shows no adverts and sets no advertising
          cookies. If that changes, this page and the privacy policy will
          be updated first, before the change goes live. Advertising
          partners, including Google, may then use cookies to serve ads
          based on your prior visits to this and other sites, and you
          will be able to opt out of personalised advertising at{" "}
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
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Controlling cookies
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          You can block or delete cookies in your browser&apos;s
          settings; the calculators keep working, because they run
          entirely on your device. To opt out of Google Analytics
          specifically, Google provides an Analytics opt-out add-on for
          desktop browsers.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Changes to this policy
        </h2>
        <p className="max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
          If the cookies this site uses change, this page will be
          updated, and the date at the top will change with it.
        </p>
      </section>
    </div>
  );
}
