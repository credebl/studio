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
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { kindOf } from "@/features/onboarding/orgKinds";
import { useDemo } from "@/lib/demoStore";

/**
 * Manual review — the NDI side of Flow 2's fallback.
 *
 * WHY THE REGISTER'S ANSWER SITS AT THE TOP OF EVERY CASE
 *
 * A reviewer is being asked to do by hand what a register would normally do
 * automatically. The first thing they need is why the automatic path failed:
 * "listed nothing for this person" and "listed other organisations, not this
 * one" call for different scrutiny. So what the register said is shown
 * before what the applicant claims, and the applicant's identity is shown as
 * proved — it came from their wallet, not from the form — so the reviewer is
 * judging only the link between that person and that organisation.
 *
 * A REFUSAL MUST CARRY ITS REASON
 *
 * Refuse cannot be confirmed without one, because the applicant is shown it
 * and "not approved" alone is a dead end. The button is disabled with the
 * requirement stated beside it, not enabled and then refused (UXD-03).
 *
 * WHAT IS RECORDED
 *
 * The decision is recorded against the reviewer by name and date, and the
 * applicant sees that name. Dual control is not applied here — unlike
 * designating a root of trust, approving a holder only lets an organisation
 * hold credentials, and a second signature on every case would make review
 * the bottleneck the decision was trying to remove. Whether that holds is a
 * Gate 2 question; the screen is built so adding it would be one more row.
 */
export function ManualReviewsView() {
  const { manualReviews, personById, decideManualReview, currentPerson } = useDemo();
  /* The root account does no routine work (FLOW-ONB-02 S9): it can read the
     queue, and the controls say why they aren't its to use. */
  const isRoot = currentPerson.platformRole === "root";

  const forced = useScreenState("SCR-MR-01", ["default", "loading", "empty", "error", "offline"]);

  const [confirming, setConfirming] = useState<{ id: string; action: "approve" | "refuse" } | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const cases = forced === "empty" ? [] : manualReviews;
  const waiting = cases.filter((m) => m.state === "UNDER_REVIEW");
  const decided = cases.filter((m) => m.state !== "UNDER_REVIEW");
  const target = confirming ? manualReviews.find((m) => m.id === confirming.id) : null;
  const offline = forced === "offline";

  const close = () => {
    setConfirming(null);
    setReason("");
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Manual review" }]} title="Manual review" />
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Organisations a register couldn&rsquo;t confirm. Each applicant has proved who they are from
          their wallet; you&rsquo;re deciding whether what they sent shows they represent the
          organisation. Until you approve, it stays an ordinary organisation and can hold nothing.
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
              icon="fileText"
              title="Nothing waiting for review"
              message="When a register can't confirm an organisation and its representative asks NDI to check, the case waits here."
            />
          </Panel>
        ) : (
          waiting.map((m) => (
            <Panel key={m.id}>
              <div className="relative z-[4] flex flex-col gap-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{m.reference}</p>
                    <p className="font-display text-[17px] font-semibold text-strong">{m.legalName}</p>
                  </div>
                  <StatusPill status="under_review" label="Waiting for a decision" />
                </div>

                <p className="rounded-[10px] border border-grid px-3.5 py-3 text-[12.5px] leading-[1.55] text-muted" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                  <span className="font-medium text-body">What the register said: </span>
                  {m.registerAnswer}
                </p>

                <DetailList
                  items={[
                    { label: "Applicant", value: `${m.applicantName} · citizenship ${m.applicantCid} · proved from their wallet` },
                    { label: "Kind", value: kindOf(m.kind).label },
                    { label: "Registration number", value: m.registrationNumber, mono: true },
                    { label: "Evidence", value: m.evidence.join(", ") },
                    { label: "Applicant's note", value: m.note || "—" },
                    { label: "Sent", value: formatDate(m.submittedAt) },
                  ]}
                />

                <div className="flex flex-col gap-3 border-t border-subtle pt-4">
                  <p className="text-[13px] leading-[1.6] text-muted">
                    {isRoot
                      ? "The root account doesn't decide reviews — a platform administrator does."
                      : `Approving lets ${m.legalName} receive its registration and hold credentials. Refusing tells the applicant why, and they can send it again.`}
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    <GradientButton onClick={() => setConfirming({ id: m.id, action: "approve" })} disabled={offline || isRoot}>
                      <Icon name="check" size={15} strokeWidth={2.2} />
                      Approve
                    </GradientButton>
                    <HairlineButton onClick={() => setConfirming({ id: m.id, action: "refuse" })} disabled={offline || isRoot}>
                      Refuse
                    </HairlineButton>
                  </div>
                </div>
              </div>
            </Panel>
          ))
        )}

        {forced !== "loading" && decided.length > 0 ? (
          <section className="flex flex-col gap-2.5" aria-labelledby="decided-heading">
            <h2 id="decided-heading" className={LABEL_CLASS}>
              Decided
            </h2>
            {decided.map((m) => (
              <div key={m.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3">
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-[13.5px] font-medium text-body">{m.legalName}</span>
                  <span className="text-[12.5px] text-faint">
                    {m.reference} · {m.reviewerId ? personById(m.reviewerId).name : "—"}
                    {m.decidedAt ? `, ${formatDate(m.decidedAt)}` : ""}
                    {m.reason ? ` · ${m.reason}` : ""}
                  </span>
                </span>
                <StatusPill
                  status={m.state === "APPROVED" ? "approved" : "refused"}
                  label={m.state === "APPROVED" ? "Approved" : "Refused"}
                />
              </div>
            ))}
          </section>
        ) : null}

        <Dialog
          open={confirming?.action === "approve"}
          onClose={close}
          title={`Approve ${target?.legalName ?? "this organisation"}?`}
          lead={`You're confirming that ${target?.applicantName ?? "the applicant"} represents it.`}
          consequences={[
            "It can receive its registration and hold credentials",
            "The decision is recorded with your name, and the applicant sees it",
          ]}
          confirmLabel="Approve"
          onConfirm={() => {
            if (!confirming) return;
            decideManualReview(confirming.id, true);
            setDone(`Approved — ${target?.applicantName} can now receive ${target?.legalName}'s registration.`);
            close();
          }}
        />
        <Dialog
          open={confirming?.action === "refuse"}
          onClose={close}
          tone="danger"
          title={`Refuse ${target?.legalName ?? "this organisation"}?`}
          lead="The applicant is shown your reason, so write it for them."
          confirmLabel="Refuse"
          confirmDisabled={!reason.trim()}
          onConfirm={() => {
            if (!confirming || !reason.trim()) return;
            decideManualReview(confirming.id, false, reason.trim());
            setDone(`Refused — ${target?.applicantName} has been told why.`);
            close();
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason</span>
            <textarea
              className={`${FIELD_CLASS} resize-y py-3`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              aria-describedby="reason-hint"
              placeholder="For example: the resolution names a different director. Send the current one."
            />
            <span id="reason-hint" className="text-[12.5px] leading-[1.5] text-faint">
              Required — refusing needs a reason the applicant can act on.
            </span>
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}
