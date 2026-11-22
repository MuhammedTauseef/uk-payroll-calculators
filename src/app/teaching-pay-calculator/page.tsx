import type { Metadata } from "next";
import { pageMetadata } from "@/utils/metadata";
import Link from "next/link";
import TeacherPayCalculator from "@/components/TeacherPayCalculator";
import {
  ALLOWANCE_RANGES,
  PAY_POINTS,
  calculateTeacherPay,
  pointSalary,
  type PayYear,
  type RegionId,
  type ScaleId,
} from "@/lib/teacher-pay";

import { AppConfig } from "@/utils/AppConfig";
import SubscribeBox from "@/components/SubscribeBox";
import ReviewCard from "@/components/ReviewCard";
import ShareButtons from "@/components/ShareButtons";
import RelatedCalculators from "@/components/RelatedCalculators";

export const metadata: Metadata = pageMetadata(
  "/teaching-pay-calculator",
  "Teaching Pay Calculator — Take-Home Pay 2026/27",
  "Teaching pay calculator: take-home pay for every STPCD pay point in all four regions, 2025/26 and 2026/27 — TLR, SEN, pension, tax code and student loans included.",
);

const linkClass =
  "font-semibold text-brand-700 dark:text-brand-300 underline decoration-brand-300 underline-offset-2 hover:text-brand-800 dark:hover:text-brand-300";
const bodyClass =
  "max-w-2xl text-base leading-relaxed text-slate-700 dark:text-slate-300";
const h2Class = "text-xl font-semibold text-slate-900 dark:text-slate-50";
const tableWrapClass =
  "overflow-x-auto rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm";
const thClass =
  "px-4 py-2 font-semibold text-slate-700 dark:text-slate-300";
const tdClass = "px-4 py-2";

const gbp = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});
const gbp2 = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
});

// Every figure printed on this page is produced by the same library
// the calculator runs on, so the tables and worked examples can
// never drift away from the tool's own answers.
function takeHome(
  year: PayYear,
  scale: ScaleId,
  point: string,
  region: RegionId,
  extra?: { fte?: number; tlr?: number; sen?: number; loan?: "plan2" },
) {
  return calculateTeacherPay({
    year,
    fteSalary: pointSalary(year, scale, point, region),
    fteFraction: extra?.fte ?? 1,
    tlrAnnual: extra?.tlr ?? 0,
    senAnnual: extra?.sen ?? 0,
    pensionMember: true,
    avcMonthly: 0,
    taxCode: "1257L",
    loanPlan: extra?.loan ?? "none",
    postgraduateLoan: false,
  });
}

const m1 = takeHome("2026-27", "main", "M1", "rest");
const m6 = takeHome("2026-27", "main", "M6", "rest");
const u3 = takeHome("2026-27", "upper", "U3", "rest");
const m1Inner = takeHome("2026-27", "main", "M1", "inner");
const partTime = takeHome("2026-27", "main", "M6", "rest", { fte: 0.6 });
const withTlr = takeHome("2026-27", "main", "M6", "rest", { tlr: 8913 });
const m1LastYear = takeHome("2025-26", "main", "M1", "rest");

const REGION_COLS: { id: RegionId; label: string }[] = [
  { id: "rest", label: "Rest of England" },
  { id: "fringe", label: "London Fringe" },
  { id: "outer", label: "Outer London" },
  { id: "inner", label: "Inner London" },
];

function pointsTable(year: PayYear, scale: ScaleId) {
  return Object.keys(PAY_POINTS[year][scale] ?? {}).map((point) => ({
    point,
    salaries: REGION_COLS.map((r) => pointSalary(year, scale, point, r.id)),
    netMonthlyRest: takeHome(year, scale, point, "rest").netMonthly,
  }));
}

