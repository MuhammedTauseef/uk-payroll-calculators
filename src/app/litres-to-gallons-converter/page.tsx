import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import LitresToGallonsConverter from "@/components/LitresToGallonsConverter";
import {
  fmt,
  litresToImperialGallons,
  litresToUsGallons,
} from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/litres-to-gallons-converter",
  "Litres to Gallons Converter — UK Imperial Gallons (US Shown Too)",
  "Free litres to gallons converter using the UK imperial gallon (4.54609 litres), with US gallons shown separately, the formula, worked examples and a full 1–100 litre conversion table.",
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
const LITRE_ROWS = Array.from({ length: 100 }, (_, i) => i + 1).map((l) => ({
  litres: l,
  imperial: litresToImperialGallons(l),
  us: litresToUsGallons(l),
}));
const TANK_50_IMP = litresToImperialGallons(50);
const TANK_50_US = litresToUsGallons(50);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many gallons is 50 litres?",
    answer:
      "50 litres is 11.00 UK (imperial) gallons — 50 ÷ 4.54609 = 10.998, so 11.00 to two decimal places. In US gallons it is 13.21, because the US gallon is smaller. A typical family-car fuel tank holds about 50 litres, so roughly 11 UK gallons.",
  },
  {
    question: "How many litres are in a UK gallon?",
    answer:
      "4.54609 litres. The imperial gallon used in the UK is defined as exactly 4.54609 litres. The US gallon is different — 3.78541 litres — which is why any converter that does not say WHICH gallon it means is not worth trusting.",
  },
  {
    question: "Why are UK and US gallons different?",
    answer:
      "History. Britain redefined its gallon in 1824 (the imperial gallon, based on 10 lb of water); the US kept the older, smaller wine gallon it had inherited. Both countries then built their pints and fluid ounces on different gallons, so almost every imperial volume unit differs across the Atlantic.",
  },
  {
    question: "How do I work out mpg from litres?",
    answer:
      "Divide the litres you used by 4.54609 to get UK gallons, then divide the miles you drove by those gallons. Example: 300 miles on 40 litres — 40 ÷ 4.54609 = 8.80 gallons, and 300 ÷ 8.80 = 34.1 mpg. Use the US gallon by mistake and the same journey reads 28.4 mpg — which is why US fuel-economy figures always look worse than UK ones for the same car.",
  },
  {
    question: "How many litres is a gallon of petrol in the UK?",
    answer:
      "4.54609 litres — the same imperial gallon as for any other liquid. Petrol is sold by the litre at UK pumps, but fuel-economy figures are quoted in miles per gallon, so the conversion between the two is one UK drivers use constantly.",
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
  name: "Litres to Gallons Converter",
  url: `${AppConfig.siteUrl}/litres-to-gallons-converter`,
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

export default function LitresToGallonsConverterPage() {
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
          Litres to Gallons Converter
        </h1>
        <p className={bodyClass}>
          In the UK a gallon is the imperial gallon — exactly 4.54609
          litres — so divide litres by 4.54609: 50 litres is{" "}
          {fmt(TANK_50_IMP, 2)} UK gallons. The US gallon is smaller
          (3.78541 litres), so the same 50 litres is{" "}
          {fmt(TANK_50_US, 2)} US gallons; both figures are shown
          everywhere on this page so they can never be mixed up.
        </p>
      </section>

      <LitresToGallonsConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The formula
        </h2>
        <p className="max-w-2xl rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">
          UK gallons = litres ÷ 4.54609 · US gallons = litres ÷ 3.78541
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Worked examples
        </h3>
        <p className={bodyClass}>
          <strong>A 50-litre fuel tank.</strong> 50 ÷ 4.54609 ={" "}
          {fmt(TANK_50_IMP, 2)} imperial gallons. Fill that tank at a
          pump price of £1.45 a litre and the fill costs £72.50 — or,
          in the per-gallon terms older price boards used, £6.59 a
          gallon (4.54609 × £1.45).
        </p>
        <p className={bodyClass}>
          <strong>Fuel economy.</strong> A car that uses 40 litres over
          300 miles has used 40 ÷ 4.54609 = 8.80 UK gallons, so it
          returned 300 ÷ 8.80 = 34.1 mpg. Run the same numbers with
          the US gallon and you would get 28.4 mpg — the same car and
          the same journey, but a smaller gallon, so a smaller number.
          That gap is why US and UK fuel-economy figures are never
          directly comparable. The distance half of that calculation is
          on the{" "}
          <Link href="/miles-to-km-converter" className={linkClass}>
            miles to km converter
          </Link>
          .
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Litres to gallons conversion table — 1 to 100 litres
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Litres</th>
                <th className={thClass}>UK gallons (imperial)</th>
                <th className={thClass}>US gallons</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {LITRE_ROWS.map((row) => (
                <tr key={row.litres}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.litres} L
                  </td>
                  <td className={tdClass}>{fmt(row.imperial, 2)} gal</td>
                  <td className={tdClass}>{fmt(row.us, 2)} gal</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conversion factors: 1 imperial gallon = 4.54609 litres
          exactly; 1 US gallon = 3.78541 litres. Checked
          17 November 2026. UK figures on this site always mean the
          imperial gallon unless a US figure is labelled as such.
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
            href="/miles-to-km-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Miles to Km Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The distance half of any mpg figure — miles and
              kilometres converted both ways, with the 1–100 table.
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
              Stones and pounds into kilograms, with the full 1–60
              stone table and the half-stone combinations.
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
              40–150 kg table printed.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/cm-to-inches-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Cm to Inches Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Centimetres to inches and feet and inches, with the full
              1–200 cm table.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/vat-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              VAT Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Add VAT to a net price or strip it out of a gross price
              at 20%, 5% or 0% — the fuel receipt included.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
            </span>
          </Link>
          <Link
            href="/employer-cost-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Employer Cost Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              What a salary really costs the employer — pay, employer
              NI and workplace pension together.
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
