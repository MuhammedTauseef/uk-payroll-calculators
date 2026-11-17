/**
 * Unit conversion maths for the converter section.
 *
 * The constants are the exact international definitions (checked
 * 17 November 2026):
 *
 *   1 stone            = 6.35029 kg (14 lb × 0.45359237 kg)
 *   1 kg               = 0.157473 stone
 *   1 pound            = 0.45359237 kg (exact, international avoirdupois)
 *   1 mile             = 1.60934 km (1.609344 exactly; 1.60934 is the
 *                        figure Google shows and the one used here)
 *   1 inch             = 2.54 cm (exact)
 *   1 imperial gallon  = 4.54609 litres (the UK gallon — primary here)
 *   1 US gallon        = 3.78541 litres (shown as the secondary figure)
 *
 * Every converter page computes its worked examples and prints its
 * conversion tables from these same functions, so a page can never
 * disagree with its own calculator.
 */

export const KG_PER_STONE = 6.35029;
export const STONE_PER_KG = 0.157473;
export const KG_PER_POUND = 0.45359237;
export const POUNDS_PER_STONE = 14;
export const KM_PER_MILE = 1.60934;
export const CM_PER_INCH = 2.54;
export const LITRES_PER_IMPERIAL_GALLON = 4.54609;
export const LITRES_PER_US_GALLON = 3.78541;

function round(n: number, dp: number): number {
  const f = 10 ** dp;
  return Math.round((n + Number.EPSILON) * f) / f;
}

/** Kilograms in a stones+pounds weight, e.g. 10 st 7 lb → 66.6781 kg. */
export function stoneToKg(stones: number, pounds: number): number {
  const totalPounds =
    Math.max(0, stones || 0) * POUNDS_PER_STONE + Math.max(0, pounds || 0);
  return totalPounds * KG_PER_POUND;
}

/** Kilograms in a decimal-stone weight, e.g. 11.5 st → 73.0283 kg. */
export function decimalStoneToKg(stone: number): number {
  return Math.max(0, stone || 0) * KG_PER_STONE;
}

export interface StoneParts {
  /** Whole stones. */
  stones: number;
  /** Remaining pounds, 0–13.9, one decimal place. */
  pounds: number;
  /** The weight in decimal stone, two decimal places. */
  totalStone: number;
}

/** Split a kilogram weight into stones and pounds, e.g. 76 kg → 11 st 13.6 lb. */
export function kgToStoneParts(kg: number): StoneParts {
  const value = Math.max(0, kg || 0);
  const totalStone = value * STONE_PER_KG;
  const stones = Math.floor(totalStone);
  let pounds = round((totalStone - stones) * POUNDS_PER_STONE, 1);
  let wholeStones = stones;
  if (pounds >= POUNDS_PER_STONE) {
    wholeStones += 1;
    pounds = 0;
  }
  return { stones: wholeStones, pounds, totalStone: round(totalStone, 2) };
}

/** Decimal stone in a kilogram weight, e.g. 76 kg → 11.97 st. */
export function kgToStone(kg: number): number {
  return round(Math.max(0, kg || 0) * STONE_PER_KG, 2);
}

/** Kilograms in a pounds-only weight, e.g. 154 lb → 69.8532 kg. */
export function poundsToKg(pounds: number): number {
  return Math.max(0, pounds || 0) * KG_PER_POUND;
}

/** Pounds in a kilogram weight, e.g. 70 kg → 154.3236 lb. */
export function kgToPounds(kg: number): number {
  return Math.max(0, kg || 0) / KG_PER_POUND;
}

export function milesToKm(miles: number): number {
  return Math.max(0, miles || 0) * KM_PER_MILE;
}

export function kmToMiles(km: number): number {
  return Math.max(0, km || 0) / KM_PER_MILE;
}

export function cmToInches(cm: number): number {
  return Math.max(0, cm || 0) / CM_PER_INCH;
}

export function inchesToCm(inches: number): number {
  return Math.max(0, inches || 0) * CM_PER_INCH;
}

export interface FeetInches {
  feet: number;
  /** Remaining inches, 0–11.9, one decimal place. */
  inches: number;
}

/** Split a centimetre length into feet and inches, e.g. 170 cm → 5 ft 6.9 in. */
export function cmToFeetInches(cm: number): FeetInches {
  const totalInches = cmToInches(cm);
  const feet = Math.floor(totalInches / 12);
  let inches = round(totalInches - feet * 12, 1);
  let wholeFeet = feet;
  if (inches >= 12) {
    wholeFeet += 1;
    inches = 0;
  }
  return { feet: wholeFeet, inches };
}

/** Imperial (UK) gallons in a litre volume, e.g. 50 L → 10.998 gal. */
export function litresToImperialGallons(litres: number): number {
  return Math.max(0, litres || 0) / LITRES_PER_IMPERIAL_GALLON;
}

/** US gallons in a litre volume, e.g. 50 L → 13.209 gal. */
export function litresToUsGallons(litres: number): number {
  return Math.max(0, litres || 0) / LITRES_PER_US_GALLON;
}

/** Litres in an imperial (UK) gallon volume. */
export function imperialGallonsToLitres(gallons: number): number {
  return Math.max(0, gallons || 0) * LITRES_PER_IMPERIAL_GALLON;
}

/** Litres in a US gallon volume. */
export function usGallonsToLitres(gallons: number): number {
  return Math.max(0, gallons || 0) * LITRES_PER_US_GALLON;
}

/** Format a number with a fixed number of decimal places, en-GB grouping. */
export function fmt(n: number, dp: number): string {
  return new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: dp,
    maximumFractionDigits: dp,
  }).format(n);
}
