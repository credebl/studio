"use client";

import { useEffect } from "react";

import { inOrg, shortOrgName, type CredentialRequest } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

/**
 * What the credential screens share (UX-EW-03, Flow 6).
 *
 * STATE IN WORDS, BY WHO HAS IT
 *
 * A request can take days, and the person looking at it wants to know who
 * has it now and what happens next — not a status code (UN-38, UC-29). So
 * every state has one sentence, here, and every screen that shows a
 * request uses it. "Waiting for the Department of Revenue & Customs —
 * usually within 5 days" is what stops a proprietor phoning NDI on day
 * three to report it broken.
 *
 * The business reads actions, never protocol: ask for, share, accept —
 * not proposal, presentation, offer (§2.4).
 */

/** Whole days from today to a date, never negative. */
export const daysLeft = (date: string | null) =>
  date ? Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)) : 0;

/** A short name for an issuer inside a sentence: "the Department of Revenue & Customs". */
export const issuerInline = (name: string) => (/^(Department|Ministry|Corporate|Office)/.test(name) ? `the ${name}` : name);

/** SCR-CRD-03's content table, plus §3.5 for the endings. */
export function requestWords(r: Pick<CredentialRequest, "state" | "issuerName" | "credential" | "declined" | "failReason">, windowDays: number) {
  const issuer = r.issuerName;
  switch (r.state) {
    case "AWAITING_PROOF":
      return { status: "sent", label: "Sending", sentence: `Sending to ${issuerInline(issuer)}` };
    case "NEEDS_CONSENT":
      return { status: "awaiting_acceptance", label: "Your answer needed", sentence: `${issuer} is asking for more — your answer needed` };
    case "WITH_ISSUER":
      return { status: "pending", label: "With the issuer", sentence: `Waiting for ${issuerInline(issuer)} — usually within ${windowDays} days` };
    case "OFFER_READY":
      return { status: "offered", label: "Replied", sentence: `${issuer} has replied — review it` };
    case "ISSUED":
      return { status: "issued", label: "Added", sentence: "Added to your credentials" };
    case "DECLINED_BY_ISSUER":
      return {
        status: "declined",
        label: "Not issued",
        sentence: r.declined ? `${issuer} hasn't issued this. Their reason: ${r.declined.message}` : `${issuer} didn't issue this`,
      };
    case "DECLINED_BY_HOLDER":
      return { status: "withdrawn", label: "Declined", sentence: "You've declined this. Nothing has been added." };
    case "WITHDRAWN":
      return { status: "withdrawn", label: "Withdrawn", sentence: "You've withdrawn this request." };
    case "EXPIRED":
      return { status: "lapsed", label: "Expired", sentence: `${issuer} didn't answer in time, or the offer wasn't accepted in time. Nothing was issued. You can ask again.` };
    case "FAILED":
      return { status: "failed", label: "Didn't go through", sentence: r.failReason ?? `We couldn't reach ${issuerInline(issuer)}. Nothing has been shared. Try again later.` };
  }
}

/** An attribute name as a label — "registered_name" → "Registered name". */
export const attrLabel = (name: string) => {
  const s = name.replace(/_/g, " ");
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/*
 * Labels as the offering lists them, and the attribute each is held under.
 * The offering speaks to people; the credential speaks to machines. Where
 * the two happen to agree after snake-casing, no entry is needed.
 */
const ATTRIBUTE_FOR_LABEL: Record<string, string> = {
  "Company type": "entity_type",
  "Date of incorporation": "incorporation_date",
  "Taxpayer number": "tpn",
};

/** The value a held credential carries for a label the offering uses. */
export const valueFor = (attributes: { name: string; value: string }[], label: string) => {
  const name = ATTRIBUTE_FOR_LABEL[label] ?? label.toLowerCase().replace(/\s+/g, "_");
  return attributes.find((a) => a.name === name)?.value ?? null;
};

/** Plain words for an entity type, as NDI holds it on the organisation. */
export const KIND_WORDS: Record<string, string> = {
  company: "Private limited company",
  sole_proprietorship: "Sole proprietorship",
  partnership: "Partnership",
};

/**
 * The organisation the holder screens are about, and who could change a
 * person's preset if it falls short — the Root, by name, because "ask your
 * administrator" sends people looking for someone who may not exist
 * (FLOW-CRD-01 E2).
 */
export function useHolder() {
  const { organizations, activeOrgId, relations, heldCredentials, personById, mayOperate } = useDemo();
  const org = organizations.find((o) => o.id === activeOrgId);
  const root = relations.find((r) => inOrg(activeOrgId)(r) && r.isRootAuthority && r.state === "ACTIVE");
  return {
    org,
    orgId: activeOrgId,
    name: org ? shortOrgName(org.name) : "Your organisation",
    kind: org?.kind ?? "company",
    rootName: root ? personById(root.personId).name : "Your organisation's owner",
    held: heldCredentials.filter(inOrg(activeOrgId)).filter((c) => c.status === "active"),
    can: (op: "credential:receive" | "credential:accept" | "credential:list") => mayOperate(activeOrgId, op),
  };
}

/** The holder's E2, in the words §3.5 gives it. */
export const cannotAsk = (rootName: string) =>
  `Your role lets you see credentials but not ask for them. ${rootName} can change this.`;

/**
 * The organisation's agent presenting the prerequisite, and the issuer
 * verifying it (FLOW-CRD-01 steps 4–8) — no person does anything in
 * between, so the prototype moves the request on by itself while someone is
 * looking at it. Simulated, and on the what's-real page as such: no proof is
 * exchanged and nothing is verified.
 */
export function useSimulatedDelivery(requests: Pick<CredentialRequest, "id" | "state">[]) {
  const { deliverPrerequisite } = useDemo();
  const waiting = requests.filter((r) => r.state === "AWAITING_PROOF").map((r) => r.id).join("|");
  useEffect(() => {
    if (!waiting) return;
    const t = window.setTimeout(() => waiting.split("|").forEach(deliverPrerequisite), ROUND_TRIP_MS);
    return () => window.clearTimeout(t);
  }, [waiting, deliverPrerequisite]);
}
