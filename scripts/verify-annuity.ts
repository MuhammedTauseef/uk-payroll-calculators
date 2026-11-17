/**
 * Hand-computed verification of the annuity estimator maths.
 *
 * Run with:  npm run verify:annuity
 *
 * The rate table is illustrative (the page says so), so what is
 * verified here is the ARITHMETIC of the estimator: the anchor at
 * age 65 (£7,300 per £100,000), linear interpolation between
 * anchors, the option factors (joint 0.93, 3% escalation 0.72,
 * RPI 0.70, guarantee 5y 0.99 / 10y 0.975), and — the edge case
 * that matters — tax-free cash coming off the pot BEFORE the rest
 * is annuitised. Every expected value below was worked out by hand
 * from those published factors. Exits non-zero on any disagreement.
 */
import {
  annuityBaseRatePer100k,
  calculateAnnuity,
  type AnnuityInput,
} from "../src/lib/annuity.ts";

let failures = 0;

function check(
  name: string,
  input: AnnuityInput,
  expected: {
    taxFreeCash: number;
    annuitisedPot: number;
    ratePer100k: number;
    annualIncome: number;
    monthlyIncome: number;
  },
) {
  const actual = calculateAnnuity(input);
  for (const k of [
    "taxFreeCash",
    "annuitisedPot",
    "ratePer100k",
    "annualIncome",
    "monthlyIncome",
  ] as const) {
    if (Math.abs(actual[k] - expected[k]) < 0.005) {
      console.log(`ok   ${name} ${k}: ${actual[k]}`);
    } else {
      failures++;
      console.error(
        `FAIL ${name} ${k}: got ${actual[k]}, expected ${expected[k]}`,
      );
    }
  }
}

const base: AnnuityInput = {
  pot: 100000,
  taxFreePercent: 0,
  age: 65,
  jointLife: false,
  escalation: "level",
  guaranteeYears: 0,
};

// Headline anchor: £100,000 at 65, single, level, no guarantee → £7,300/yr.
check("£100k, 65, single level", base, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 7300,
  annualIncome: 7300,
  monthlyIncome: 608.33,
});

// Tax-free cash FIRST: 25% of £100,000 comes off, £75,000 is
// annuitised → 0.75 × £7,300 = £5,475/yr.
check("£100k, 25% tax-free first", { ...base, taxFreePercent: 25 }, {
  taxFreeCash: 25000,
  annuitisedPot: 75000,
  ratePer100k: 7300,
  annualIncome: 5475,
  monthlyIncome: 456.25,
});

// Bigger pot, same shape: £200,000, 25% off → £150,000 × 7.3% = £10,950.
check(
  "£200k, 25% tax-free first",
  { ...base, pot: 200000, taxFreePercent: 25 },
  {
    taxFreeCash: 50000,
    annuitisedPot: 150000,
    ratePer100k: 7300,
    annualIncome: 10950,
    monthlyIncome: 912.5,
  },
);

// Joint life: £7,300 × 0.93 = £6,789.
check("£100k, 65, joint life", { ...base, jointLife: true }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 6789,
  annualIncome: 6789,
  monthlyIncome: 565.75,
});

// Escalation: 3% fixed £7,300 × 0.72 = £5,256; RPI £7,300 × 0.70 = £5,110.
check("£100k, 65, escalating 3%", { ...base, escalation: "fixed3" }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 5256,
  annualIncome: 5256,
  monthlyIncome: 438,
});
check("£100k, 65, RPI-linked", { ...base, escalation: "rpi" }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 5110,
  annualIncome: 5110,
  monthlyIncome: 425.83,
});

// Guarantees: 5y £7,300 × 0.99 = £7,227; 10y £7,300 × 0.975 = £7,117.50.
check("£100k, 65, 5y guarantee", { ...base, guaranteeYears: 5 }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 7227,
  annualIncome: 7227,
  monthlyIncome: 602.25,
});
check("£100k, 65, 10y guarantee", { ...base, guaranteeYears: 10 }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 7117.5,
  annualIncome: 7117.5,
  monthlyIncome: 593.13,
});

// Everything at once: £7,300 × 0.93 × 0.72 × 0.975 = £4,765.88.
check(
  "£100k, 65, joint + 3% esc + 10y guarantee",
  { ...base, jointLife: true, escalation: "fixed3", guaranteeYears: 10 },
  {
    taxFreeCash: 0,
    annuitisedPot: 100000,
    ratePer100k: 4765.88,
    annualIncome: 4765.88,
    monthlyIncome: 397.16,
  },
);

// Age interpolation: 67 is 2/5 of the way from 65 (£7,300) to 70
// (£8,300) → £7,300 + £400 = £7,700.
check("£100k, age 67 interpolated", { ...base, age: 67 }, {
  taxFreeCash: 0,
  annuitisedPot: 100000,
  ratePer100k: 7700,
  annualIncome: 7700,
  monthlyIncome: 641.67,
});

// Anchor and clamp behaviour of the base rate itself.
for (const [age, expected] of [
  [55, 5900],
  [60, 6500],
  [70, 8300],
  [75, 9600],
  [50, 5900], // clamps to the 55 anchor
  [80, 9600], // clamps to the 75 anchor
] as const) {
  const actual = annuityBaseRatePer100k(age);
  if (Math.abs(actual - expected) < 0.005) {
    console.log(`ok   base rate age ${age}: ${actual}`);
  } else {
    failures++;
    console.error(
      `FAIL base rate age ${age}: got ${actual}, expected ${expected}`,
    );
  }
}

if (failures > 0) {
  console.error(`\n${failures} check(s) failed`);
  process.exit(1);
}
console.log("\nAll annuity checks passed");
