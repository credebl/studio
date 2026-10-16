"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { AuthorityChain } from "@/components/ui/AuthorityChain";
import { Checkbox } from "@/components/ui/Checkbox";
import { Countdown } from "@/components/ui/Countdown";
import { DateRangeField } from "@/components/ui/DateRangeField";
import { Dialog } from "@/components/ui/Dialog";
import { DualAttribution } from "@/components/ui/DualAttribution";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { ScopeSummary } from "@/components/ui/ScopeSummary";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { StatusPill } from "@/components/ui/StatusPill";
import { Switch } from "@/components/ui/Switch";
import { useDemo } from "@/lib/demoStore";
import { PELDEN, inOrg, type ApprovalPolicy } from "@/lib/demoData";

/**
 * Every primitive on one page, in whatever states it has.
 *
 * The exit test for the primitives slice, and it stays in the build
 * afterwards: it is the only place a whole-kit change (a token edit, a theme
 * fix, a focus-ring change) can be judged in one look instead of by walking
 * twenty screens hoping to remember what each looked like.
 *
 * Not linked from the nav — it is not part of the story, and an audience that
 * wanders into it learns nothing about the Entity Wallet. Reachable at
 * /kitchen-sink by anyone who needs it.
 */
function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-[15px] font-semibold leading-[1.3] text-strong">
            {title}
          </h2>
          {note ? <p className="text-[12.5px] leading-[1.5] text-faint">{note}</p> : null}
        </div>
        {children}
      </div>
    </Panel>
  );
}

