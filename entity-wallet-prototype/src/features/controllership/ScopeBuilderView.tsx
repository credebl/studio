"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ScopeSummary } from "@/components/ui/ScopeSummary";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/ui/StatusPill";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { Icon } from "@/components/ui/icons";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { useDemo } from "@/lib/demoStore";
import type { ApprovalPolicy, ControllerOperation, Scope, ScopeGrant } from "@/lib/demoData";

import {
  ALL_OPERATIONS,
  isGateable,
  operationDescription,
  operationLabel,
  takesCredentialTypes,
  takesRelyingParties,
} from "./scopeModel";

/**
 * C3 — the scope and approval-policy builder. The highest-stakes screen in
 * the product, and the one the plan says to test comprehension on hardest.
 *
 * THE CENTRAL DECISION: the preview is not a mode.
 *
 * The brief lists "preview" as one of this screen's states, which would mean
 * a button that swaps the form for a summary. That is the wrong shape. The
 * Owner's stated fear is granting more than they meant to, and a preview you
 * have to go and look at is a preview you check once, at the end, after the
 * mistake is already made. So the plain-language summary sits beside the form
 * permanently and rewrites itself on every change. The thing being authored
 * and the thing being understood are on screen together.
 *
 * WHY EACH OPERATION CARRIES ITS OWN FILTERS AND POLICY
 *
 * A single approval setting for the whole relation would be simpler to build
 * and would misstate almost every real grant: accepting an offer is routine
 * while presenting a proof discloses data, and one control cannot say that.
 * The five dimensions live per operation because that is where they differ.
 *
 * WHAT THIS SCREEN DOES NOT DO
 *
 * It does not decide anything. Nothing here validates a grant against policy,
 * and the "worth a second look" notes are advisory — they nudge against
 * over-granting, they do not block. Enforcement is the server's and the UI
 * must not imply otherwise.
 */

/* An empty grant, which is what checking an operation's box produces: the
   widest sensible default is deliberately NOT used. A new grant starts
   restricted to nothing and the Owner opens it up, rather than starting at
   "any" and relying on them to remember to narrow it. */
const newGrant = (operation: ControllerOperation): ScopeGrant => ({
  operation,
  credentialTypes: { mode: "list", values: [] },
  relyingParties: { mode: "list", values: [] },
  approval: isGateable(operation) ? "SINGLE_APPROVER" : "AUTO",
});

const POLICIES: { value: ApprovalPolicy; label: string; hint: string }[] = [
  { value: "AUTO", label: "Automatic", hint: "Goes ahead with no approver." },
  {
    value: "SINGLE_APPROVER",
    label: "One approver",
    hint: "Held until somebody authorised decides it.",
  },
  {
    value: "DUAL_CONTROL",
    label: "Two approvers",
    hint: "Held until two separate people decide it.",
  },
];

