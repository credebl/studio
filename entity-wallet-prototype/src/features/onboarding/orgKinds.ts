import type { OrgKind } from "@/lib/demoData";

/**
 * The entity types, the authority that registers each, and what that
 * authority's identifier looks like (Flow 2 solution design §2.2).
 *
 * WHICH TYPES ARE LISTED
 *
 * Only registered companies, sole proprietorships and partnerships are in
 * scope; civil society organisations and cooperatives are not offered at all.
 * A listed type whose authority isn't connected (P3) is still shown, disabled
 * with the reason — never hidden (UXD-11). Naming the authority against every
 * type also teaches, at a glance, the model the product rests on: the
 * authority decides, not NDI.
 *
 * Which types are connected is the server's answer (`connectedKinds` in the
 * store), not this list's. This list only says who the authority *is*, so
 * the screen can name it either way.
 *
 * WHY THE FORMAT IS HERE
 *
 * SCR-ORG-02 states the authority's format before the field, and corrects an
 * entry against it before any request is made. That check is about shape
 * only — it decides nothing about the organisation, which is the authority's
 * to answer.
 */
export interface OrgKindInfo {
  value: OrgKind;
  label: string;
  /** Exactly as the citizen's wallet will display it (UC-09). */
  authority: string;
  identifierLabel?: string;
  /** Stated before the field. */
  format?: string;
  example?: string;
  pattern?: RegExp;
}

export const ORG_KINDS: OrgKindInfo[] = [
  /* Licensed businesses lead: the proprietor is the largest group of users
     (UX-EW-01 §1.1), so the most common answer comes first. The company is
     still the default choice, because that is the story the demo walks. */
  {
    value: "sole_proprietorship",
    label: "Sole proprietorship",
    authority: "Ministry of Industry, Commerce & Employment",
    identifierLabel: "Trade licence number",
    format: "BL, the dzongkhag, the year of issue and four digits",
    example: "BL-PARO-2011-0387",
    pattern: /^BL-[A-Z]+-\d{4}-\d{4}$/,
  },
  {
    value: "partnership",
    label: "Partnership",
    authority: "Ministry of Industry, Commerce & Employment",
    identifierLabel: "Trade licence number",
    format: "BL, the dzongkhag, the year of issue and four digits",
    example: "BL-THIMPHU-2018-1142",
    pattern: /^BL-[A-Z]+-\d{4}-\d{4}$/,
  },
  {
    value: "company",
    label: "Registered company — private, public or state-owned",
    authority: "Corporate Regulatory Authority",
    identifierLabel: "Company registration number",
    format: "CRA, the year of registration and five digits",
    example: "CRA-2019-04477",
    pattern: /^CRA-\d{4}-\d{5}$/,
  },
];

/* Falls back to the company — the demo's story — by name, not by position,
   now that the list no longer starts with it. */
export const kindOf = (value: OrgKind | undefined) =>
  ORG_KINDS.find((k) => k.value === value) ?? ORG_KINDS.find((k) => k.value === "company")!;
