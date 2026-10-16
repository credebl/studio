"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";

/**
 * SCR-INV-02 — Approvals. FLOW-ONB-02 step 2: dual control for bringing on
 * a root of trust.
 *
 * A RARE TASK DONE BY SOMEONE WITH NO ROUTINE FOR IT
 *
 * An administrator approves a designation a handful of times in the life of
 * the platform (UN-08). So the screen does not rely on them knowing the
 * procedure: it shows the whole of what is being designated and who
 * proposed it, and it restates the consequence in plain words at the moment
 * of the decision rather than trusting that the word "designation" carries
 * it.
 *
 * THE CONTROL YOU MAY NOT USE IS NOT OFFERED
 *
 * Viewed by the administrator who proposed it, the item is shown in full
 * with approve disabled and the reason in its place — never enabled and then
 * refused on press (UXD-03, UC-07). Refuse is disabled too: refusing your own
 * proposal is withdrawing it, and that is the one action left. The store
 * refuses self-approval regardless and records the attempt as a control
 * failure, because the screen is not the boundary.
 *
 * ADMINISTRATORS, AND NEVER THE ROOT ACCOUNT
 *
 * FLOW-ONB-02 v0.6 brought administrator invitations (Kind A) here too:
 * making someone a platform admin is a platform-wide power, so it takes a
 * second admin like a designation does (S2). And the root account approves
 * nothing — the nav doesn't offer it this page, and reached by address it
 * says so instead of showing controls the store would refuse (E13).
 */
export function AdminApprovalsView() {
  const { orgInvitations, harness, personById, currentPerson, approveInvitation, refuseInvitation, withdrawInvitation } = useDemo();

  const forced = useScreenState("SCR-INV-02", [
    "default",
    "loading",
    "empty",
    "self_issued",
    "error",
    "offline",
  ]);

  const [confirming, setConfirming] = useState<{ id: string; action: "approve" | "refuse" } | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const waiting = forced === "empty" ? [] : orgInvitations.filter((i) => i.state === "PENDING_APPROVAL");
  const target = confirming ? orgInvitations.find((i) => i.id === confirming.id) : null;
  const offline = forced === "offline";
  const isRoot = currentPerson.platformRole === "root";
  /* What each item grants, named as the approver should read it. */
  const what = (i: { kind: string; legalName: string | null; email: string }) =>
    i.kind === "A" ? i.email : i.legalName ?? "this designation";

  if (isRoot) {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
          <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Approvals" }]} title="Approvals" />
          <Panel>
            <p role="status" className="relative z-[4] m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">
              The root account doesn&rsquo;t approve anything. Every approval is made by a second named
              platform administrator.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Approvals" }]} title="Approvals" />
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Designations and new administrators another administrator has proposed. Each one needs a
          second person, so that no single account can bring a root of trust onto the platform or make
          someone an administrator.
        </p>

        {done ? (
          <p role="status" className="flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-accent" style={{ background: "var(--ndi-mint-08)" }}>
            <Icon name="check" size={14} strokeWidth={2.4} />
            {done}
          </p>
        ) : null}
        {forced === "error" ? (
          <p role="alert" className="rounded-[12px] border px-4 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
            Your decision wasn&rsquo;t recorded — nothing changed. Try again.
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so decisions are switched off. Nothing here will change until
            you&rsquo;re back.
          </p>
        ) : null}

        {forced === "loading" ? (
          <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
        ) : waiting.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="userCheck"
              title="Nothing awaiting approval"
              message="Nothing is waiting for your approval."
            />
          </Panel>
        ) : (
          waiting.map((inv) => {
            const selfIssued = forced === "self_issued" || inv.invitedBy === harness.persona;
            return (
              <Panel key={inv.id}>
                <div className="relative z-[4] flex flex-col gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex flex-col gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {inv.kind === "A" ? "Platform admin proposed" : "Designation proposed"}
                      </p>
                      <p className="font-display text-[17px] font-semibold text-strong">{what(inv)}</p>
                    </div>
                    <StatusPill status="pending_approval" label="Awaiting a second administrator" />
                  </div>

                  <DetailList
                    items={
                      inv.kind === "A"
                        ? [
                            { label: "Person", value: inv.email },
                            { label: "Role", value: "Platform admin" },
                            { label: "Proposed by", value: `${personById(inv.invitedBy).name}, ${formatDate(inv.createdAt)}` },
                          ]
                        : [
                            { label: "Legal identity", value: inv.legalIdentity ?? "—" },
                            { label: "Brought on for", value: inv.purpose ?? "—" },
                            { label: "Invitation to", value: inv.email },
                            { label: "Proposed by", value: `${personById(inv.invitedBy).name}, ${formatDate(inv.createdAt)}` },
                          ]
                    }
                  />

                  {selfIssued ? (
                    <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                      {/* In place of the approve control, not after pressing it. */}
                      <p className="flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                        <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
                        You issued this invitation, so a different administrator must approve it.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <GradientButton disabled aria-describedby={`why-${inv.id}`}>
                          Approve
                        </GradientButton>
                        <HairlineButton disabled>Refuse</HairlineButton>
                        <HairlineButton onClick={() => withdrawInvitation(inv.id)} disabled={offline}>
                          Withdraw it
                        </HairlineButton>
                      </div>
                      <span id={`why-${inv.id}`} className="sr-only">
                        Approve is unavailable because you proposed this.
                      </span>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                      <p className="text-[13px] leading-[1.6] text-muted">
                        Approving sends the invitation. Refusing means it is never sent.
                      </p>
                      <div className="flex flex-wrap gap-2.5">
                        <GradientButton
                          onClick={() => setConfirming({ id: inv.id, action: "approve" })}
                          disabled={offline}
                        >
                          <Icon name="check" size={15} strokeWidth={2.2} />
                          Approve
                        </GradientButton>
                        <HairlineButton
                          onClick={() => setConfirming({ id: inv.id, action: "refuse" })}
                          disabled={offline}
                        >
                          Refuse
                        </HairlineButton>
                      </div>
                    </div>
                  )}
                </div>
              </Panel>
            );
          })
        )}

        <Dialog
          open={confirming?.action === "approve"}
          onClose={() => setConfirming(null)}
          title={`Approve ${target ? what(target) : "this"}?`}
          lead={
            target?.kind === "A"
              ? `${target.email} will be able to administer the platform, including approving what other administrators propose.`
              : "This organisation will be able to issue credentials that everyone on the platform trusts."
          }
          consequences={[
            `The invitation goes to ${target?.email ?? "the named person"} now`,
            "It is recorded with your name as the second administrator — permanently",
            target?.kind === "A"
              ? "They become an administrator only once they accept"
              : "The organisation still issues nothing until its designation is activated",
          ]}
          confirmLabel="Approve and send"
          onConfirm={() => {
            if (!confirming) return;
            const result = approveInvitation(confirming.id);
            setDone(result.ok ? `Approved — the invitation to ${target?.email} has been sent.` : null);
            setConfirming(null);
          }}
        />
        <Dialog
          open={confirming?.action === "refuse"}
          onClose={() => setConfirming(null)}
          tone="danger"
          title={`Refuse ${target ? what(target) : "this"}?`}
          lead="The invitation is never sent. If it should go ahead later, it has to be proposed again — and approved again."
          confirmLabel="Refuse"
          onConfirm={() => {
            if (!confirming) return;
            refuseInvitation(confirming.id);
            setDone(`Refused — nothing was sent to ${target?.email}.`);
            setConfirming(null);
          }}
        />
      </div>
    </AppShell>
  );
}