export function ScopeBuilderView({ relationId }: { relationId: string }) {
  const {
    relations,
    heldCredentials,
    offers,
    verificationRequests,
    personById,
    updateRelationScope,
    sendRelationForAcceptance,
  } = useDemo();

  const relation = relations.find((r) => r.id === relationId);

  const screenState = useScreenState("C3", ["building", "over_broad", "sent_for_acceptance"]);

  /* The options come from what the entity has actually seen — credential
     types it holds or has been offered, counterparties that have asked it for
     something. A hard-coded list would drift from the fixtures, and an Owner
     granting authority over a credential type the entity has never
     encountered is a demo that teaches a fiction. */
  const credentialTypes = useMemo(() => {
    const types = new Set<string>();
    heldCredentials.forEach((c) => types.add(c.type));
    offers.forEach((o) => types.add(o.type));
    return [...types].sort();
  }, [heldCredentials, offers]);

  const relyingParties = useMemo(() => {
    const parties = new Set<string>();
    verificationRequests.forEach((v) => parties.add(v.relyingParty));
    return [...parties].sort();
  }, [verificationRequests]);

  /* Working copy. The draft is only written back on save, so abandoning a
     half-built scope leaves the stored one alone. */
  const [grants, setGrants] = useState<ScopeGrant[]>(relation?.scope.grants ?? []);
  const [validFrom, setValidFrom] = useState(relation?.scope.validFrom ?? "");
  const [validUntil, setValidUntil] = useState(relation?.scope.validUntil ?? "");
  const [saved, setSaved] = useState(false);

  if (!relation) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "People who can act", href: "/people-who-can-act" },
              { label: "Not found" },
            ]}
            title="Appointment not found"
          />
          <Panel>
            <p className="relative z-[4] text-[13.5px] text-muted">
              This draft no longer exists. It may have been reset with the demo.{" "}
              <Link href="/controllership/relations/new" className="ndi-plainlink text-accent">
                Start a new one
              </Link>
              .
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const person = personById(relation.personId);
  const sent = screenState === "sent_for_acceptance" || relation.state === "PENDING_ACCEPTANCE";

  /* The over-broad state widens the working copy so the advisory notes have
     something to say. Without it the warnings are unreachable on a scope
     built the sensible way, and an unreachable state is an unreviewed one. */
  const effectiveGrants: ScopeGrant[] =
    screenState === "over_broad"
      ? [
          {
            operation: "proof:present",
            credentialTypes: { mode: "any" },
            relyingParties: { mode: "any" },
            approval: "AUTO",
          },
          ...grants.filter((g) => g.operation !== "proof:present"),
        ]
      : grants;

  const previewScope: Scope = {
    version: relation.scope.version,
    validFrom,
    validUntil: screenState === "over_broad" ? null : validUntil || null,
    grants: effectiveGrants,
  };

  const granted = (operation: ControllerOperation) =>
    effectiveGrants.find((g) => g.operation === operation);

  const toggle = (operation: ControllerOperation, on: boolean) => {
    setSaved(false);
    setGrants((current) =>
      on
        ? [...current, newGrant(operation)].sort(
            (a, b) => ALL_OPERATIONS.indexOf(a.operation) - ALL_OPERATIONS.indexOf(b.operation),
          )
        : current.filter((g) => g.operation !== operation),
    );
  };

  const patch = (operation: ControllerOperation, next: Partial<ScopeGrant>) => {
    setSaved(false);
    setGrants((current) =>
      current.map((g) => (g.operation === operation ? { ...g, ...next } : g)),
    );
  };

  /** Toggles one value inside a list filter. */
  const toggleValue = (
    operation: ControllerOperation,
    field: "credentialTypes" | "relyingParties",
    value: string,
  ) => {
    const grant = grants.find((g) => g.operation === operation);
    if (!grant) return;
    const filter = grant[field];
    const values = filter.mode === "list" ? filter.values : [];
    patch(operation, {
      [field]: {
        mode: "list",
        values: values.includes(value) ? values.filter((v) => v !== value) : [...values, value],
      },
    } as Partial<ScopeGrant>);
  };

  const save = () => {
    updateRelationScope(relation.id, previewScope);
    setSaved(true);
  };

  const send = () => {
    updateRelationScope(relation.id, previewScope);
    sendRelationForAcceptance(relation.id);
  };

  /* A grant with an empty list permits nothing, which is a scope that looks
     built and does nothing. Worth blocking the send on, because it is the one
     mistake the preview reads as innocuous — "may present proofs to only"
     is a sentence with a hole in it. */
  const incomplete = effectiveGrants.filter((g) => {
    const typesEmpty =
      takesCredentialTypes(g.operation) &&
      g.credentialTypes.mode === "list" &&
      g.credentialTypes.values.length === 0;
    const partiesEmpty =
      takesRelyingParties(g.operation) &&
      g.relyingParties.mode === "list" &&
      g.relyingParties.values.length === 0;
    return typesEmpty || partiesEmpty;
  });

  const canSend = effectiveGrants.length > 0 && incomplete.length === 0 && validFrom !== "";

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "People who can act", href: "/people-who-can-act" },
            { label: person.name },
            { label: "Scope" },
          ]}
          title={`What ${person.name.split(" ")[0]} may do`}
          actions={<StatusPill status={sent ? "pending_acceptance" : relation.state} />}
        />

        {sent ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex items-start gap-2.5">
                <Icon
                  name="check"
                  size={16}
                  strokeWidth={2.4}
                  className="mt-0.5 flex-none text-accent"
                />
                <div className="flex flex-col gap-1">
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    Sent to {person.name} for acceptance
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    Nothing is granted yet. {person.name.split(" ")[0]} has to review
                    this authority and accept the duties that come with it before
                    it takes effect — and can decline.
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href={`/controllership/relations/${relation.id}/accept`}>
                  <HairlineButton>
                    Open what {person.name.split(" ")[0]} will see
                    <Icon name="arrowRight" size={14} strokeWidth={2} />
                  </HairlineButton>
                </Link>
              </div>
            </div>
          </Panel>
        ) : null}

        <div className="grid gap-5 @min-[880px]/page:grid-cols-[minmax(0,1fr)_400px]">
          {/* ---- The form ---- */}
          <div className="flex flex-col gap-5">
            <Panel>
              <div className="relative z-[4] flex flex-col gap-1">
                <h2 className="font-display text-[15px] font-semibold text-strong">
                  Operations
                </h2>
                <p className="text-[12.5px] leading-[1.5] text-faint">
                  Nothing is granted until you check it. Each operation carries
                  its own limits and its own approval rule.
                </p>
              </div>

              <div className="relative z-[4] mt-3 flex flex-col gap-2">
                {ALL_OPERATIONS.map((operation) => {
                  const grant = granted(operation);
                  const typeFilter = grant?.credentialTypes;
                  const partyFilter = grant?.relyingParties;

                  return (
                    <div
                      key={operation}
                      className="rounded-[12px] border transition-colors duration-150"
                      style={{
                        borderColor: grant ? "var(--ndi-mint-40)" : "var(--border-grid)",
                        background: grant ? "var(--ndi-mint-04)" : "transparent",
                      }}
                    >
                      <Checkbox
                        checked={Boolean(grant)}
                        onChange={(on) => toggle(operation, on)}
                        label={operationLabel(operation)}
                        description={operationDescription(operation)}
                      />

                      {grant ? (
                        <div className="flex flex-col gap-4 border-t border-subtle px-4 py-4">
                          {takesCredentialTypes(operation) && typeFilter ? (
                            <FilterBlock
                              label="Credential types"
                              anyLabel="Any credential type"
                              options={credentialTypes}
                              filter={typeFilter}
                              onAny={() => patch(operation, { credentialTypes: { mode: "any" } })}
                              onList={() =>
                                patch(operation, { credentialTypes: { mode: "list", values: [] } })
                              }
                              onToggle={(value) => toggleValue(operation, "credentialTypes", value)}
                            />
                          ) : null}

                          {takesRelyingParties(operation) && partyFilter ? (
                            <FilterBlock
                              label="Relying parties"
                              anyLabel="Any relying party"
                              options={relyingParties}
                              filter={partyFilter}
                              onAny={() => patch(operation, { relyingParties: { mode: "any" } })}
                              onList={() =>
                                patch(operation, { relyingParties: { mode: "list", values: [] } })
                              }
                              onToggle={(value) => toggleValue(operation, "relyingParties", value)}
                            />
                          ) : null}

                          {isGateable(operation) ? (
                            <div className="flex flex-col gap-2">
                              <span className={LABEL_CLASS}>Approval</span>
                              <SegmentedControl<ApprovalPolicy>
                                label={`Approval policy for ${operationLabel(operation)}`}
                                value={grant.approval}
                                onChange={(approval) => patch(operation, { approval })}
                                segments={POLICIES}
                              />
                            </div>
                          ) : (
                            <p className="text-[12.5px] leading-[1.5] text-faint">
                              Nothing to approve — this is not an action anybody
                              decides on.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Panel>

            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-[15px] font-semibold text-strong">
                    How long it lasts
                  </h2>
                  <p className="text-[12.5px] leading-[1.5] text-faint">
                    An expiry is the simplest protection there is. Everything
                    above stops on this date without anyone having to remember.
                  </p>
                </div>
                <DateRangeField
                  from={validFrom}
                  until={validUntil}
                  onFromChange={(v) => {
                    setSaved(false);
                    setValidFrom(v);
                  }}
                  onUntilChange={(v) => {
                    setSaved(false);
                    setValidUntil(v);
                  }}
                  allowOpenEnded
                />
              </div>
            </Panel>
          </div>

          {/* ---- The preview, always on ---- */}
          <div className="flex flex-col gap-4 @min-[880px]/page:sticky @min-[880px]/page:top-20 @min-[880px]/page:self-start">
            <Panel>
              <div className="relative z-[4] flex flex-col gap-1">
                <h2 className="font-display text-[15px] font-semibold text-strong">
                  What this says
                </h2>
                <p className="text-[12.5px] leading-[1.5] text-faint">
                  Exactly what {person.name.split(" ")[0]} will be asked to accept.
                </p>
              </div>

              <div className="relative z-[4] mt-4">
                {effectiveGrants.length === 0 ? (
                  <p className="text-[13.5px] leading-[1.6] text-muted">
                    Nothing yet. {person.name} would be able to sign in and see
                    nothing at all — which is the right starting point.
                  </p>
                ) : (
                  <ScopeSummary
                    personName={person.name}
                    scope={previewScope}
                    showWarnings
                  />
                )}
              </div>
            </Panel>

            {incomplete.length > 0 ? (
              <Panel>
                <div className="relative z-[4] flex flex-col gap-2">
                  <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                    Not finished
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {incomplete.map((g) => (
                      <li
                        key={g.operation}
                        className="flex items-start gap-2 text-[13px] leading-[1.5] text-body"
                      >
                        <Icon
                          name="info"
                          size={13}
                          strokeWidth={2}
                          className="mt-[3px] flex-none"
                          style={{ color: "var(--ndi-warning)" }}
                        />
                        <span>
                          <strong className="font-medium">{operationLabel(g.operation)}</strong>{" "}
                          permits nothing yet — choose what it applies to, or
                          allow any.
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Panel>
            ) : null}

            {!sent ? (
              <div className="flex flex-col gap-2.5">
                <GradientButton onClick={send} disabled={!canSend}>
                  <Icon name="send" size={15} strokeWidth={2} />
                  Send for acceptance
                </GradientButton>
                <HairlineButton onClick={save}>
                  {saved ? "Draft saved" : "Save as draft"}
                </HairlineButton>
                <p className="text-[12px] leading-[1.5] text-faint">
                  {person.name.split(" ")[0]} reviews this and accepts the duties
                  before any of it takes effect.
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * One filter dimension: everything, or a chosen list.
 *
 * "Any" is a radio rather than the absence of choices, so granting the widest
 * possible filter is a thing the Owner does on purpose and can be seen to
 * have done. An empty list meaning "any" would make the broadest grant in the
 * product the one you get by not touching anything.
 */
function FilterBlock({
  label,
  anyLabel,
  options,
  filter,
  onAny,
  onList,
  onToggle,
}: {
  label: string;
  anyLabel: string;
  options: string[];
  filter: { mode: "any" } | { mode: "list"; values: string[] };
  onAny: () => void;
  onList: () => void;
  onToggle: (value: string) => void;
}) {
  const isAny = filter.mode === "any";

  return (
    <div className="flex flex-col gap-2">
      <span className={LABEL_CLASS}>{label}</span>

      <div className="flex flex-wrap gap-3">
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body">
          <input
            type="radio"
            checked={isAny}
            onChange={onAny}
            className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
          />
          {anyLabel}
        </label>
        <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body">
          <input
            type="radio"
            checked={!isAny}
            onChange={onList}
            className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
          />
          Only these
        </label>
      </div>

      {!isAny ? (
        <div className="flex flex-wrap gap-1.5">
          {options.map((option) => {
            const on = filter.mode === "list" && filter.values.includes(option);
            return (
              <button
                key={option}
                type="button"
                onClick={() => onToggle(option)}
                aria-pressed={on}
                className="ndi-navrow rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                data-active={on ? "1" : "0"}
              >
                {option}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
