"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/Checkbox";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import {
  PUBLISHED_CREDENTIALS,
  type AccCapability,
  type Accreditation,
  type AskItem,
  type IssueType,
} from "@/lib/demoData";

/**
 * What every accreditation screen shares — so that what was proposed, what
 * was approved, what was accepted and what is running read as the same list
 * in the same words (UX-EW-02 §3.4, scope list; UN-29).
 *
 * WHY ONE LIST, NOT ONE PER SCREEN
 *
 * The officer accepting on SCR-ACC-03 has to recognise what the second
 * administrator approved on SCR-ACC-02, and both have to recognise it later
 * on SCR-ACC-04 when something is refused. Each screen writing its own
 * summary is how "Full name" on one becomes "Name" on another and the
 * officer cannot tell whether they are the same thing. So there is one
 * component, and the screens differ only in what surrounds it.
 */

export const capVerb = (c: AccCapability) => (c === "verifier" ? "verify" : "issue");

/** Organisation-facing name of a capability — never "accreditation" (§2.4). */
export const capApproved = (c: AccCapability) => (c === "verifier" ? "Approved to verify" : "Approved to issue");

export const CHECK_ONLY = "Check only — you'll learn whether it's true, not the value.";

/**
 * An item's label inside a sentence: first letter lowered, the rest as
 * published — "citizenship ID number", not "citizenship id number".
 */
export const inline = (label: string) => label.charAt(0).toLowerCase() + label.slice(1);

export const sameItem = (a: AskItem, b: AskItem) => a.credential === b.credential && a.item === b.item;

/** Whole days from today to a date, never negative. */
export const daysUntil = (date: string | null) =>
  date ? Math.max(0, Math.ceil((new Date(date).getTime() - Date.now()) / 86_400_000)) : 0;

/**
 * The scope summary of SCR-ACC-01's content table, used wherever a scope is
 * summarised: the outcome, and the negative clause (UX-EW-01/UXD-04).
 */
export function scopeSentence(orgName: string, capability: AccCapability, ask: AskItem[], issue: IssueType[]) {
  if (capability === "verifier") {
    return ask.length
      ? `${orgName} will be able to ask people for: ${ask.map((a) => inline(a.item)).join(", ")}. Anything else will be refused.`
      : `${orgName} will not be able to ask people for anything yet.`;
  }
  return issue.length
    ? `${orgName} will be able to issue: ${issue.map((t) => t.name).join(", ")}.`
    : `${orgName} will not be able to issue anything yet.`;
}

/**
 * One accreditation's state, as a pill — worded for whoever is reading.
 * Administrators may say "accreditation"; an organisation reads outcomes
 * (UX-EW-02 §2.4). Every state either door can reach has a word here, so no
 * screen has to invent one.
 */
export function accPill(a: Pick<Accreditation, "state" | "door" | "declinedByOrg" | "recommendation">, audience: "admin" | "org") {
  const org = audience === "org";
  switch (a.state) {
    case "SUBMITTED":
    case "IN_REVIEW":
      return { status: "submitted", label: org ? "Waiting for NDI" : a.state === "SUBMITTED" ? "Waiting for review" : "In review" };
    case "PROPOSED":
      return org
        ? { status: "submitted", label: "Waiting for NDI" }
        : { status: "proposed", label: a.recommendation ? "Waiting for a decision" : "Waiting for second approval" };
    case "PENDING_ACCEPTANCE":
      return { status: "pending_acceptance", label: org ? "Waiting for you to accept" : "Waiting for the organisation" };
    case "LISTING":
      return { status: "listing", label: "Publishing listing" };
    case "ACTIVE":
      return { status: "active", label: org ? "Approved" : "Active" };
    case "DECLINED":
      return { status: "declined", label: a.declinedByOrg ? (org ? "You declined" : "Declined by organisation") : org ? "Not approved" : "Declined" };
    case "EXPIRED":
      return { status: "expired", label: "Expired" };
    case "LAPSED":
      return { status: "lapsed", label: "Lapsed" };
    case "WITHDRAWN":
      return { status: "withdrawn", label: "Withdrawn" };
    case "RESIGNED":
      return { status: "resigned", label: org ? "Stopped" : "Resigned" };
    case "SUPERSEDED":
      return { status: "superseded", label: "Replaced" };
    case "HELD":
      return { status: "held", label: "Held" };
    case "STOPPED":
      return { status: "stopped", label: "Stopped" };
  }
}

/**
 * The read-only scope list (§3.4). `observed` marks what the gate saw the
 * organisation doing, for recognition; `outside` names what was refused.
 */
