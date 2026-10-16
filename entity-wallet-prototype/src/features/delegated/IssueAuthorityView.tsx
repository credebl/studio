"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/ui/StatusPill";
import { Switch } from "@/components/ui/Switch";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { useDemo } from "@/lib/demoStore";
import { isPlatformAdmin, type AuthorityKind } from "@/lib/demoData";

import { TASK_SCOPES, formatNu, taskScopeLabel } from "./constraints";

/**
 * D2 — issue a Role or Capability into somebody's own wallet.
 *
 * THE PANEL THAT MATTERS IS THE CONSTRAINT PREVIEW.
 *
 * Everything an Owner sets here ends up readable by any counterparty the
 * holder deals with. That is the difference between Pattern B and a password:
 * the limits travel with the credential and are checked by whoever it is
 * shown to, not by us. So the screen shows, permanently and beside the form,
 * exactly what a verifier will read — because an Owner who cannot see that is
 * granting something they cannot reason about.
 *
 * It is rendered as the fields a verifier matches on rather than as raw JSON.
 * A verifier does receive structured data, but showing an Owner a code block
 * makes the constraints look like an implementation detail when they are the
 * entire security model.
 *
 * WHY EXPIRY IS PREFILLED SHORT
 *
 * A capability defaults to 90 days and a role to a year. Expiry is the first
 * line of defence in this model — the thing that limits the damage when a
 * revocation is late or never happens — so the default is short and the Owner
 * lengthens it deliberately. There is no open-ended option here at all,
 * unlike a controllership: an authority sitting in somebody's wallet forever
 * is the one shape of this credential nobody should be able to create by
 * accident.
 */
const COUNTERPARTIES = [
  "Bhutan National Single Window",
  "Bank of Bhutan",
  "Department of Revenue & Customs",
];

const plusDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

