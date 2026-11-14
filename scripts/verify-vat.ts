/**
 * Hand-computed verification of the VAT calculator maths.
 *
 * Run with:  npm run verify:vat
 *
 * Cases worked out by hand: adding VAT multiplies by 1 + rate/100;
 * removing divides. At 20% the VAT inside a gross price is 1/6 of it
 * (£120 gross → £20 VAT). Exits non-zero if any figure disagrees.
 */
import { calculateVat } from "../src/lib/vat.ts";

let failures = 0;

function check(
  name: string,
  actual: { net: number; vat: number; gross: number },
  expected: { net: number; vat: number; gross: number },
) {
  for (const k of ["net", "vat", "gross"] as const) {
    if (Math.abs(actual[k] - expected[k]) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(`FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`);
    }
  }
}

check("add £100 @20%", calculateVat({ amount: 100, ratePercent: 20, mode: "add" }), {
  net: 100,
  vat: 20,
  gross: 120,
});
check("remove £120 @20%", calculateVat({ amount: 120, ratePercent: 20, mode: "remove" }), {
  net: 100,
  vat: 20,
  gross: 120,
});
check("remove £240 @20%", calculateVat({ amount: 240, ratePercent: 20, mode: "remove" }), {
  net: 200,
  vat: 40,
  gross: 240,
});
check("add £50 @5%", calculateVat({ amount: 50, ratePercent: 5, mode: "add" }), {
  net: 50,
  vat: 2.5,
  gross: 52.5,
});
check("add £80 @0%", calculateVat({ amount: 80, ratePercent: 0, mode: "add" }), {
  net: 80,
  vat: 0,
  gross: 80,
});
check("add £200 @17.5% custom", calculateVat({ amount: 200, ratePercent: 17.5, mode: "add" }), {
  net: 200,
  vat: 35,
  gross: 235,
});

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll VAT checks passed");
