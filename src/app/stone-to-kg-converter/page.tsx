import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import StoneToKgConverter from "@/components/StoneToKgConverter";
import { fmt, stoneToKg } from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";

export const metadata: Metadata = pageMetadata(
  "/stone-to-kg-converter",
  "Stone to Kg Converter — Stones and Pounds to Kilograms",
  "Free stone to kg converter: enter stones and pounds for the exact kilogram figure, with the formula, worked examples and a full conversion table from 1 to 60 stone — including the half-stone combinations.",
);

const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass = "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

// Tables and worked examples are computed by the same functions the
// converter runs, so the page can never disagree with itself.
const STONE_ROWS = Array.from({ length: 60 }, (_, i) => i + 1).map((st) => ({
  stone: st,
  kg: stoneToKg(st, 0),
}));
const COMBO_ROWS = Array.from({ length: 14 }, (_, i) => i + 7).flatMap((st) =>
  [0, 7].map((lb) => ({ stone: st, pounds: lb, kg: stoneToKg(st, lb) })),
);
const EX_12 = stoneToKg(12, 0);
const EX_10_7 = stoneToKg(10, 7);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many kg is 12 stone?",
    answer:
      "12 stone is 76.20 kg. One stone is 6.35029 kg, so 12 × 6.35029 = 76.2035 kg, which rounds to 76.20 kg. The full table on this page runs from 1 stone (6.35 kg) to 60 stone (381.02 kg).",
  },
  {
    question: "How do I convert stones and pounds to kg?",
    answer:
      "Turn the whole weight into pounds first — stones × 14, plus the extra pounds — then multiply by 0.45359237, the exact number of kilograms in a pound. For 10 st 7 lb: (10 × 14 + 7) = 147 lb, and 147 × 0.45359237 = 66.68 kg.",
  },
  {
    question: "How many pounds are in a stone?",
    answer:
      "14 pounds. The stone is a unit of 14 lb, used almost only in the UK and Ireland for body weight. It sits between the pound and the hundredweight in the old imperial system, which is why it never lines up neatly with kilograms.",
  },
  {
    question: "Why does my weight in kg look different on different converters?",
    answer:
      "Usually rounding. Some converters use a shortened stone of 6.35 kg exactly, others round the answer to whole kilograms. This converter uses the exact international pound (0.45359237 kg) and shows two decimal places, so 12 stone is 76.20 kg here rather than 76 kg or 76.2 kg.",
  },
  {
    question: "Is a stone the same in the UK and the US?",
    answer:
      "The stone is barely used in the US at all — American scales work in pounds only. Where it is used, in the UK and Ireland, it is always 14 lb. If a US source gives a weight in pounds, divide by 14 for stones, or multiply the pounds by 0.45359237 for kilograms.",
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
  name: "Stone to Kg Converter",
  url: `${AppConfig.siteUrl}/stone-to-kg-converter`,
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

export default function StoneToKgConverterPage() {
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
          Stone to Kg Converter
        </h1>
        <p className={bodyClass}>
          One stone is 6.35029 kg, so converting is a single
          multiplication — but most weights are stones AND pounds, and
          that is where mistakes creep in. Enter both parts above:
          12 stone is {fmt(EX_12, 2)} kg, and 10 st 7 lb is{" "}
          {fmt(EX_10_7, 2)} kg. The full 1-to-60 stone table is printed
          below.
        </p>
      </section>

      <StoneToKgConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The formula
        </h2>
        <p className={bodyClass}>
          A stone is 14 pounds, and a pound is exactly 0.45359237 kg.
          So the whole conversion is:
        </p>
        <p className="max-w-2xl rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">
          kg = (stones × 14 + pounds) × 0.45359237
        </p>
        <p className={bodyClass}>
          If your weight is already in decimal stone (some smart scales
          show 11.5 st, for example), the shorter version is kg =
          stone × 6.35029. Both routes give the same answer, because
          14 × 0.45359237 = 6.35029.
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Worked examples
        </h3>
        <p className={bodyClass}>
          <strong>12 stone.</strong> (12 × 14 + 0) = 168 lb; 168 ×
          0.45359237 = {fmt(EX_12, 2)} kg.
        </p>
        <p className={bodyClass}>
          <strong>10 st 7 lb.</strong> (10 × 14 + 7) = 147 lb; 147 ×
          0.45359237 = {fmt(EX_10_7, 2)} kg. Half-stone weights like
          this one are the most searched-for conversions in the UK,
          which is why the combination table below prints every
          half stone from 7 to 20 stone as well.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Stone to kg conversion table — 1 to 60 stone
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Stone</th>
                <th className={thClass}>Pounds</th>
                <th className={thClass}>Kilograms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {STONE_ROWS.map((row) => (
                <tr key={row.stone}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.stone} st
                  </td>
                  <td className={tdClass}>{row.stone * 14} lb</td>
                  <td className={tdClass}>{fmt(row.kg, 2)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Stones and pounds to kg — the half-stone combinations
        </h2>
        <p className={bodyClass}>
          Most real weights land between whole stones. These are the
          combinations people look up most — every whole and half stone
          from 7 to 20 stone:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Weight</th>
                <th className={thClass}>Pounds</th>
                <th className={thClass}>Kilograms</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {COMBO_ROWS.map((row) => (
                <tr key={`${row.stone}-${row.pounds}`}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.stone} st {row.pounds} lb
                  </td>
                  <td className={tdClass}>{row.stone * 14 + row.pounds} lb</td>
                  <td className={tdClass}>{fmt(row.kg, 2)} kg</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Going the other way — a kilogram figure from a medical letter,
          a gym programme or a recipe — use the{" "}
          <Link href="/kg-to-stone-converter" className={linkClass}>
            kg to stone converter
          </Link>
          , which splits kilograms back into stones and pounds.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conversion factors are the exact international definitions:
          1 lb = 0.45359237 kg and 1 stone = 14 lb = 6.35029 kg,
          checked 17 November 2026. Results are rounded to two decimal
          places for display; the underlying calculation is not rounded.
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
            href="/kg-to-stone-converter"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              Kg to Stone Converter
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              The same conversion in reverse — kilograms split into
              stones and pounds, with the full kg table printed.
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
              Heights and lengths the other way round — centimetres to
              inches, and to feet and inches, with a 1–200 cm table.
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
              Road and race distances converted both ways, with the
              1–100 mile table and the 5K, 10K and marathon figures.
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
              Fuel and tank volumes in UK imperial gallons — with the
              US gallon shown separately so the two never get mixed up.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the converter →
            </span>
          </Link>
          <Link
            href="/nhs-pay-calculator"
            className="group block rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-brand-300 dark:hover:border-brand-700 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
              NHS Pay Calculator
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              Agenda for Change pay by band and step — annual, monthly
              and hourly, with an estimated take-home.
            </p>
            <span className="mt-2 inline-block text-sm font-semibold text-brand-700 dark:text-brand-300 group-hover:text-brand-800 dark:hover:text-brand-300">
              Open the calculator →
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
        </div>
      </section>
    </div>
  );
}
