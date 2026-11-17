/**
 * Hand-computed verification of the converter maths.
 *
 * Run with:  npm run verify:converters
 *
 * Expected values are worked out from the exact definitions
 * (1 stone = 6.35029 kg, 1 lb = 0.45359237 kg, 1 mile = 1.60934 km,
 * 1 inch = 2.54 cm, 1 imperial gallon = 4.54609 L), checked
 * 17 November 2026. Exits non-zero on any disagreement.
 */
import {
  cmToInches,
  kgToStoneParts,
  litresToImperialGallons,
  milesToKm,
  stoneToKg,
} from "../src/lib/converters.ts";

let failures = 0;

function check(name: string, got: number, want: number, tol = 0.005) {
  if (Math.abs(got - want) < tol) {
    console.log(`ok   ${name}: ${got}`);
  } else {
    failures++;
    console.error(`FAIL ${name}: got ${got}, expected ${want}`);
  }
}

// 12 stone = 12 × 6.35029 = 76.20348 kg → 76.2035 kg.
check("12 stone in kg", stoneToKg(12, 0), 76.2035, 0.001);

// 10 st 7 lb = 147 lb × 0.45359237 = 66.6781 kg.
check("10 st 7 lb in kg", stoneToKg(10, 7), 66.6781, 0.001);

// 76 kg = 76 × 0.157473 = 11.9679 stone → 11 st 13.6 lb (≈11.97 st).
const p76 = kgToStoneParts(76);
check("76 kg stones", p76.stones, 11, 0.0001);
check("76 kg pounds", p76.pounds, 13.6, 0.05);
check("76 kg decimal stone", p76.totalStone, 11.97, 0.005);

// 100 kg = 15.7473 stone → 15 st 10.5 lb.
const p100 = kgToStoneParts(100);
check("100 kg stones", p100.stones, 15, 0.0001);
check("100 kg pounds", p100.pounds, 10.5, 0.05);

// Marathon: 26.2 miles × 1.60934 = 42.1647 km → 42.16 km.
check("26.2 miles in km", milesToKm(26.2), 42.16, 0.005);

// 100 cm ÷ 2.54 = 39.3701 in.
check("100 cm in inches", cmToInches(100), 39.3701, 0.001);

// 50 L ÷ 4.54609 = 10.9985 imperial gallons → 10.998.
check("50 L in imperial gallons", litresToImperialGallons(50), 10.998, 0.001);

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll converter checks passed");
