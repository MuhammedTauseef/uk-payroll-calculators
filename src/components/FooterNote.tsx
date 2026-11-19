"use client";

import { usePathname } from "next/navigation";
import { RATES_RULES_LABEL } from "@/lib/rates";

/**
 * Footer source attribution, chosen by section. The shared site footer
 * originally cited GOV.UK on every page — wrong on the non-UK tool
 * sections, whose rates come from other authorities: /us/* pages use
 * IRS rules and /au/* pages use ATO rates. UK pages keep the GOV.UK
 * wording unchanged.
 */
export default function FooterNote() {
  const pathname = usePathname() ?? "";

  if (pathname.startsWith("/us/")) {
    return (
      <p>
        This site provides general guidance only, based on the IRS 2026
        rules — verified against irs.gov. It is not affiliated with the
        IRS. Always check the official guidance on irs.gov for your
        specific circumstances.
      </p>
    );
  }

  if (pathname.startsWith("/au/")) {
    return (
      <p>
        This site provides general guidance only, based on the ATO
        2025–26 rates — verified against ato.gov.au. It is not affiliated
        with the ATO. Always check the official guidance on ato.gov.au
        for your specific circumstances.
      </p>
    );
  }

  // One template string on purpose: splitting this sentence across
  // JSX text and a {" "} expression rendered live as "theapril 2026
  // rules" (the space was eaten), spotted on the live site 11 Nov.
  // The label is used exactly as defined in rates.ts ("April
  // 2026 rules — verified against GOV.UK"). An earlier version
  // lowercased its first letter to sit mid-sentence, which
  // rendered the month as "april" — month names stay capitalised
  // (friendly-fix, 19 Nov 2026).
  const rulesLabel = RATES_RULES_LABEL;
  return (
    <p>
      {`This site provides general guidance only, based on the ${rulesLabel}. It is not affiliated with GOV.UK or HMRC. Always check the official guidance on GOV.UK for your specific circumstances.`}
    </p>
  );
}