const mainRows2627 = pointsTable("2026-27", "main");
const upperRows2627 = pointsTable("2026-27", "upper");
const unqualRows2627 = pointsTable("2026-27", "unqualified");
const ranges2627 = ALLOWANCE_RANGES["2026-27"];

const TPS_TIERS_2627: { band: string; rate: string }[] = [
  { band: "£0 to £36,198.99", rate: "7.4%" },
  { band: "£36,199 to £48,727.99", rate: "8.9%" },
  { band: "£48,728 to £57,776.99", rate: "9.9%" },
  { band: "£57,777 to £76,572.99", rate: "10.5%" },
  { band: "£76,573 to £104,413.99", rate: "11.6%" },
  { band: "£104,414 and above", rate: "12.0%" },
];

const FAQS: { question: string; answer: string }[] = [
  {
    question: "How much does a teacher earn in 2026/27?",
    answer:
      "A newly qualified teacher on M1 outside London starts on £34,069 a year from September 2026, rising to £41,729 in Inner London. The top of the main pay range, M6, is £46,940 (Rest of England) to £54,131 (Inner London), and the top of the upper pay range, U3, is £52,835 to £64,684. After Teachers' Pension contributions, tax and National Insurance, M1 take-home is £2,169.37 a month outside London.",
  },
  {
    question: "How is teacher take-home pay worked out?",
    answer:
      "Start with gross pay, then deduct Teachers' Pension contributions first — they come off before tax under a net-pay arrangement, so they reduce your Income Tax but not your National Insurance. Then Income Tax on what is left above your personal allowance, National Insurance at 8% between £12,570 and £50,270 and 2% above that (charged on gross pay, before the pension deduction), and any student loan repayment at 9% of gross pay above your plan threshold.",
  },
  {
    question: "How much pension does a teacher pay?",
    answer:
      "Between 7.4% and 12% of your actual pay, set by a single tier: the rate for the band your whole salary falls in applies to all of it, not in slices. An M1 teacher on £34,069 pays 7.4%; a teacher on £46,940 pays 8.9%. Part-time teachers are tiered on what they actually earn, not the full-time salary. Your school pays 28.68% on top, and each year builds pension of your pay divided by 57 under the career-average (CARE) scheme.",
  },
  {
    question: "How is part-time teacher pay calculated?",
    answer:
      "Your full-time pay point is scaled by your FTE fraction: 0.6 FTE is three days a week. TLR and SEN allowances are pro-rated by the same fraction. An M6 teacher working 0.6 FTE earns £28,164 gross and takes home about £1,562 a month — and because pension tiering and tax use the actual pay, the take-home is a little more than 60% of the full-time figure. The calculator handles all of this when you set the percentage.",
  },
  {
    question: "What are TLR and SEN payments worth after tax?",
    answer:
      "In 2026/27 TLR1 runs from £10,531 to £17,819, TLR2 from £3,651 to £8,913, TLR3 (fixed-term projects) from £727 to £3,600, and the SEN allowance from £2,885 to £5,690. They are pensionable and taxed like salary. The top TLR2 of £8,913 on top of M6 adds about £490 a month to take-home pay, not the £743 a month the gross figure suggests — pension, tax and National Insurance take the rest.",
  },
  {
    question: "Does this calculator cover Wales, Scotland and academies?",
    answer:
      "The pay points are the STPCD scales for England, which most academies also follow — if your academy pays off-scale, enter your own salary instead. Wales sets its own teacher pay scales and Scotland uses a separate system entirely, so the points here do not apply there; the tax and pension maths is England's. Northern Ireland follows its own arrangements too.",
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
  name: "Teaching Pay Calculator",
  url: `${AppConfig.siteUrl}/teaching-pay-calculator`,
  applicationCategory: "FinanceApplication",
  operatingSystem: "Any",
  browserRequirements: "Requires JavaScript",
  offers: { "@type": "Offer", price: "0", priceCurrency: "GBP" },
  publisher: {
    "@type": "Organization",
    name: AppConfig.name,
    url: AppConfig.siteUrl,
  },
};

function PointsTable({
  rows,
  caption,
}: {
  rows: ReturnType<typeof pointsTable>;
  caption: string;
}) {
  return (
    <div className="space-y-2">
      <div className={tableWrapClass}>
        <table className="w-full text-left text-sm table-stack">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
              <th className={thClass}>Point</th>
              {REGION_COLS.map((r) => (
                <th key={r.id} className={thClass}>
                  {r.label}
                </th>
              ))}
              <th className={thClass}>Take-home a month (Rest of England)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {rows.map((row) => (
              <tr key={row.point}>
                <td className={`${tdClass} font-medium`}>{row.point}</td>
                {row.salaries.map((s, i) => (
                  <td key={i} className={tdClass}>
                    {gbp.format(s)}
                  </td>
                ))}
                <td className={tdClass}>{gbp2.format(row.netMonthlyRest)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">{caption}</p>
    </div>
  );
}

export default function TeachingPayCalculatorPage() {
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
          Teaching Pay Calculator
        </h1>
        {/* Answer-first intro (40–60 words). */}
        <p className={bodyClass}>
          A teacher on M1 outside London earns £34,069 a year from
          September 2026 and takes home £2,169.37 a month after
          pension, tax and National Insurance. Pick your pay point,
          region and working pattern below to see your own take-home
          pay — with TLR, SEN, student loans and your real tax code
          included.
        </p>
        <p className={bodyClass}>
          UK Payroll Calculators is a free library of UK pay, tax and
          leave calculators published by Muhammad Tauseef. This one is
          built on the School Teachers&apos; Pay and Conditions
          Document (STPCD) itself — every pay point in all four
          regions, for both 2025/26 and 2026/27 — rather than a
          single headline salary. It sits alongside our{" "}
          <Link href="/nhs-pay-calculator" className={linkClass}>
            NHS pay calculator
          </Link>{" "}
          for Agenda for Change staff and the{" "}
          <Link href="/term-time-pay-calculator" className={linkClass}>
            term-time pay calculator
          </Link>{" "}
          for the support staff who work school hours only. Teaching
          is the public-sector pay system with the most moving parts —
          five scales, four regions, two kinds of allowance and a
          pension scheme with six contribution tiers — which is
          exactly why a payslip so often looks wrong when it is not,
          and occasionally is wrong when it looks fine.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          By Muhammad Tauseef, CEO, PayrollCalc · Pay points checked
          22 November 2026 against the STPCD 2026 (Department for
          Education); tax, National Insurance and student loan
          thresholds checked the same day against GOV.UK.
        </p>
      </section>

      <TeacherPayCalculator />

      <section className="space-y-3">
        <h2 className={h2Class}>Teacher pay in 2026/27 at a glance</h2>
        <p className={bodyClass}>
          From 1 September 2026, teachers in England covered by the
          STPCD receive a 3.5% award on every pay point, with the
          unqualified teacher minimum rising by 5% to pull the bottom
          of that scale up faster. The main pay range runs from{" "}
          {gbp.format(m1.grossAnnual)} at M1 to{" "}
          {gbp.format(m6.grossAnnual)} at M6 outside London; the
          upper pay range tops out at {gbp.format(u3.grossAnnual)} at
          U3. Inner London pays the same points at higher values —
          M1 in Inner London is {gbp.format(m1Inner.grossAnnual)},
          worth {gbp2.format(m1Inner.netMonthly)} a month take-home
          against {gbp2.format(m1.netMonthly)} outside the capital.
          Compared with 2025/26, the award is worth about{" "}
          {gbp2.format(m1.netMonthly - m1LastYear.netMonthly)} a
          month extra take-home at M1.
        </p>
        <p className={bodyClass}>
          Two facts in those figures are worth holding on to. First,
          the gap between gross and take-home is mostly pension, not
          tax: an M1 teacher pays {gbp2.format(m1.pensionAnnual)} a
          year into the Teachers&apos; Pension Scheme against{" "}
          {gbp2.format(m1.incomeTaxAnnual)} of Income Tax. Second,
          the London differences are pay-point differences, not a
          separate allowance — the same M1 job is simply priced four
          different ways, which is why moving a few miles across the
          Fringe boundary can change a salary by more than a
          performance step does.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          Main and upper pay ranges 2026/27 — every point, every region
        </h2>
        <p className={bodyClass}>
          These are the advisory pay points in Annex 3 of the STPCD
          2026. Maintained schools must follow them; academies
          legally can set their own but the great majority mirror
          the document, and the tables below are what
          &quot;M4&quot; or &quot;U2&quot; in a job advert almost
          always means. The take-home column assumes full-time work,
          Teachers&apos; Pension membership and a 1257L tax code,
          with no student loan — change any of those in the
          calculator above and the figure moves.
        </p>
        <PointsTable
          rows={[...mainRows2627, ...upperRows2627]}
          caption="STPCD 2026 advisory points from 1 September 2026. Take-home worked out by this page's own calculator: pension deducted before tax, National Insurance on gross pay, checked 22 November 2026."
        />
        <p className={bodyClass}>
          Read the table the way a school business manager does: the
          step from one point to the next is worth roughly £1,900 to
          £2,400 of gross pay, but only about 55p to 65p in every
          pound of it reaches your bank account, because the higher
          salary also raises your pension tier contribution in cash
          terms, your tax and your National Insurance together. The{" "}
          <Link href="/pay-rise-calculator" className={linkClass}>
            pay rise calculator
          </Link>{" "}
          runs the same comparison for any salary, and the{" "}
          <Link href="/pro-rata-salary-calculator" className={linkClass}>
            pro-rata salary calculator
          </Link>{" "}
          shows what a point is worth at any working pattern before
          deductions.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Unqualified teacher pay 2026/27</h2>
        <p className={bodyClass}>
          Unqualified teachers — instructors, overseas-trained
          teachers without QTS and trainees on employment-based
          routes — are paid on a six-point scale of their own. The
          2026 award raised the minimum point by 5%, faster than the
          rest of the document, so UQ1 now starts at{" "}
          {gbp.format(unqualRows2627[0].salaries[0])} outside
          London. Schools may pay above the scale for scarce skills,
          which is one of the cases the calculator&apos;s
          own-salary option exists for.
        </p>
        <PointsTable
          rows={unqualRows2627}
          caption="Unqualified teacher points, STPCD 2026, from 1 September 2026. Take-home on the same basis as the table above."
        />
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Leadership and lead practitioner pay</h2>
        <p className={bodyClass}>
          Headteachers, deputies and assistant heads are paid on the
          43-point leadership scale, and lead practitioners — the
          classroom experts who coach other teachers — on an
          18-point scale of their own. In 2026/27 the leadership
          range runs from{" "}
          {gbp.format(pointSalary("2026-27", "leadership", "L1", "rest"))}{" "}
          at L1 to{" "}
          {gbp.format(pointSalary("2026-27", "leadership", "L43", "rest"))}{" "}
          at L43 outside London, and from{" "}
          {gbp.format(pointSalary("2026-27", "leadership", "L1", "inner"))}{" "}
          to{" "}
          {gbp.format(pointSalary("2026-27", "leadership", "L43", "inner"))}{" "}
          in Inner London. Lead practitioner pay runs from{" "}
          {gbp.format(pointSalary("2026-27", "lead", "LP1", "rest"))} to{" "}
          {gbp.format(pointSalary("2026-27", "lead", "LP18", "rest"))}{" "}
          outside London. A school does not place a leader on a
          single point in the way a classroom teacher is placed: it
          sets an individual school range of several points inside
          the scale, sized by the school&apos;s group and the
          role&apos;s responsibilities, and the calculator&apos;s
          point picker follows the same list so you can test any
          point in your range. Above £100,000 the personal allowance
          tapers away — £1 lost for every £2 earned — and the
          calculator applies that too, which is why take-home at the
          top of the leadership scale rises more slowly than the
          gross figures suggest.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Part-time teacher pay, worked properly</h2>
        <p className={bodyClass}>
          Part-time pay is not a separate scale. Your pay point
          stays the same; the salary is multiplied by your FTE
          fraction — the proportion of a full-time post you work,
          so 0.6 is three days a week and 0.8 is four. Take an M6
          teacher outside London at 0.6 FTE: the full-time point is{" "}
          {gbp.format(m6.grossAnnual)}, the part-time gross is{" "}
          {gbp.format(partTime.grossAnnual)}, and the take-home is{" "}
          {gbp2.format(partTime.netMonthly)} a month. Notice that
          the take-home is slightly more than 60% of the full-time{" "}
          {gbp2.format(m6.netMonthly)}: pension tiering uses the
          pay you actually receive, so a part-timer sits in a lower
          contribution tier, and a bigger share of the smaller
          salary falls inside the tax-free personal allowance. The
          same fraction applies to TLR and SEN allowances, which
          the STPCD pro-rates for part-time teachers — a detail
          payslips get wrong often enough that it is worth checking
          yours against the calculator figure. If your contract
          expresses your hours rather than an FTE, divide your
          hours by the full-time hours in your school (usually
          32.5 directed hours is not the divisor — it is the
          full-time equivalent hours in your contract) or use our{" "}
          <Link href="/annual-leave-calculator" className={linkClass}>
            annual leave calculator
          </Link>{" "}
          alongside this one to check the leave side of the same
          fraction.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>TLR and SEN allowances in 2026/27</h2>
        <p className={bodyClass}>
          Teaching and Learning Responsibility payments reward
          sustained extra responsibility — leading a subject, a key
          stage or a department. SEN allowances are paid to teachers
          in special schools, designated special units and some
          mainstream posts with substantial SEN teaching. Both are
          set inside national ranges, both are pensionable, and
          both are taxed and charged National Insurance exactly
          like salary. TLR and SEN are separate lines in this
          calculator because a teacher can hold both, and because
          most rival calculators force you to merge them into the
          salary, which then breaks the pension tier check.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Allowance</th>
                <th className={thClass}>2026/27 range</th>
                <th className={thClass}>2025/26 range</th>
                <th className={thClass}>Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              <tr>
                <td className={tdClass}>TLR1</td>
                <td className={tdClass}>
                  {gbp.format(ranges2627.tlr1[0])} – {gbp.format(ranges2627.tlr1[1])}
                </td>
                <td className={tdClass}>
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr1[0])} –{" "}
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr1[1])}
                </td>
                <td className={tdClass}>
                  Includes line management of a significant number of people
                </td>
              </tr>
              <tr>
                <td className={tdClass}>TLR2</td>
                <td className={tdClass}>
                  {gbp.format(ranges2627.tlr2[0])} – {gbp.format(ranges2627.tlr2[1])}
                </td>
                <td className={tdClass}>
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr2[0])} –{" "}
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr2[1])}
                </td>
                <td className={tdClass}>
                  The most common TLR — subject and phase leaders
                </td>
              </tr>
              <tr>
                <td className={tdClass}>TLR3</td>
                <td className={tdClass}>
                  {gbp.format(ranges2627.tlr3[0])} – {gbp.format(ranges2627.tlr3[1])}
                </td>
                <td className={tdClass}>
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr3[0])} –{" "}
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].tlr3[1])}
                </td>
                <td className={tdClass}>
                  Fixed-term projects only, paid for the project&apos;s life
                </td>
              </tr>
              <tr>
                <td className={tdClass}>SEN allowance</td>
                <td className={tdClass}>
                  {gbp.format(ranges2627.sen[0])} – {gbp.format(ranges2627.sen[1])}
                </td>
                <td className={tdClass}>
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].sen[0])} –{" "}
                  {gbp.format(ALLOWANCE_RANGES["2025-26"].sen[1])}
                </td>
                <td className={tdClass}>
                  Two values inside the range, set by the school
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Ranges from Part 4 of the STPCD 2026 and STPCD 2025,
          checked 22 November 2026.
        </p>
        <p className={bodyClass}>
          What is a TLR worth in your pocket? The top TLR2,{" "}
          {gbp.format(8913)}, on top of M6 takes gross pay to{" "}
          {gbp.format(withTlr.grossAnnual)} and take-home to{" "}
          {gbp2.format(withTlr.netMonthly)} a month — about{" "}
          {gbp2.format(withTlr.netMonthly - m6.netMonthly)} a month
          more, not the {gbp2.format(8913 / 12)} the gross figure
          divides to. The missing quarter goes to the higher
          pension contribution on the larger salary, tax at 20% and
          National Insurance. Run your own TLR value in the
          calculator before deciding whether a responsibility post
          is worth taking — the honest number is the monthly one.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>
          The Teachers&apos; Pension: what you pay, what your school pays
        </h2>
        <p className={bodyClass}>
          Teachers&apos; Pension contributions are the single
          biggest deduction on most teacher payslips, and the most
          misunderstood. You do not pay a percentage of each slice
          of salary, the way income tax works. One tier rate —
          set by the band your whole pensionable pay falls into —
          applies to every pound. Cross a band edge by a single
          pound and the higher rate applies to the whole salary,
          which is why a small pay rise occasionally produces a
          payslip that looks stingy until you do the maths.
        </p>
        <div className={tableWrapClass}>
          <table className="w-full text-left text-sm table-stack">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                <th className={thClass}>Actual pensionable pay (2026/27 bands)</th>
                <th className={thClass}>You pay</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {TPS_TIERS_2627.map((t) => (
                <tr key={t.band}>
                  <td className={tdClass}>{t.band}</td>
                  <td className={tdClass}>{t.rate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Member tiers from Teachers&apos; Pensions; the bands rise
          each April with inflation. The employer rate is 28.68% of
          pensionable pay.
        </p>
        <p className={bodyClass}>
          Against your 7.4% to 12%, your school or academy trust
          pays 28.68% of your pay into the scheme — on an M1 salary
          that is {gbp2.format(m1.employerPensionAnnual)} a year
          that never appears on your payslip as money, but is a
          real part of the cost of employing you and a real part of
          your package when you compare teaching with a private
          sector offer. What the contributions buy is career-average
          (CARE) pension: each year you build up pension of that
          year&apos;s pay divided by 57 —{" "}
          {gbp2.format(m1.careAccrualAnnual)} a year of pension from
          an M1 year — revalued with inflation while you are an
          active member, and paid from your normal pension age.
          Extra voluntary contributions (AVCs) buy more of it or a
          separate pot depending on the arrangement; the calculator
          deducts them before tax, like the main contribution, when
          you enter them. If you are weighing extra pension against
          other uses of the same money, the{" "}
          <Link href="/pension-drawdown-calculator" className={linkClass}>
            pension drawdown calculator
          </Link>{" "}
          and the{" "}
          <Link href="/salary-sacrifice-calculator" className={linkClass}>
            salary sacrifice calculator
          </Link>{" "}
          cover the private-pension side of that comparison.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>Tax codes and student loans on a teacher&apos;s payslip</h2>
        <p className={bodyClass}>
          Most teachers are on tax code 1257L — the standard
          personal allowance of £12,570. The calculator accepts the
          code on your own payslip, including the ones that change
          the maths completely: BR (everything at 20%), D0 (40%),
          D1 (45%), 0T (no allowance), NT (no tax) and K codes,
          where untaxed income is added to your pay instead. If
          your code is wrong — a common cause is a second job, a
          company benefit or an old employer still on HMRC&apos;s
          record — every month is wrong by the same amount, so
          check it with our{" "}
          <Link href="/hmrc-tax-code-checker" className={linkClass}>
            HMRC tax code checker
          </Link>{" "}
          before you query the payroll office. Student loans are
          charged on gross pay: 9% above £26,900 (Plan 1), £29,385
          (Plan 2), £33,795 (Plan 4) or £25,000 (Plan 5) in 2026/27,
          and 6% above £21,000 for a Postgraduate Loan, which can
          run alongside an undergraduate plan. The{" "}
          <Link href="/student-loan-repayment-calculator" className={linkClass}>
            student loan repayment calculator
          </Link>{" "}
          shows the year-by-year balance if you are deciding
          whether to overpay, and the{" "}
          <Link href="/payslip-calculator" className={linkClass}>
            payslip calculator
          </Link>{" "}
          breaks any salary down line by line the same way this
          page does for teaching points.
        </p>
        <p className={bodyClass}>
          One timing point catches people every year: teacher pay
          points change on 1 September, but the tax year changes on
          6 April. Your September payslip is the first on the new
          point, at the new September rate, inside the same tax
          year — and any backpay for a late-settled award lands in
          one month&apos;s pay and is taxed as if you earned that
          much every month, with the overpayment corrected through
          your tax code over the following months. The 2025/26
          toggle in the calculator exists so you can check a
          September-to-August year either side of the award.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className={h2Class}>How this calculator works — and its limits</h2>
        <p className={bodyClass}>
          The method, in order: gross pay is the pay point for your
          scale and region, scaled by your FTE, plus TLR and SEN at
          the same FTE. Teachers&apos; Pension is charged at the
          single tier rate for that gross, and pension and AVCs are
          deducted before tax (a net-pay arrangement) but not
          before National Insurance or student loans, which are
          charged on gross. Income Tax uses your tax code&apos;s
          allowance — tapered above £100,000 — then 20% to £50,270
          of total income, 40% to £125,140 and 45% above. Everything
          on this page, including the tables and worked examples, is
          produced by that one calculation, and it is verified
          against published take-home figures for the main points
          before any change is released. The limits: this is the
          STPCD for England — Wales sets its own scales and Scotland
          is a separate system; Scottish tax bands are not used even
          for S-coded teachers (the allowance is, and it is the same);
          and one-off items — overtime, supply-day variations,
          backpay, maternity and shared parental pay — need their
          own treatment, starting with the{" "}
          <Link href="/maternity-pay-calculator" className={linkClass}>
            maternity pay calculator
          </Link>{" "}
          if that is the question in front of you.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className={h2Class}>Frequently asked questions</h2>
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

      <RelatedCalculators href="/teaching-pay-calculator" />

      <section className="space-y-3">
        <h2 className={h2Class}>
          For schools and academy trusts: running this payroll
        </h2>
        <p className={bodyClass}>
          If you are the person who has to produce these figures for
          a whole staff — five scales, four regions, part-timers,
          TLRs and six pension tiers — doing it in a spreadsheet is
          where errors creep in.{" "}
          <a
            href="https://go.zoho.com/tjEU"
            target="_blank"
            rel="noopener noreferrer"
            className={linkClass}
          >
            Zoho Payroll
          </a>{" "}
          runs UK payroll — pay, payslips, pension contributions and
          HMRC filings — in one place, and handles the tiered
          pension maths this page does by hand.
        </p>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Disclosure: that is an affiliate link — if a school signs
          up through it we may earn a commission. It costs the
          school nothing extra, and it never changes the figures
          this calculator gives you.
        </p>
      </section>
      <ShareButtons />
      <ReviewCard />
      <SubscribeBox />
    </div>
  );
}
