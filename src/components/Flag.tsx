/**
 * Country flag as a real image.
 *
 * Windows does not render flag emoji — 🇬🇧 shows up as the letters
 * "GB" there (owner report, 24 Nov 2026: the mega menu and the
 * homepage headings read "The calculators GB", "US US"). So wherever
 * a flag is shown next to text, render the flagcdn image instead of
 * the emoji character; the emoji stays in the data (AppConfig.nav,
 * CATEGORY_FLAGS) purely as the country key this component maps from.
 * If the image ever fails to load, nothing renders — the country
 * name in the neighbouring text still carries the meaning.
 */
const FLAG_CODES: Record<string, string> = {
  "🇬🇧": "gb",
  "🇺🇸": "us",
  "🇦🇺": "au",
  "🇨🇭": "ch",
};

export default function Flag({
  flag,
  className,
}: {
  flag: string;
  className?: string;
}) {
  const code = FLAG_CODES[flag];
  if (!code) return <>{flag}</>;
  return (
    <img
      src={`https://flagcdn.com/w80/${code}.png`}
      alt=""
      aria-hidden="true"
      loading="lazy"
      className={
        className ??
        "inline-block h-[0.85em] w-[1.25em] rounded-[2px] object-cover align-[-0.08em]"
      }
    />
  );
}