export function ScopeList({
  capability,
  ask,
  issue,
  observed,
}: {
  capability: AccCapability;
  ask: AskItem[];
  issue: IssueType[];
  observed?: AskItem[];
}) {
  if (capability === "issuer") {
    return (
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {issue.map((t) => (
          <li key={t.name} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
            <span>
              {t.name}
              <span className="block text-[12.5px] text-muted">Basis: {t.basis}</span>
            </span>
          </li>
        ))}
      </ul>
    );
  }
  const byCredential = ask.reduce<Record<string, AskItem[]>>((acc, a) => {
    (acc[a.credential] ??= []).push(a);
    return acc;
  }, {});
  return (
    <div className="flex flex-col gap-3">
      {Object.entries(byCredential).map(([credential, items]) => (
        <div key={credential} className="flex flex-col gap-1.5">
          <p className="m-0 text-[12.5px] text-muted">From {credential}</p>
          <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
            {items.map((a) => (
              <li key={a.item} className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                <span>
                  {a.item}
                  {a.checkOnly ? <span className="text-muted"> — check only</span> : null}
                  {observed?.some((o) => sameItem(o, a)) ? <span className="text-faint"> · observed</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

/**
 * The item chooser (§3.4, UXD-28). Items come only from published
 * credentials and are named by their labels — there is no free text, so
 * nobody can be approved to ask for something no credential holds. Within
 * each credential the yes-or-no checks come first, because asking whether
 * someone is over 18 is less than asking for their date of birth, and the
 * order is the cheapest nudge towards it (UC-24). The running list of what
 * will be asked for stays visible under the choices.
 */
export function ItemChooser({
  value,
  onChange,
  observed,
}: {
  value: AskItem[];
  onChange: (next: AskItem[]) => void;
  observed?: AskItem[];
}) {
  /* A credential with something chosen starts open — a recognition
     arrives with its observed items already in — and stays as the person
     leaves it once they have opened or closed it themselves. */
  const [toggled, setToggled] = useState<Record<string, boolean>>({});
  const toggle = (a: AskItem, on: boolean) => {
    /* Pin it open, so unticking the last item doesn't fold it away. */
    setToggled((t) => ({ ...t, [a.credential]: true }));
    onChange(on ? [...value.filter((v) => !sameItem(v, a)), a] : value.filter((v) => !sameItem(v, a)));
  };

  return (
    <div className="flex flex-col gap-3">
      {PUBLISHED_CREDENTIALS.map((c) => {
        const chosen = value.filter((v) => v.credential === c.credential).length;
        const expanded = toggled[c.credential] ?? chosen > 0;
        const items = [...c.items].sort((x, y) => Number(y.checkOnly) - Number(x.checkOnly));
        return (
          <fieldset key={c.credential} className="m-0 rounded-[12px] border border-grid p-0">
            <legend className="sr-only">{c.credential}</legend>
            <button
              type="button"
              aria-expanded={expanded}
              onClick={() => setToggled({ ...toggled, [c.credential]: !expanded })}
              className="flex w-full items-center justify-between gap-3 rounded-[12px] px-4 py-3 text-left"
            >
              <span className="flex flex-col gap-0.5">
                <span className="text-[14px] font-medium text-strong">{c.credential}</span>
                <span className="text-[12.5px] text-faint">Issued by {c.issuer}</span>
              </span>
              <span className="flex items-center gap-2 text-[12.5px] text-muted">
                {chosen ? `${chosen} chosen` : "Choose items"}
                <Icon name={expanded ? "chevronDown" : "chevronRight"} size={14} strokeWidth={2} />
              </span>
            </button>
            {expanded ? (
              <div className="flex flex-col gap-0.5 border-t border-subtle px-2 py-2">
                {items.map((it) => {
                  const a: AskItem = { credential: c.credential, item: it.item, checkOnly: it.checkOnly };
                  return (
                    <Checkbox
                      key={it.item}
                      checked={value.some((v) => sameItem(v, a))}
                      onChange={(on) => toggle(a, on)}
                      label={
                        <>
                          {it.item}
                          {observed?.some((o) => sameItem(o, a)) ? <span className="text-faint"> · observed</span> : null}
                        </>
                      }
                      description={it.checkOnly ? CHECK_ONLY : undefined}
                    />
                  );
                })}
              </div>
            ) : null}
          </fieldset>
        );
      })}
    </div>
  );
}

/**
 * Credential types an issuer will issue — named in words, each with the
 * basis for issuing it (§3.2, SCR-ACC-06 "choosing — issue"). Free text,
 * unlike the item chooser: what an issuer issues is its own credential and
 * is not yet published anywhere to choose from.
 */
export function IssueTypesEditor({ value, onChange }: { value: IssueType[]; onChange: (next: IssueType[]) => void }) {
  const [name, setName] = useState("");
  const [basis, setBasis] = useState("");
  return (
    <div className="flex flex-col gap-3">
      {value.length ? (
        <ul className="m-0 flex list-none flex-col gap-2 p-0">
          {value.map((t) => (
            <li key={t.name} className="flex items-start justify-between gap-3 rounded-[10px] border border-grid px-3.5 py-2.5">
              <span className="text-[13.5px] leading-[1.55] text-body">
                {t.name}
                <span className="block text-[12.5px] text-muted">Basis: {t.basis}</span>
              </span>
              <button
                type="button"
                onClick={() => onChange(value.filter((x) => x.name !== t.name))}
                className="ndi-plainlink text-[12.5px] font-medium text-accent"
                aria-label={`Remove ${t.name}`}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : null}
      <div className="grid gap-3 min-[761px]:grid-cols-2">
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Credential, in words</span>
          <input className={`${FIELD_CLASS} h-11`} value={name} onChange={(e) => setName(e.target.value)} placeholder="For example: Training certificate" />
        </label>
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Why you can issue it</span>
          <input className={`${FIELD_CLASS} h-11`} value={basis} onChange={(e) => setBasis(e.target.value)} placeholder="For example: we run the course and keep the results" />
        </label>
      </div>
      <div>
        <HairlineButton
          onClick={() => {
            if (!name.trim() || !basis.trim() || value.some((v) => v.name === name.trim())) return;
            onChange([...value, { name: name.trim(), basis: basis.trim() }]);
            setName("");
            setBasis("");
          }}
          disabled={!name.trim() || !basis.trim()}
        >
          <Icon name="plus" size={14} strokeWidth={2.2} />
          Add type
        </HairlineButton>
      </div>
    </div>
  );
}
