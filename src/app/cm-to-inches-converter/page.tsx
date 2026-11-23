import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import CmToInchesConverter from "@/components/CmToInchesConverter";
import { cmToFeetInches, cmToInches, fmt, inchesToCm } from "@/lib/converters";
import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

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
// "How big is that, really?" — everyday objects at their standard
// sizes: the credit card to the ISO/IEC 7810 standard, the £20
// note to the Bank of England's published polymer dimensions, the
// golf and tennis balls to their governing-body minimum/standard
// diameters, the AA battery to its standard 50.5 mm length, and
// A4 to ISO 216.
const EVERYDAY_ROWS = [
  { cm: 4.27, label: "A golf ball — the minimum diameter the rules allow" },
  { cm: 5.05, label: "An AA battery, end to end" },
  { cm: 6.7, label: "A tennis ball's diameter" },
  { cm: 8.56, label: "A credit or debit card, long edge" },
  { cm: 13.9, label: "A Bank of England £20 note, long edge" },
  { cm: 21, label: "An A4 sheet, short edge" },
  { cm: 29.7, label: "An A4 sheet, long edge" },
].map((r) => ({ ...r, inches: cmToInches(r.cm) }));
// The reverse direction: heights quoted in feet and inches, back
// in centimetres, and the photo/print sizes sold in inches.
const HEIGHT_ROWS = [
  { feet: 4, inches: 6 },
  { feet: 5, inches: 0 },
  { feet: 5, inches: 3 },
  { feet: 5, inches: 6 },
  { feet: 5, inches: 9 },
  { feet: 6, inches: 0 },
  { feet: 6, inches: 3 },
  { feet: 6, inches: 6 },
].map((r) => ({ ...r, cm: inchesToCm(r.feet * 12 + r.inches) }));
const FRAME_ROWS = [
  { w: 4, h: 6, sold: "10 × 15 cm" },
  { w: 5, h: 7, sold: "13 × 18 cm" },
  { w: 8, h: 10, sold: "20 × 25 cm" },
  { w: 10, h: 12, sold: "25 × 30 cm" },
].map((r) => ({
  ...r,
  wCm: inchesToCm(r.w),
  hCm: inchesToCm(r.h),
}));

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

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          How big is that in real life?
        </h2>
        <p className={bodyClass}>
          Centimetres are hard to picture until they are attached
          to something in your pocket or your desk. These are
          everyday objects at their standard sizes — the card and
          the banknote to their official published dimensions, the
          balls to the minimum or standard diameters their rules
          set:
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Object</th>
                <th className={thClass}>Centimetres</th>
                <th className={thClass}>Inches</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {EVERYDAY_ROWS.map((r) => (
                <tr key={r.label}>
                  <td className={tdClass}>{r.label}</td>
                  <td className={tdClass}>{fmt(r.cm, 2)} cm</td>
                  <td className={tdClass}>{fmt(r.inches, 2)} in</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          So when a listing says a case is 15 cm wide, picture a
          school ruler; at 10 cm, think of the long edge of a
          credit card plus a finger&apos;s width; and a 5 cm part
          is an AA battery. For a person, the anchors are heights:
          170 cm is 5 ft 6.9 in, and 183 cm is 6 ft.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-50">
          The other way round: feet, inches and photo sizes in cm
        </h2>
        <p className={bodyClass}>
          Heights are still quoted in feet and inches across the
          UK, and photo prints are still sold in inches — here are
          both, converted back (multiply inches by 2.54):
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Height</th>
                <th className={thClass}>Centimetres</th>
                <th className={thClass}>Photo / print size</th>
                <th className={thClass}>Exact cm</th>
                <th className={thClass}>Sold as</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {HEIGHT_ROWS.map((r, i) => (
                <tr key={`${r.feet}-${r.inches}`}>
                  <td className={tdClass}>
                    {r.feet} ft {r.inches} in
                  </td>
                  <td className={tdClass}>{fmt(r.cm, 1)} cm</td>
                  <td className={tdClass}>
                    {FRAME_ROWS[i]
                      ? `${FRAME_ROWS[i].w} × ${FRAME_ROWS[i].h} in`
                      : "—"}
                  </td>
                  <td className={tdClass}>
                    {FRAME_ROWS[i]
                      ? `${fmt(FRAME_ROWS[i].wCm, 1)} × ${fmt(FRAME_ROWS[i].hCm, 1)} cm`
                      : "—"}
                  </td>
                  <td className={tdClass}>
                    {FRAME_ROWS[i] ? FRAME_ROWS[i].sold : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={bodyClass}>
          Print sizes are nominal: an 8 × 10 in print is exactly
          20.32 × 25.4 cm, but it is sold across Europe as a
          20 × 25 cm print — the small trim is why a borderless
          print sometimes crops a millimetre or two at the edges.
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

      <RelatedCalculators href="/cm-to-inches-converter" />
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