export function KitchenSinkView() {
  const { relations, decisions, auditEntries, personById } = useDemo();

  /* The page declares its own states, so the state switcher has something to
     do here too — and so this page proves the mechanism works before any real
     screen depends on it. */
  const variant = useScreenState("kitchen-sink", ["populated", "empty"]);

  const [operations, setOperations] = useState({ present: true, accept: false });
  const [perTransaction, setPerTransaction] = useState(true);
  const [policy, setPolicy] = useState<ApprovalPolicy>("SINGLE_APPROVER");
  const [from, setFrom] = useState("2026-09-09");
  const [until, setUntil] = useState("2026-12-31");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [dangerOpen, setDangerOpen] = useState(false);

  const rinzin = relations.find((r) => r.id === "rel-rinzin");
  const root = relations.filter(inOrg(PELDEN)).find((r) => r.isRootAuthority);
  const pass = decisions.find((d) => d.outcome === "PASS");
  const fail = decisions.find((d) => d.outcome === "FAIL");
  const auditRow = auditEntries.find((e) => e.approvedById);

  /* Every status the pill knows, so a tone change can be judged at a glance
     rather than discovered on one screen three weeks later. */
  const statuses = [
    "active",
    "draft",
    "pending_acceptance",
    "pending_registration",
    "suspended",
    "terminated",
    "expired",
    "parked",
    "awaiting_signature",
    "awaiting_acceptance",
    "sent",
    "approved",
    "rejected",
    "stale",
    "PASS",
    "FAIL",
    "service_unreachable",
    "allowed",
    "requires_approval",
    "out_of_scope",
    "notice_issued",
    "under_review",
    "upheld_reinstated",
    "window_closed",
    "ready",
    "presented",
    "revoked",
  ];

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Kitchen sink" }]}
          title="Kitchen sink"
          actions={<StatusPill status="draft" label="Not part of the story" />}
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Every primitive, in every state it has. Switch the theme in the top bar
          to check both. The demo controls at the bottom of the window will flip
          this page between populated and empty, which is the state switcher
          working.
        </p>

        <Section
          title="Status"
          note="Every status the pill knows. The label carries the meaning; the dot only reinforces it."
        >
          {variant === "empty" ? (
            <p className="text-[13px] text-faint">Nothing to show.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {statuses.map((s) => (
                <StatusPill key={s} status={s} />
              ))}
            </div>
          )}
        </Section>

        <Section
          title="Scope summary — read mode"
          note="One sentence per grant, each with its own approval clause. The wording comes from scopeModel.ts, which is a pure function."
        >
          {rinzin ? (
            <ScopeSummary
              personName={personById(rinzin.personId).name}
              scope={rinzin.scope}
              state={rinzin.state}
            />
          ) : null}
        </Section>

        <Section
          title="Scope summary — table mode, with authoring warnings"
          note="The same model as rows, for comparing an approval column down the page. Warnings are advisory and appear only while authoring."
        >
          {rinzin ? (
            <ScopeSummary
              personName={personById(rinzin.personId).name}
              scope={{
                ...rinzin.scope,
                /* Deliberately widened so the warnings have something to say. */
                validUntil: null,
                grants: rinzin.scope.grants.map((g) =>
                  g.operation === "proof:present"
                    ? { ...g, relyingParties: { mode: "any" as const }, approval: "AUTO" as const }
                    : g,
                ),
              }}
              mode="table"
              showWarnings
            />
          ) : null}
        </Section>

        <Section title="Scope summary — full authority" note="Collapses to one sentence, deliberately.">
          {root ? (
            <ScopeSummary
              personName={personById(root.personId).name}
              scope={root.scope}
              isRootAuthority
              state={root.state}
            />
          ) : null}
        </Section>

        <Section
          title="Dual attribution"
          note="The entity leads, the person follows. Never one without the other."
        >
          <div className="flex flex-col gap-4">
            <DualAttribution entity="Pelden Trading Pvt. Ltd." actorId="rinzin" />
            {auditRow ? (
              <DualAttribution
                entity={auditRow.entity}
                actorId={auditRow.actorId}
                approvedById={auditRow.approvedById}
              />
            ) : null}
            <DualAttribution
              entity="Pelden Trading Pvt. Ltd."
              actorId="somebody-who-left"
              size="compact"
            />
            <p className="text-[12px] text-faint">
              The last one resolves an unknown id — a missing name should read as
              one bad row, not take the trail down.
            </p>
          </div>
        </Section>

        <Section
          title="Authority chain"
          note="Whole, then broken. The severed link is marked by its pill, its icon and its connector — never by colour alone."
        >
          <div className="grid gap-6 min-[901px]:grid-cols-2">
            {pass ? <AuthorityChain chain={pass.chain} /> : null}
            {fail ? <AuthorityChain chain={fail.chain} /> : null}
          </div>
        </Section>

        <Section title="Authority chain — nothing walked" note="Fail closed, and say why.">
          <AuthorityChain chain={[]} />
        </Section>

        <Section
          title="Countdown"
          note="One unit, ticking each minute. Renders nothing on the first paint, because time-until cannot match between server and client."
        >
          <div className="flex flex-wrap items-center gap-5">
            <Countdown expiresAt="2026-12-31" />
            <Countdown expiresAt="2026-09-11" />
            <Countdown expiresAt="2020-01-01" />
          </div>
        </Section>

        <Section title="Checkbox" note="A real input, visually hidden under a drawn box.">
          <div className="flex max-w-[520px] flex-col">
            <Checkbox
              checked={operations.present}
              onChange={(v) => setOperations((o) => ({ ...o, present: v }))}
              label="Present proofs"
              description="Answer a relying party's request using a credential the entity holds."
            />
            <Checkbox
              checked={operations.accept}
              onChange={(v) => setOperations((o) => ({ ...o, accept: v }))}
              label="Accept offers"
              description="Take a credential offered to the entity into its wallet."
            />
            <Checkbox
              checked={false}
              onChange={() => {}}
              label="Decide approvals"
              description="Not available while the relation is pending acceptance."
              disabled
            />
          </div>
        </Section>

        <Section title="Switch" note="For a setting that takes effect as itself, not on submit.">
          <div className="flex max-w-[520px] flex-col gap-4">
            <Switch
              id="ks-per-transaction"
              checked={perTransaction}
              onChange={setPerTransaction}
              label="Cap applies per transaction"
              description="Otherwise the cap covers everything done under this authority."
            />
            <Switch
              id="ks-disabled"
              checked={false}
              onChange={() => {}}
              label="Require a counterparty"
              description="Locked while no counterparty is named."
              disabled
            />
          </div>
        </Section>

        <Section
          title="Segmented control"
          note="Three options on a scale, all visible. Arrow keys move between them; the group is one tab stop."
        >
          <SegmentedControl<ApprovalPolicy>
            label="Approval policy"
            value={policy}
            onChange={setPolicy}
            segments={[
              { value: "AUTO", label: "Automatic", hint: "Goes out with no approver." },
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
            ]}
          />
        </Section>

        <Section title="Date range" note="Native date inputs. Open-ended is a choice, not an empty field.">
          <div className="max-w-[520px]">
            <DateRangeField
              from={from}
              until={until}
              onFromChange={setFrom}
              onUntilChange={setUntil}
              allowOpenEnded
            />
          </div>
        </Section>

        <Section
          title="Dialog"
          note="Native <dialog> + showModal(): the platform's focus trap, Escape, top layer and focus restore."
        >
          <div className="flex flex-wrap gap-2.5">
            <button
              type="button"
              onClick={() => setConfirmOpen(true)}
              className="ndi-hairline-btn inline-flex h-11 items-center rounded-[10px] px-4 font-display text-[13.5px] font-medium"
            >
              Open a confirm
            </button>
            <button
              type="button"
              onClick={() => setDangerOpen(true)}
              className="ndi-hairline-btn inline-flex h-11 items-center rounded-[10px] px-4 font-display text-[13.5px] font-medium"
            >
              Open an irreversible one
            </button>
          </div>

          <Dialog
            open={confirmOpen}
            onClose={() => setConfirmOpen(false)}
            title="Send this authority for acceptance?"
            lead="Rinzin Dema will be asked to review it and accept the duties that come with it. Nothing takes effect until she does."
            confirmLabel="Send for acceptance"
            onConfirm={() => setConfirmOpen(false)}
          />

          <Dialog
            open={dangerOpen}
            onClose={() => setDangerOpen(false)}
            tone="danger"
            title="Terminate this controllership?"
            lead="This cannot be undone. A new relation would have to be created and accepted from the beginning."
            consequences={[
              "Rinzin Dema's sessions end immediately",
              "Two approvals waiting on her are cancelled",
              "One parked operation is declined rather than run",
              "Any authority issued under this relation stops verifying anywhere",
            ]}
            confirmLabel="Terminate relation"
            onConfirm={() => setDangerOpen(false)}
          />
        </Section>
      </div>
    </AppShell>
  );
}
