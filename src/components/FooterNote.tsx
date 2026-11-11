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
  const rulesLabel =
    RATES_RULES_LABEL.charAt(0).toLowerCase() + RATES_RULES_LABEL.slice(1);
  return (
    <p>
      {`This site provides general guidance only, based on the ${rulesLabel}. It is not affiliated with GOV.UK or HMRC. Always check the official guidance on GOV.UK for your specific circumstances.`}
    </p>
  );
}
