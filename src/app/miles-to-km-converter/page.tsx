import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import MilesToKmConverter from "@/components/MilesToKmConverter";
import { fmt, milesToKm } from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";

export const metadata: Metadata = pageMetadata(
  "/miles-to-km-converter",
  "Miles to Km Converter — Miles to Kilometres and Back",
  "Free miles to km converter: convert miles to kilometres and kilometres to miles, with the formula, the 5K, 10K and marathon distances worked out, and a full 1–100 mile conversion table.",
);

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Table and worked examples are computed by the same function the
// converter runs, so the page can never disagree with itself.
const MILE_ROWS = Array.from({ length: 100 }, (_, i) => i + 1).map((mi) => ({
  miles: mi,
  km: milesToKm(mi),
}));
const MARATHON_KM = milesToKm(26.2);
const TEN_MILES_KM = milesToKm(10);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many km is a marathon?",
    answer:
      "A marathon is 26.2 miles, which is 42.16 km (26.2 × 1.60934 = 42.1647, so 42.16 km). The official race distance is 42.195 km — the small difference is because the marathon was standardised at 26 miles 385 yards, which is 26.22 miles rather than exactly 26.2.",
  },
  {
    question: "How do I convert miles to km quickly?",
    answer:
      "Multiply by 1.60934 for the exact figure: 10 miles is 16.09 km. For a mental estimate, multiply by 8 and divide by 5 (× 1.6) — 10 miles ≈ 16 km, which is within half a percent and fine for road signs, just not for race results.",
  },
  {
    question: "How many miles is 5K and 10K?",
    answer:
      "5K is 3.11 miles and 10K is 6.21 miles (divide kilometres by 1.60934). A parkrun 5K is therefore just over 3 miles, and a 10K is a little over 6 miles — which is why a 10-minute mile is roughly a 6-minute-13-second kilometre.",
  },
  {
    question: "Why does the UK use miles on road signs?",
    answer:
      "Because the UK never completed metrication for roads: distance signs, speed limits and speedometers stayed in miles and mph by law, while most other measurements went metric. So a UK driver converts constantly — fuel is sold in litres, journeys are measured in miles, and cars report both.",
  },
  {
    question: "Is a kilometre shorter than a mile?",
    answer:
      "Yes — a kilometre is about 62% of a mile. One mile is 1.60934 km, and one kilometre is 0.62137 miles. The table on this page runs to 100 miles (160.93 km); for speeds, the same factor applies — 70 mph is 112.65 km/h.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQS.map((f) => ({
    "@type": "Question",
    name: f.question,
    acceptedAnswer: { "@type": "Answer", text: f.answer },
  })),
};

const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Miles to Km Converter",
  url: `${AppConfig.siteUrl}/miles-to-km-converter`,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

export default function MilesToKmConverterPage() {
  return (
    <div className="space-y-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppJsonLd) }}
      />

      <section className="space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 sm:text-4xl">
          Miles to Km Converter
        </h1>
        <p className={bodyClass}>
          One mile is 1.60934 kilometres. Multiply to go from miles to
          kilometres, divide to come back: 10 miles is{" "}
          {fmt(TEN_MILES_KM, 2)} km, and the marathon distance of 26.2
          miles is {fmt(MARATHON_KM, 2)} km. The converter above works
          in both directions, and the full 1–100 mile table is printed
          below.
        </p>
      </section>

      <MilesToKmConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The formula
        </h2>
        <p className="max-w-2xl rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">
          km = miles × 1.60934 · miles = km ÷ 1.60934
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Worked examples — the race distances
        </h3>
        <p className={bodyClass}>
          <strong>5K and 10K.</strong> Races are named in kilometres but
          trained for in miles in the UK. 5 km ÷ 1.60934 = 3.11 miles;
          10 km ÷ 1.60934 = 6.21 miles. A half marathon, 21.1 km, is
          13.11 miles.
        </p>
        <p className={bodyClass}>
          <strong>The marathon.</strong> 26.2 miles × 1.60934 ={" "}
          {fmt(MARATHON_KM, 2)} km. The official distance, 42.195 km,
          comes from 26 miles 385 yards — the extra 385 yards were added
          at the 1908 London Olympics and never taken away.
        </p>
        <p className={bodyClass}>
          <strong>A road journey.</strong> London to Edinburgh by road
          is about 400 miles: 400 × 1.60934 = 643.74 km — the figure a
          European sat-nav or a hire-car trip computer abroad would
          show for the same drive.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Miles to km conversion table — 1 to 100 miles
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Miles</th>
                <th className={thClass}>Kilometres</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {MILE_ROWS.map((row) => (
                <tr key={row.miles}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.miles} miles
                  </td>
                  <td className={tdClass}>{fmt(row.km, 2)} km</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conversion factor: 1 mile = 1.60934 km (the international
          mile is exactly 1.609344 km; figures here use 1.60934, the
          value in general use, checked 17 November 2026). The same
          factor converts mph to km/h.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Frequently asked questions
        </h2>
        <div className="space-y-4">
          {FAQS.map((f) => (
            <div
              key={f.question}
              className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm"
            >
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
                {f.question}
              </h3>
              <p className="mt-1 max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300">
                {f.answer}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-4 print:hidden">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Related converters and calculators
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/cm-to-inches-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Cm to Inches Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Shorter lengths the same way — centimetres to inches and
              feet and inches, with a 1–200 cm table.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/litres-to-gallons-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Litres to Gallons Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The fuel half of a road trip — litres into UK gallons
              for mpg figures, with US gallons shown separately.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/stone-to-kg-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Stone to Kg Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Body weight from stones and pounds into kilograms, with
              the full 1–60 stone table.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/kg-to-stone-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Kg to Stone Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Kilograms split back into stones and pounds, with the
              full 40–150 kg table printed.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/hourly-rate-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Hourly Rate Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Turn an hourly rate into a salary — or a salary into an
              hourly rate — at your own hours and weeks.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/pro-rata-salary-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Pro Rata Salary Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Part-time pay from the full-time salary, by hours or days
              per week, with pro-rata holiday entitlement.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