export function IssueAuthorityView() {
  const { people, delegatedAuthorities, issueAuthority, acceptAuthority, personById } = useDemo();

  const screenState = useScreenState("D2", [
    "building",
    "parked_for_approval",
    "offer_sent",
    "accepted",
  ]);

  const [kind, setKind] = useState<AuthorityKind>("capability");
  const [recipientId, setRecipientId] = useState("pema");
  const [title, setTitle] = useState("Declaration authority");
  /* Whether the operator has made a choice about the parent yet. Until they
     have, a capability defaults to hanging off the recipient's existing role
     rather than off nothing.

     That default is the correct product behaviour — a capability almost
     always derives from a role, and chaining it is what lets withdrawing the
     role withdraw everything under it. It is also load-bearing for the demo:
     with the default at "nothing", the capability issued in act 4 did not
     depend on the Customs broker role, so revoking that role in act 5 left it
     verifying happily and the whole point of the act evaporated. */
  const [parentTouched, setParentTouched] = useState(false);
  const [parentChoice, setParentChoice] = useState<string | null>(null);
  const [tasks, setTasks] = useState<string[]>(["customs:declaration"]);
  const [capped, setCapped] = useState(true);
  const [cap, setCap] = useState("500000");
  const [perTransaction, setPerTransaction] = useState(true);
  const [anyCounterparty, setAnyCounterparty] = useState(false);
  const [counterparties, setCounterparties] = useState<string[]>([
    "Bhutan National Single Window",
  ]);
  const [validFrom, setValidFrom] = useState(plusDays(0));
  const [validUntil, setValidUntil] = useState(plusDays(90));
  const [issuedId, setIssuedId] = useState<string | null>(null);

  const recipient = personById(recipientId);
  /* People on the platform with a confirmed identity — never NDI's own
     administrators, who act for no business, and never someone who has no
     account yet (on a first day that is almost everyone in the story). */
  const candidates = people.filter((p) => p.cidVerified && p.hasAccount !== false && !isPlatformAdmin(p));

  /* A capability hangs off a role the same person already holds. Offering
     roles belonging to somebody else would build a chain that breaks the
     moment it is walked — the holder of a capability has to be the holder of
     its parent, or the authority never traced to them in the first place. */
  const parentOptions = delegatedAuthorities.filter(
    (a) => a.kind === "role" && a.recipientId === recipientId && a.status === "ACTIVE",
  );

  const parentId = parentTouched ? parentChoice : (parentOptions[0]?.id ?? null);

  const issued = issuedId ? delegatedAuthorities.find((a) => a.id === issuedId) : null;

  /* The screen state drives the after-issuance faces so each is reachable
     without walking the flow. */
  const stage =
    screenState !== "building"
      ? screenState
      : issued
        ? issued.acceptance === "accepted"
          ? "accepted"
          : "offer_sent"
        : "building";

  const capAmount = Number(cap) || 0;
  const canIssue =
    title.trim() !== "" &&
    tasks.length > 0 &&
    (anyCounterparty || counterparties.length > 0) &&
    validUntil > validFrom &&
    (!capped || capAmount > 0);

  const issue = () => {
    const authority = issueAuthority({
      kind,
      title: title.trim(),
      recipientId,
      parentId: kind === "capability" ? parentId : null,
      taskScopes: tasks,
      valueCap: capped ? { amount: capAmount, currency: "BTN", perTransaction } : null,
      counterparties: anyCounterparty
        ? { mode: "any" }
        : { mode: "list", values: counterparties },
      validFrom,
      validUntil,
    });
    setIssuedId(authority.id);
  };

  const toggleTask = (value: string) =>
    setTasks((current) =>
      current.includes(value) ? current.filter((t) => t !== value) : [...current, value],
    );

  const toggleCounterparty = (value: string) =>
    setCounterparties((current) =>
      current.includes(value) ? current.filter((c) => c !== value) : [...current, value],
    );

  /* ---- After issuance ---- */
  if (stage !== "building") {
    const sentTo = issued ? personById(issued.recipientId) : recipient;
    const authorityTitle = issued?.title ?? title;

    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[760px] flex-col gap-5">
          <PageHeader
            crumbs={[
              { label: "Delegated authority", href: "/delegated-authority" },
              { label: authorityTitle },
            ]}
            title={
              stage === "parked_for_approval"
                ? "Waiting for approval"
                : stage === "accepted"
                  ? "Accepted and in force"
                  : "Sent to their wallet"
            }
            actions={
              <StatusPill
                status={
                  stage === "parked_for_approval"
                    ? "parked"
                    : stage === "accepted"
                      ? "accepted"
                      : "awaiting_acceptance"
                }
              />
            }
          />

          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              {stage === "parked_for_approval" ? (
                <>
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    This needs a second signature before it goes out
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    Issuing authority above {formatNu(1000000)} is held back
                    until two people have signed for it. Nothing has been sent
                    to {sentTo.name} yet.
                  </p>
                </>
              ) : stage === "accepted" ? (
                <>
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    {sentTo.name} accepted it
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    The credential is in their own wallet now, and its
                    constraints are readable by any counterparty they use it
                    with. It stays valid until it expires or the entity
                    withdraws it.
                  </p>
                </>
              ) : (
                <>
                  <p className="font-display text-[14.5px] font-semibold text-strong">
                    Waiting for {sentTo.name} to accept
                  </p>
                  <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                    The offer is in their wallet. Accepting it is their
                    consent — until they do, they hold no authority at all, and
                    nothing can be used in their name.
                  </p>
                </>
              )}

              <div className="mt-1 flex flex-wrap gap-2.5">
                {stage === "offer_sent" && issued ? (
                  /* The recipient accepting happens on their phone, which we
                     do not redesign. This stands in for that moment so the
                     console's own states can be walked. */
                  <HairlineButton onClick={() => acceptAuthority(issued.id)}>
                    <Icon name="check" size={14} strokeWidth={2} />
                    Simulate {sentTo.name.split(" ")[0]} accepting
                  </HairlineButton>
                ) : null}
                <Link href="/delegated-authority">
                  <HairlineButton>Back to the register</HairlineButton>
                </Link>
                {stage === "accepted" ? (
                  <Link href="/verifier/bnsw">
                    <GradientButton>
                      See it checked at a counterparty
                      <Icon name="arrowRight" size={15} strokeWidth={2} />
                    </GradientButton>
                  </Link>
                ) : null}
              </div>
            </div>
          </Panel>

          {issued ? <ConstraintPreview
            kind={issued.kind}
            title={issued.title}
            recipientName={sentTo.name}
            tasks={issued.taskScopes}
            cap={issued.valueCap}
            counterparties={
              issued.counterparties.mode === "any" ? null : issued.counterparties.values
            }
            validFrom={issued.validFrom}
            validUntil={issued.validUntil}
            parentTitle={
              issued.parentId
                ? delegatedAuthorities.find((a) => a.id === issued.parentId)?.title ?? null
                : null
            }
          /> : null}
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1320px] flex-col gap-5">
        <PageHeader
          crumbs={[
            { label: "Delegated authority", href: "/delegated-authority" },
            { label: "Issue" },
          ]}
          title="Issue authority to a person"
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          This puts a credential in someone&rsquo;s own wallet. They use it at
          counterparties, who check it themselves — the entity is not asked
          each time. That is why the limits below travel with the credential
          and why they matter more than they look.
        </p>

        <div className="grid gap-5 min-[1201px]:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex flex-col gap-5">
            {/* ---- Who and what ---- */}
            <Panel>
              <div className="relative z-[4] flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                  <span className={LABEL_CLASS}>Kind</span>
                  <SegmentedControl<AuthorityKind>
                    label="Kind of authority"
                    value={kind}
                    onChange={(next) => {
                      setKind(next);
                      /* A role has no parent, so switching away from
                         capability has to drop one that was chosen. */
                      if (next === "role") {
                        setParentTouched(false);
                        setParentChoice(null);
                      }
                      setValidUntil(plusDays(next === "role" ? 365 : 90));
                    }}
                    segments={[
                      {
                        value: "capability",
                        label: "Capability",
                        hint: "One narrow, short-lived permission — a task, a cap, a counterparty. What most delegation should be.",
                      },
                      {
                        value: "role",
                        label: "Role",
                        hint: "A standing position that capabilities can hang off. Longer-lived, and worth fewer of.",
                      },
                    ]}
                  />
                </div>

                <div className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Recipient</span>
                  <div className="flex flex-col gap-1.5">
                    {candidates.map((person) => (
                      <label
                        key={person.id}
                        className="flex min-h-[52px] cursor-pointer items-center gap-3 rounded-[11px] border px-3.5 py-2.5"
                        style={{
                          borderColor:
                            recipientId === person.id
                              ? "var(--ndi-mint-40)"
                              : "var(--border-grid)",
                          background:
                            recipientId === person.id ? "var(--ndi-mint-08)" : "transparent",
                        }}
                      >
                        <input
                          type="radio"
                          name="recipient"
                          checked={recipientId === person.id}
                          onChange={() => {
                            setRecipientId(person.id);
                            /* Roles belong to a person, so a parent chosen for
                               the previous recipient means nothing here. */
                            setParentTouched(false);
                            setParentChoice(null);
                          }}
                          className="h-4 w-4 flex-none accent-[var(--ndi-mint)]"
                        />
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="font-display text-[13.5px] font-medium text-body">
                            {person.name}
                          </span>
                          <span className="text-[12px] leading-tight text-faint">
                            {person.title}
                          </span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="text-[12px] leading-[1.5] text-faint">
                    Only people whose identity has been confirmed can be given
                    authority.
                  </p>
                </div>

                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Name it</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Declaration authority"
                    className={`${FIELD_CLASS} h-11`}
                  />
                  <span className="text-[12px] leading-[1.5] text-faint">
                    Counterparties see this name. Say what it is for, not who it
                    is for.
                  </span>
                </label>

                {kind === "capability" ? (
                  <div className={FIELD_BLOCK_CLASS}>
                    <span className={LABEL_CLASS}>Hangs off</span>
                    {parentOptions.length === 0 ? (
                      <p className="text-[12.5px] leading-[1.5] text-faint">
                        {recipient.name} holds no role for this to hang off. It
                        will trace straight to the entity&rsquo;s own authority.
                      </p>
                    ) : (
                      <div className="flex flex-col gap-1.5">
                        <label className="flex cursor-pointer items-center gap-2.5 text-[13px] text-body">
                          <input
                            type="radio"
                            name="parent"
                            checked={parentId === null}
                            onChange={() => {
                              setParentTouched(true);
                              setParentChoice(null);
                            }}
                            className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
                          />
                          Nothing — trace straight to the entity
                        </label>
                        {parentOptions.map((option) => (
                          <label
                            key={option.id}
                            className="flex cursor-pointer items-center gap-2.5 text-[13px] text-body"
                          >
                            <input
                              type="radio"
                              name="parent"
                              checked={parentId === option.id}
                              onChange={() => {
                                setParentTouched(true);
                                setParentChoice(option.id);
                              }}
                              className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
                            />
                            {option.title}
                          </label>
                        ))}
                      </div>
                    )}
                    <p className="text-[12px] leading-[1.5] text-faint">
                      Whatever this hangs off, it depends on. Withdraw the parent
                      and this stops verifying too.
                    </p>
                  </div>
                ) : null}
              </div>
            </Panel>

            {/* ---- What it permits ---- */}
            <Panel>
              <div className="relative z-[4] flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <h2 className="font-display text-[15px] font-semibold text-strong">
                    What it permits
                  </h2>
                  <p className="text-[12.5px] leading-[1.5] text-faint">
                    Each of these is checked by the counterparty, every time.
                  </p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <span className={LABEL_CLASS}>Tasks</span>
                  <div className="flex flex-col">
                    {TASK_SCOPES.map((task) => (
                      <Checkbox
                        key={task.value}
                        checked={tasks.includes(task.value)}
                        onChange={() => toggleTask(task.value)}
                        label={task.label}
                        description={task.hint}
                      />
                    ))}
                  </div>
                </div>

                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <Switch
                    id="d2-capped"
                    checked={capped}
                    onChange={setCapped}
                    label="Limit the value"
                    description="Without a cap, this authority covers a transaction of any size."
                  />
                  {capped ? (
                    <div className="flex flex-col gap-3">
                      <label className={FIELD_BLOCK_CLASS}>
                        <span className={LABEL_CLASS}>Cap (Nu.)</span>
                        <input
                          type="text"
                          inputMode="numeric"
                          value={cap}
                          onChange={(e) => setCap(e.target.value.replace(/[^0-9]/g, ""))}
                          className={`${FIELD_CLASS} h-11`}
                        />
                      </label>
                      <Switch
                        id="d2-per-transaction"
                        checked={perTransaction}
                        onChange={setPerTransaction}
                        label="Per transaction"
                        description={
                          perTransaction
                            ? "Each transaction may be up to the cap."
                            : "The cap covers everything done under this authority, added up."
                        }
                      />
                    </div>
                  ) : null}
                </div>

                <div className="flex flex-col gap-2 border-t border-subtle pt-4">
                  <span className={LABEL_CLASS}>Counterparties</span>
                  <div className="flex flex-wrap gap-3">
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body">
                      <input
                        type="radio"
                        checked={!anyCounterparty}
                        onChange={() => setAnyCounterparty(false)}
                        className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
                      />
                      Only these
                    </label>
                    <label className="flex cursor-pointer items-center gap-2 text-[13px] text-body">
                      <input
                        type="radio"
                        checked={anyCounterparty}
                        onChange={() => setAnyCounterparty(true)}
                        className="h-3.5 w-3.5 accent-[var(--ndi-mint)]"
                      />
                      Anyone
                    </label>
                  </div>
                  {!anyCounterparty ? (
                    <div className="flex flex-wrap gap-1.5">
                      {COUNTERPARTIES.map((option) => (
                        <button
                          key={option}
                          type="button"
                          onClick={() => toggleCounterparty(option)}
                          aria-pressed={counterparties.includes(option)}
                          className="ndi-navrow rounded-full px-3 py-1.5 text-[12.5px] font-medium"
                          data-active={counterparties.includes(option) ? "1" : "0"}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p
                      className="text-[12.5px] leading-[1.5]"
                      style={{ color: "var(--ndi-warning)" }}
                    >
                      Binding an authority to named counterparties is most of its
                      value. Unbound, it can be used anywhere it is accepted.
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-2 border-t border-subtle pt-4">
                  <DateRangeField
                    from={validFrom}
                    until={validUntil}
                    onFromChange={setValidFrom}
                    onUntilChange={setValidUntil}
                    untilLabel="Expires"
                  />
                  <p className="text-[12px] leading-[1.5] text-faint">
                    Short by default, and deliberately no open-ended option.
                    Expiry is what limits the damage when a withdrawal comes
                    late.
                  </p>
                </div>
              </div>
            </Panel>
          </div>

          {/* ---- The preview, always on ---- */}
          <div className="flex flex-col gap-4 min-[1201px]:sticky min-[1201px]:top-20 min-[1201px]:self-start">
            <ConstraintPreview
              kind={kind}
              title={title}
              recipientName={recipient.name}
              tasks={tasks}
              cap={capped ? { amount: capAmount, currency: "BTN", perTransaction } : null}
              counterparties={anyCounterparty ? null : counterparties}
              validFrom={validFrom}
              validUntil={validUntil}
              parentTitle={
                parentId ? parentOptions.find((o) => o.id === parentId)?.title ?? null : null
              }
            />

            <div className="flex flex-col gap-2.5">
              <GradientButton onClick={issue} disabled={!canIssue}>
                <Icon name="send" size={15} strokeWidth={2} />
                Issue to {recipient.name.split(" ")[0]}
              </GradientButton>
              <p className="text-[12px] leading-[1.5] text-faint">
                It goes to their wallet as an offer. They hold nothing until they
                accept it.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

/**
 * What a counterparty will read off this credential.
 *
 * Framed from the verifier's side on purpose — "any counterparty can read
 * this" rather than "your settings". An Owner setting a cap is not
 * configuring a preference, they are writing a term into a credential that
 * strangers will enforce, and the panel should say so.
 */
function ConstraintPreview({
  kind,
  title,
  recipientName,
  tasks,
  cap,
  counterparties,
  validFrom,
  validUntil,
  parentTitle,
}: {
  kind: AuthorityKind;
  title: string;
  recipientName: string;
  tasks: string[];
  cap: { amount: number; currency: "BTN"; perTransaction: boolean } | null;
  /** null means any counterparty. */
  counterparties: string[] | null;
  validFrom: string;
  validUntil: string;
  parentTitle: string | null;
}) {
  const rows: { label: string; value: string; weak?: boolean }[] = [
    { label: "Kind", value: kind === "role" ? "Role" : "Capability" },
    { label: "Name", value: title.trim() || "—", weak: title.trim() === "" },
    { label: "Held by", value: recipientName },
    {
      label: "Tasks",
      value: tasks.length > 0 ? tasks.map(taskScopeLabel).join(", ") : "None chosen",
      weak: tasks.length === 0,
    },
    {
      label: "Value cap",
      value: cap
        ? `${formatNu(cap.amount)} ${cap.perTransaction ? "per transaction" : "in total"}`
        : "None",
      weak: !cap,
    },
    {
      label: "Counterparties",
      value:
        counterparties === null
          ? "Anyone"
          : counterparties.length > 0
            ? counterparties.join(", ")
            : "None chosen",
      weak: counterparties === null || counterparties.length === 0,
    },
    { label: "Valid", value: `${validFrom} to ${validUntil}` },
  ];

  if (parentTitle) rows.push({ label: "Depends on", value: parentTitle });

  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-1">
        <h2 className="font-display text-[15px] font-semibold text-strong">
          What a counterparty reads
        </h2>
        <p className="text-[12.5px] leading-[1.5] text-faint">
          Public. Any verifier this is shown to can read all of it, and checks
          against it without asking the entity.
        </p>
      </div>

      <dl className="relative z-[4] mt-4 m-0 flex flex-col">
        {rows.map((row, i) => (
          <div
            key={row.label}
            className={`grid gap-0.5 py-2.5 min-[421px]:grid-cols-[120px_1fr] min-[421px]:gap-4 ${
              i > 0 ? "border-t border-subtle" : ""
            }`}
          >
            <dt className="text-[12.5px] leading-[1.5] text-faint">{row.label}</dt>
            <dd
              className="m-0 break-words text-[13px] leading-[1.5]"
              style={{ color: row.weak ? "var(--ndi-warning)" : "var(--text-body)" }}
            >
              {row.value}
            </dd>
          </div>
        ))}
      </dl>

      <p className="relative z-[4] mt-3 text-[12px] leading-[1.5] text-faint">
        Nothing about the holder beyond their name travels with this — not their
        citizenship number, not what else they may do.
      </p>
    </Panel>
  );
}
