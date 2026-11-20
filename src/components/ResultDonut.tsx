/**
 * A small results donut chart drawn as inline SVG — no chart
 * library. Segments are the parts of the result (maternity pay by
 * stage, redundancy pay by age band, holiday pay taken vs owed), in
 * the site's own emerald brand ramp plus one warm accent. Each legend
 * row shows the segment's label, its money value and its percentage
 * of the whole. Renders nothing when there is no positive total to
 * split.
 */

export interface DonutSegment {
  label: string;
  /** The numeric part this segment represents (usually £). */
  value: number;
  /** Pre-formatted value for the legend, e.g. "£3,738.46" or "57.94 hours". */
  displayValue: string;
  color: string;
}

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * The ring's clear inner width: the diameter inside the stroke
 * (2 × (52 − 15/2) = 89 units). The centre label and value are set
 * on one line each, so their font sizes shrink to fit this width —
 * at the base sizes a long label such as "REDUNDANCY PAY" measured
 * ~94 units and spilled over the ring. The per-character factors
 * are conservative averages for the weights used (600 uppercase
 * with the letter-spacing below; 700 for the value), and a
 * textLength cap on the rendered text is the hard guarantee.
 */
const SAFE_WIDTH = 84;
const LABEL_BASE_SIZE = 9.5;
const LABEL_CHAR_FACTOR = 0.72;
const VALUE_BASE_SIZE = 13.5;
const VALUE_CHAR_FACTOR = 0.58;

function fitFontSize(text: string, base: number, charFactor: number): number {
  const width = text.length * base * charFactor;
  return width > SAFE_WIDTH ? (base * SAFE_WIDTH) / width : base;
}

function percent(part: number, total: number): string {
  const p = (part / total) * 100;
  return `${p < 10 && p % 1 !== 0 ? p.toFixed(1) : Math.round(p)}%`;
}

export default function ResultDonut({
  segments,
  centerLabel,
  centerValue,
}: {
  segments: DonutSegment[];
  centerLabel: string;
  centerValue: string;
}) {
  const parts = segments.filter((s) => s.value > 0);
  const total = parts.reduce((sum, s) => sum + s.value, 0);
  if (parts.length === 0 || total <= 0) return null;

  const labelText = centerLabel.toUpperCase();
  const labelFontSize = fitFontSize(
    labelText,
    LABEL_BASE_SIZE,
    LABEL_CHAR_FACTOR,
  );
  const valueFontSize = fitFontSize(
    centerValue,
    VALUE_BASE_SIZE,
    VALUE_CHAR_FACTOR,
  );
  const labelTextLength =
    labelText.length * labelFontSize * LABEL_CHAR_FACTOR > SAFE_WIDTH
      ? SAFE_WIDTH
      : undefined;
  const valueTextLength =
    centerValue.length * valueFontSize * VALUE_CHAR_FACTOR > SAFE_WIDTH
      ? SAFE_WIDTH
      : undefined;

  let offsetSoFar = 0;
  const arcs = parts.map((s) => {
    const fraction = s.value / total;
    const dash = fraction * CIRCUMFERENCE;
    const arc = {
      ...s,
      dashArray: `${Math.max(dash - 1.5, 0.5)} ${CIRCUMFERENCE - Math.max(dash - 1.5, 0.5)}`,
      dashOffset: -offsetSoFar * CIRCUMFERENCE,
    };
    offsetSoFar += fraction;
    return arc;
  });

  return (
    <div className="mt-5 flex flex-col items-center gap-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:flex-row sm:gap-6">
      <svg
        viewBox="0 0 120 120"
        className="h-36 w-36 shrink-0"
        role="img"
        aria-label={`${centerLabel}: ${centerValue}`}
      >
        <circle
          cx="60"
          cy="60"
          r={RADIUS}
          fill="none"
          strokeWidth="15"
          className="stroke-slate-100 dark:stroke-slate-800"
        />
        {arcs.map((a) => (
          <circle
            key={a.label}
            cx="60"
            cy="60"
            r={RADIUS}
            fill="none"
            stroke={a.color}
            strokeWidth="15"
            strokeDasharray={a.dashArray}
            strokeDashoffset={a.dashOffset}
            transform="rotate(-90 60 60)"
          />
        ))}
        <text
          x="60"
          y="57"
          textAnchor="middle"
          className="fill-slate-500 dark:fill-slate-400"
          fontSize={labelFontSize}
          fontWeight="600"
          letterSpacing="0.08em"
          textLength={labelTextLength}
          lengthAdjust="spacingAndGlyphs"
        >
          {labelText}
        </text>
        <text
          x="60"
          y="73"
          textAnchor="middle"
          className="fill-slate-900 dark:fill-slate-50"
          fontSize={valueFontSize}
          fontWeight="700"
          textLength={valueTextLength}
          lengthAdjust="spacingAndGlyphs"
        >
          {centerValue}
        </text>
      </svg>
      <ul className="w-full space-y-2 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        {arcs.map((a) => (
          <li key={a.label} className="flex items-baseline gap-2">
            <span
              aria-hidden
              className="inline-block h-3 w-3 shrink-0 translate-y-0.5 rounded-sm"
              style={{ backgroundColor: a.color }}
            />
            <span className="flex-1">{a.label}</span>
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              {a.displayValue}
            </span>
            <span className="w-11 text-right text-slate-500 dark:text-slate-400">
              {percent(a.value, total)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** The brand ramp the donuts use, in one place so every tool matches. */
export const DONUT_COLORS = {
  deep: "#047857", // brand-700
  mid: "#059669", // brand-600
  light: "#6ee7b7", // brand-300
  pale: "#a7f3d0", // brand-200
  accent: "#f59e0b", // amber-500 — used only where a non-pay contrast helps
  grey: "#94a3b8", // slate-400
};
