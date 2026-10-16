/**
 * How each issuer is drawn on a credential card — its short name and its
 * card colour.
 *
 * In the product this comes from the trust registry: an issuer's listing
 * carries its display name and logo, and a wallet draws the card from that
 * rather than from anything the credential says about itself (a credential
 * could claim any logo). The prototype has no registry and no real logos, so
 * each issuer gets a seal with its initials instead — recognisable, and
 * plainly not an agency's actual emblem.
 */
export type CardTint = "mint" | "sand" | "rose" | "sky" | "lilac" | "slate";

export interface IssuerLook {
  short: string;
  tint: CardTint;
}

const LOOKS: Record<string, IssuerLook> = {
  "Corporate Regulatory Authority": { short: "CRA", tint: "mint" },
  "Ministry of Industry, Commerce & Employment": { short: "MoICE", tint: "sand" },
  "Department of Revenue & Customs": { short: "DRC", tint: "rose" },
  "Road Safety & Transport Authority": { short: "RSTA", tint: "sky" },
  "Royal Insurance Corporation of Bhutan": { short: "RICB", tint: "lilac" },
  "Department of Labour": { short: "DoL", tint: "slate" },
  "Bhutan NDI": { short: "NDI", tint: "mint" },
  "Bank of Bhutan": { short: "BoB", tint: "sky" },
};

/** Initials from the name, for an issuer nobody has described yet. */
export function issuerLook(issuer: string): IssuerLook {
  const known = LOOKS[issuer];
  if (known) return known;
  const short = issuer
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .map((w) => w[0])
    .join("")
    .slice(0, 4);
  return { short: short || "?", tint: "slate" };
}
