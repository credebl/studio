"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { useDemo } from "@/lib/demoStore";
import { PELDEN, isPlatformAdmin, type LegalBasis } from "@/lib/demoData";

import { legalBasisHint, legalBasisLabel } from "./scopeModel";

/**
 * C2 — establish a controllership relation.
 *
 * Three questions, in the order that makes them answerable: who, on what
 * legal ground, and evidenced by what. Scope is deliberately not here — it is
 * the next screen, and putting five more dimensions on this one would bury
 * the legal basis, which is the part that makes a relation more than a role
 * assignment.
 *
 * The person selector only offers people the register has confirmed. That is
 * not a validation nicety: the whole model rests on a person's identity being
 * established independently, so an unconfirmed person cannot be granted
 * authority at all. Showing them greyed out with the reason is more useful
 * than hiding them, because the Owner's next question is "why isn't Tenzin in
 * this list".
 */
const BASES: LegalBasis[] = ["entity_consent", "court_order", "governance_prescribed"];

export function CreateRelationView() {
  const router = useRouter();
  const { people, relations, organizations, addRelation, orgInvitations } = useDemo();

  const state = useScreenState("C2", ["draft", "person_not_verified", "missing_instrument"]);

  const [personId, setPersonId] = useState("");
  const [basis, setBasis] = useState<LegalBasis>("entity_consent");
  const [reference, setReference] = useState("");
  const [fileName, setFileName] = useState("");

  /* Anyone who already holds a relation is not offered again: a second
     relation for the same person would leave two answers to "what may they
     do", and the register has no way to say which one applies. */
  const spokenFor = new Set(
    relations.filter((r) => r.state !== "TERMINATED" && r.state !== "EXPIRED").map((r) => r.personId),
  );
  /* Only people connected to Pelden. NDI's administrators and other
     organisations' staff are in the platform's people list too, and a
     picker that offered the bank's head of digital as Pelden's controller
     would be proposing something nobody should be able to ask for. */
  const pelden = organizations.find((o) => o.id === PELDEN);
  const candidates = people.filter(
    (p) =>
      !spokenFor.has(p.id) &&
      !isPlatformAdmin(p) &&
      p.hasAccount !== false &&
      (pelden?.memberIds.includes(p.id) ?? true),
  );
  const waiting = orgInvitations.filter((i) => i.kind === "M" && i.orgId === PELDEN && i.state === "PENDING").length;

  const forceUnverified = state === "person_not_verified";
  const forceMissingInstrument = state === "missing_instrument";

  const selected = people.find((p) => p.id === personId);
  const personBlocked = forceUnverified || (selected ? !selected.cidVerified : false);
  const instrumentMissing = forceMissingInstrument || fileName === "";
  const canContinue = Boolean(selected) && !personBlocked && !instrumentMissing;

  const continueToScope = () => {
    if (!selected) return;
    const relation = addRelation({
      personId: selected.id,
      legalBasis: basis,
      instrumentFileName: fileName,
      instrumentReference: reference,
    });
    router.push(`/controllership/relations/${relation.id}/scope`);
  };

  /* Nobody to appoint. On a first day that is everyone but the owner, who
     already holds the root authority: authority goes to someone who is
     already a member, so the way forward is an invitation, not a form with
     an empty person list above a legal basis nobody can use yet. */
  if (candidates.length === 0 && state === "draft") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "Controllership", href: "/controllership/relations" },
              { label: "New relation" },
            ]}
            title="Establish a controllership"
          />
          <Panel>
            <div className="relative z-[4] flex flex-col items-start gap-4">
              <span
                aria-hidden="true"
                className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-grid"
                style={{ background: "var(--ndi-mint-08)" }}
              >
                <Icon name="users" size={19} strokeWidth={1.8} className="text-accent" />
              </span>
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 font-display text-[16px] font-semibold text-strong">Nobody to appoint yet</h2>
                <p className="m-0 max-w-[60ch] text-[13.5px] leading-[1.6] text-muted">
                  Authority to act for Pelden Trading goes to someone who is already a member of it.
                  {waiting > 0
                    ? ` ${waiting === 1 ? "One invitation is" : `${waiting} invitations are`} still waiting to be accepted — once a colleague joins, they appear here.`
                    : " Invite a colleague first — once they've joined, they appear here."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href={waiting > 0 ? "/members" : "/members/invite"}>
                  <GradientButton>
                    <Icon name="users" size={15} strokeWidth={2} />
                    {waiting > 0 ? "See invitations waiting" : "Invite someone"}
                  </GradientButton>
                </Link>
                <Link href="/controllership/relations">
                  <HairlineButton>Back to relations</HairlineButton>
                </Link>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Controllership", href: "/controllership/relations" },
            { label: "New relation" },
          ]}
          title="Establish a controllership"
        />

        {/* The column is the form's own width. It used to be a full-width
            panel with a 640px form inside, which left half the panel empty
            beside every field at desktop widths. */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <p className="text-[13.5px] leading-[1.65] text-muted">
              A controllership lets a person act for Pelden Trading — never as
              it. It stands on a legal basis, is evidenced by a signed
              instrument, and takes effect only once the person accepts the
              duties that come with it.
            </p>

            {/* ---- Who ---- */}
            <div className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Person</span>
              <div className="flex flex-col gap-1.5">
                {candidates.map((person) => {
                  const verified = forceUnverified ? false : person.cidVerified;
                  return (
                    <label
                      key={person.id}
                      className={`flex min-h-[56px] items-center gap-3 rounded-[11px] border px-3.5 py-2.5 transition-colors duration-150 ${
                        verified ? "cursor-pointer" : "cursor-not-allowed opacity-70"
                      }`}
                      style={{
                        borderColor:
                          personId === person.id ? "var(--ndi-mint-40)" : "var(--border-grid)",
                        background:
                          personId === person.id ? "var(--ndi-mint-08)" : "transparent",
                      }}
                    >
                      <input
                        type="radio"
                        name="person"
                        checked={personId === person.id}
                        disabled={!verified}
                        onChange={() => setPersonId(person.id)}
                        className="h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                      />
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="font-display text-[13.5px] font-medium text-body">
                          {person.name}
                        </span>
                        <span className="text-[12.5px] leading-tight text-faint">
                          {person.title} · {person.cid}
                        </span>
                      </span>
                      {verified ? (
                        <StatusPill status="verified" label="Identity confirmed" />
                      ) : (
                        <StatusPill status="pending" label="Not confirmed" />
                      )}
                    </label>
                  );
                })}
              </div>

              {personBlocked ? (
                <p
                  role="status"
                  className="mt-1 flex items-start gap-2 text-[12.5px] leading-[1.5]"
                  style={{ color: "var(--ndi-warning)" }}
                >
                  <Icon name="info" size={13} strokeWidth={2} className="mt-[3px] flex-none" />
                  <span>
                    {selected?.joinedBy
                      ? `${selected?.name ?? "This person"} joined by invitation, so the register hasn't confirmed who they are — joining never asks. They prove it with their own Bhutan NDI Wallet when they're appointed, which is the next flow and not part of this prototype yet.`
                      : "This person's identity has not been confirmed against the register, so they cannot be granted authority yet. They need to complete identity verification first."}
                  </span>
                </p>
              ) : null}
            </div>

            {/* ---- On what basis ---- */}
            <div className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Legal basis</span>
              <div className="flex flex-col gap-1.5">
                {BASES.map((b) => (
                  <label
                    key={b}
                    className="flex cursor-pointer items-start gap-3 rounded-[11px] border px-3.5 py-3 transition-colors duration-150"
                    style={{
                      borderColor: basis === b ? "var(--ndi-mint-40)" : "var(--border-grid)",
                      background: basis === b ? "var(--ndi-mint-08)" : "transparent",
                    }}
                  >
                    <input
                      type="radio"
                      name="basis"
                      checked={basis === b}
                      onChange={() => setBasis(b)}
                      className="mt-0.5 h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                    />
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-display text-[13.5px] font-medium text-body">
                        {legalBasisLabel(b)}
                      </span>
                      <span className="text-[12.5px] leading-[1.5] text-faint">
                        {legalBasisHint(b)}
                      </span>
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* ---- Evidenced by what ---- */}
            <div className="flex flex-col gap-3">
              <div className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Signed instrument</span>
                <label className="flex min-h-[44px] cursor-pointer items-center gap-3 rounded-[10px] border border-grid px-3.5 py-2.5">
                  <Icon name="download" size={15} strokeWidth={1.8} className="flex-none text-faint" />
                  <span className="min-w-0 flex-1 truncate text-[13px] text-body">
                    {fileName || "Choose a file"}
                  </span>
                  <input
                    type="file"
                    className="sr-only"
                    onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
                  />
                  <span className="ndi-hairline-btn inline-flex h-9 flex-none items-center rounded-[9px] border border-grid px-3 font-display text-[12.5px] font-medium">
                    Browse
                  </span>
                </label>
                <p className="text-[12px] leading-[1.5] text-faint">
                  Only a fingerprint of the document and a reference are kept. The
                  signed original stays wherever the entity keeps its records.
                </p>
              </div>

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Reference</span>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="PT/BR/2026/014"
                  className={`${FIELD_CLASS} h-11`}
                />
              </label>

              {instrumentMissing ? (
                <p
                  role="status"
                  className="flex items-start gap-2 text-[12.5px] leading-[1.5] text-faint"
                >
                  <Icon name="info" size={13} strokeWidth={2} className="mt-[3px] flex-none" />
                  <span>
                    An instrument is needed before the scope can be defined —
                    it is what the authority rests on.
                  </span>
                </p>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <GradientButton onClick={continueToScope} disabled={!canContinue}>
                Continue to scope
                <Icon name="arrowRight" size={15} strokeWidth={2} />
              </GradientButton>
              <span className="text-[12.5px] text-faint">
                Saved as a draft. Nothing is granted yet.
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
