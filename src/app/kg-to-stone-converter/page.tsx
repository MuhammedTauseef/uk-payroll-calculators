import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import KgToStoneConverter from "@/components/KgToStoneConverter";
import { fmt, kgToStoneParts } from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/kg-to-stone-converter",
  "Kg to Stone Converter — Kilograms to Stones and Pounds",
  "Free kg to stone converter: enter kilograms for the stones-and-pounds figure, with the formula, worked examples and a full conversion table from 40 to 150 kg.",
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
const KG_ROWS = Array.from({ length: 111 }, (_, i) => i + 40).map((kg) => ({
  kg,
  parts: kgToStoneParts(kg),
}));
const EX_76 = kgToStoneParts(76);
const EX_100 = kgToStoneParts(100);

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How many stone is 76 kg?",
    answer:
      "76 kg is 11 st 13.6 lb — 11.97 stone in decimal. Multiply kilograms by 0.157473 to get decimal stone (76 × 0.157473 = 11.97), then turn the part after the decimal point into pounds by multiplying by 14 (0.97 × 14 ≈ 13.6 lb).",
  },
  {
    question: "How do I convert kg to stones and pounds?",
    answer:
      "Multiply the kilograms by 0.157473. The whole number is the stones; multiply whatever follows the decimal point by 14 for the pounds. For 100 kg: 100 × 0.157473 = 15.75 stone, and 0.75 × 14 = 10.5 lb — so 100 kg is 15 st 10.5 lb.",
  },
  {
    question: "How many kg are in a stone?",
    answer:
      "6.35029 kg. A stone is 14 pounds, and a pound is exactly 0.45359237 kg, so 14 × 0.45359237 = 6.35029 kg. To go from stones back to kilograms, use the stone to kg converter on this site.",
  },
  {
    question: "Why does my bathroom scale show a different stone figure?",
    answer:
      "Most often because the scale rounds the pounds part to a whole number, or truncates instead of rounding. 76 kg is 11 st 13.6 lb, which a scale may show as 11 st 13 lb or round up to 12 st 0 lb. This converter shows the pounds to one decimal place so you can see which way a scale has rounded.",
  },
  {
    question: "What is a healthy weight in stone for my height?",
    answer:
      "That depends on your height — the usual yardstick is BMI, which divides your weight in kilograms by the square of your height in metres. As a rough guide only, for someone 5 ft 9 in (175 cm) the commonly quoted healthy BMI range of 18.5–24.9 works out at about 56.7–76.3 kg, or 8 st 12.9 lb to 12 st. It is a population guide, not a personal target — a GP or nurse can advise on your own case.",
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
  name: "Kg to Stone Converter",
  url: `${AppConfig.siteUrl}/kg-to-stone-converter`,
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

export default function KgToStoneConverterPage() {
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
          Kg to Stone Converter
        </h1>
        <p className={bodyClass}>
          Multiply kilograms by 0.157473 to get stone — then the part
          after the decimal point, times 14, gives the pounds. 76 kg
          works out at {EX_76.stones} st {fmt(EX_76.pounds, 1)} lb, and
          100 kg at {EX_100.stones} st {fmt(EX_100.pounds, 1)} lb. Enter
          any kilogram figure above, or find it in the 40–150 kg table
          below.
        </p>
      </section>

      <KgToStoneConverter />

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The formula
        </h2>
        <p className={bodyClass}>
          One kilogram is 0.157473 stone. The conversion has two steps
          because a stone figure on its own is rarely what anyone
          wants — UK scales, charts and conversations all use stones
          and pounds:
        </p>
        <p className="max-w-2xl rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-3 font-mono text-sm text-slate-800 dark:text-slate-100">
          stone = kg × 0.157473 · pounds = (decimal part) × 14
        </p>
        <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
          Worked examples
        </h3>
        <p className={bodyClass}>
          <strong>76 kg.</strong> 76 × 0.157473 ={" "}
          {fmt(EX_76.totalStone, 2)} stone. The whole stones are{" "}
          {EX_76.stones}; the remaining {fmt(EX_76.totalStone - EX_76.stones, 2)}{" "}
          of a stone × 14 = {fmt(EX_76.pounds, 1)} lb. So 76 kg ={" "}
          {EX_76.stones} st {fmt(EX_76.pounds, 1)} lb.
        </p>
        <p className={bodyClass}>
          <strong>100 kg.</strong> 100 × 0.157473 ={" "}
          {fmt(EX_100.totalStone, 2)} stone — {EX_100.stones} st{" "}
          {fmt(EX_100.pounds, 1)} lb. Round numbers in kilograms are
          almost never round in stone, which is exactly why the printed
          table below runs kilogram by kilogram.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          Kg to stone conversion table — 40 to 150 kg
        </h2>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Kilograms</th>
                <th className={thClass}>Stones and pounds</th>
                <th className={thClass}>Stone (decimal)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {KG_ROWS.map((row) => (
                <tr key={row.kg}>
                  <td className={`${tdClass} font-medium text-slate-900 dark:text-slate-50`}>
                    {row.kg} kg
                  </td>
                  <td className={tdClass}>
                    {row.parts.stones} st {fmt(row.parts.pounds, 1)} lb
                  </td>
                  <td className={tdClass}>{fmt(row.parts.totalStone, 2)} st</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Starting from stones instead — a weight from a UK scale or a
          slimming-club card — the{" "}
          <Link href="/stone-to-kg-converter" className={linkClass}>
            stone to kg converter
          </Link>{" "}
          turns stones and pounds back into kilograms, with the full
          1–60 stone table.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Conversion factors are the exact international definitions:
          1 kg = 0.157473 stone and 1 stone = 14 lb, checked
          17 November 2026. Pounds are shown to one decimal place;
          whole-number scale displays may differ by a pound either way.
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

      <RelatedCalculators href="/kg-to-stone-converter" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
