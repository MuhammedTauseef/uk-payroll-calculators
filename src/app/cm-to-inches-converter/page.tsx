import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CmToInchesConverter from "@/components/CmToInchesConverter";
import { cmToFeetInches, cmToInches, fmt } from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/cm-to-inches-converter",
  "Cm to Inches Converter — Centimetres to Inches, Feet and Inches",
  "Free cm to inches converter: centimetres to inches and to feet and inches, with the formula, worked height examples and a full conversion table from 1 to 200 cm.",
);

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Table and worked examples are computed by the same functions the
// converter runs, so the page can never disagree with itself.
const CM_ROWS = Array.from({ length: 200 }, (_, i) => i + 1).map((cm) => ({
  cm,
  inches: cmToInches(cm),
  feetInches: cmToFeetInches(cm),
}));
const HEIGHT_170 = cmToFeetInches(170);
const HEIGHT_100_IN = cmToInches(100);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many inches is 100 cm?",
    answer:
      "100 cm is 39.3701 inches — 39.37 in to two decimal places. One inch is exactly 2.54 cm, so divide by 2.54: 100 ÷ 2.54 = 39.3701. In feet and inches that is 3 ft 3.4 in.",
  },
  {
    question: "How do I convert cm to feet and inches?",
    answer:
      "Divide the centimetres by 2.54 to get inches, then divide the inches by 12: the whole number is the feet and the remainder is the inches. For 170 cm: 170 ÷ 2.54 = 66.93 in; 66.93 ÷ 12 = 5 ft with 6.9 in left over — so 170 cm is 5 ft 6.9 in.",
  },
  {
    question: "How tall is 170 cm in feet?",
    answer:
      "170 cm is 5 ft 6.9 in — usually quoted as 5 ft 7 in. It is the most commonly looked-up height conversion in the UK, sitting just above the average adult height. The table on this page covers every centimetre from 1 to 200, so any height can be read straight off.",
  },
  {
    question: "Why is an inch exactly 2.54 cm?",
    answer:
      "Because it was defined that way in 1959, when the UK, the US and the Commonwealth agreed a single international inch of exactly 25.4 millimetres. Before that, each country's inch differed by tiny fractions — enough to matter in engineering, which is why the definition was fixed.",
  },
  {
    question: "How do I convert inches back to cm?",
    answer:
      "Multiply by 2.54. A 32-inch waist is 32 × 2.54 = 81.28 cm, and a 55-inch TV (measured diagonally) is 139.7 cm. The converter above works in this direction too — switch it to Inches → Centimetres.",
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
  name: "Cm to Inches Converter",
  url: `${AppConfig.siteUrl}/cm-to-inches-converter`,
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

export default function CmToInchesConverterPage() {
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
          Cm to Inches Converter
        </h1>
        <p className={bodyClass}>
          One inch is exactly 2.54 cm, so divide centimetres by 2.54:
          100 cm is {fmt(HEIGHT_100_IN, 2)} inches, and a height of
          170 cm is {HEIGHT_170.feet} ft {fmt(HEIGHT_170.inches, 1)} in.
          The converter above also runs in reverse, and the full
          1–200 cm table — centimetres, inches, and feet and inches —
          is printed below.
        </p>
      </section>

      <CmToInchesConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The formula
        </h2>
        <p className="max-w-2xl rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">
          inches = cm ÷ 2.54 · cm = inches × 2.54
        </p>
        <p className={bodyClass}>
          For feet and inches, one more step: divide the inches by 12.
          The whole number is the feet; what remains is the inches.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Worked examples
        </h3>
        <p className={bodyClass}>
          <strong>A height of 170 cm.</strong> 170 ÷ 2.54 = 66.93 in.
          66.93 ÷ 12 = 5 whole feet (60 in), leaving 6.9 in — so 170 cm
          is {HEIGHT_170.feet} ft {fmt(HEIGHT_170.inches, 1)} in, quoted
          as 5 ft 7 in.
        </p>
        <p className={bodyClass}>
          <strong>A 100 cm metre stick.</strong> 100 ÷ 2.54 ={" "}
          {fmt(HEIGHT_100_IN, 2)} in — a metre is 39.37 inches, just
          over 3 ft 3 in, which is why a metre feels slightly longer
          than a yard (36 in).
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Cm to inches conversion table — 1 to 200 cm
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Centimetres</th>
                <th className={thClass}>Inches</th>
                <th className={thClass}>Feet and inches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {CM_ROWS.map((row) => (
                <tr key={row.cm}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.cm} cm
                  </td>
                  <td className={tdClass}>{fmt(row.inches, 2)} in</td>
                  <td className={tdClass}>
                    {row.feetInches.feet} ft {fmt(row.feetInches.inches, 1)} in
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conversion factor: 1 inch = 2.54 cm exactly (the international
          inch, agreed in 1959), checked 17 November 2026. Inches are
          shown to two decimal places and the feet-and-inches split to
          one decimal place.
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
            href="/stone-to-kg-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Stone to Kg Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The weight that goes with the height — stones and pounds
              into kilograms, with the full 1–60 stone table.
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
              Kilograms split into stones and pounds, with the full
              40–150 kg table printed kilogram by kilogram.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/miles-to-km-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Miles to Km Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Longer distances both ways — road journeys and race
              distances, with the 1–100 mile table.
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
              Volumes in UK imperial gallons, with the US gallon shown
              separately so the two never get mixed up.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/annual-leave-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Annual Leave Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory holiday entitlement in your own working days —
              full-time, part-time and part-year.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/ssp-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              SSP Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Statutory Sick Pay under the April 2026 rules — the
              weekly rate from your own earnings.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}
