"use client";

import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { useDemo } from "@/lib/demoStore";

import { formatDate } from "@/features/controllership/scopeModel";

/**
 * D6 — appeals. The act that makes revocation something other than arbitrary
 * power, and the one most likely to be cut for time.
 *
 * IT IS NOT WORTH CUTTING
 *
 * The whole product is a machine for withdrawing authority quickly. Without a
 * route to challenge a withdrawal, that machine has no counterweight, and
 * every governance conversation about it will stall on the same question. The
 * screen exists so the answer is a click rather than a paragraph.
 *
 * WHO SEES WHAT
 *
 * A holder sees their own notices and can submit against them. An owner sees
 * appeals raised against the entity and decides them. Same screen, because
 * they are the same object — but the actions differ, and neither is shown the
 * other's. An owner given a "submit an appeal" form would be nonsense; a
 * holder given "uphold" would be worse.
 *
 * THE WINDOW IS COPY, NOT A GRAPHIC
 *
 * Ten working days to appeal and five to decide are provisional, pending the
 * governance framework. They live in the fixture and print as text, so
 * changing them is an edit rather than a redraw — which is exactly what the
 * brief asks for when it flags them as unsettled.
 */
export function AppealsView() {
  const { appeals, personById, harness, submitAppeal, decideAppeal } = useDemo();

  const screenState = useScreenState("D6", [
    "default",
    "notice_only",
    "under_review",
    "upheld",
    "rejected",
    "empty",
  ]);

  const [drafts, setDrafts] = useState<Record<string, string>>({});

  const isOwner = harness.persona === "dorji";

  /* An owner is looking at appeals against the entity; anyone else is looking
     at their own. */
  const mine = appeals.filter((a) => a.subjectId === harness.persona);
  const rows = screenState === "empty" ? [] : isOwner ? appeals : mine;

  /* The switcher rewrites the state of whatever is on screen, so each stage
     can be reviewed without walking an appeal through it. */
  const forcedState =
    screenState === "notice_only"
      ? "notice_issued"
      : screenState === "under_review"
        ? "under_review"
        : screenState === "upheld"
          ? "upheld_reinstated"
          : screenState === "rejected"
            ? "rejected"
            : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1080px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Appeals" }]}
          title={isOwner ? "Appeals against the entity" : "Your appeals"}
        />

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          {isOwner
            ? "When the entity withdraws someone's authority, they are told why and given a reference to challenge it. Those challenges arrive here."
            : "When an authority you hold is suspended or withdrawn, you are told why and can challenge it. Nothing is decided without you having had the chance to answer."}
        </p>

        {rows.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="shieldAlert"
              title={isOwner ? "No appeals" : "Nothing to appeal"}
              message={
                isOwner
                  ? "Nobody has challenged a withdrawal. Notices carry a reference, so an appeal can always be traced back to the decision it is about."
                  : "None of your authority has been suspended or withdrawn. If it ever is, you will find the reason and a way to challenge it here."
              }
            />
          </Panel>
        ) : (
          rows.map((appeal) => {
            const state = forcedState ?? appeal.state;
            const subject = personById(appeal.subjectId);
            const draft = drafts[appeal.id] ?? "";
            const settled = state === "upheld_reinstated" || state === "rejected";

            return (
              <Panel key={appeal.id}>
                <div className="relative z-[4] flex flex-col gap-4">
                  {/* ---- The notice ---- */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="flex min-w-0 flex-col gap-1">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        {appeal.reference}
                      </p>
                      <p className="font-display text-[15px] font-semibold leading-[1.3] text-strong">
                        {appeal.againstTitle} was withdrawn
                      </p>
                      <p className="text-[12.5px] leading-[1.5] text-faint">
                        {isOwner ? `Held by ${subject.name} · ` : ""}
                        Notice issued {formatDate(appeal.noticeIssuedAt)}
                      </p>
                    </div>
                    <StatusPill status={state} />
                  </div>

                  {/* The notice on one side, the response to it on the other.
                      An appeal card is a conversation between two parties, and
                      once there is room for two columns that reads far better
                      than one long strip with the entity's reason at the top
                      and the answer to it four scrolls down. Below 1201px the
                      content column is too narrow to split, so it stacks in
                      the order it was always in. */}
                  <div className="grid gap-4 @min-[880px]/page:grid-cols-2 @min-[880px]/page:items-start @min-[880px]/page:gap-6">
                    <div className="flex min-w-0 flex-col gap-4">
                    <div className="rounded-[12px] border border-grid px-3.5 py-3">
                      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                        The reason given
                      </p>
                      <p className="mt-1.5 max-w-[62ch] text-[13px] leading-[1.6] text-body">
                        {appeal.noticeReason}
                      </p>
                    </div>

                    {/* ---- The window ---- */}
                    {!settled ? (
                      <p className="text-[12.5px] leading-[1.5] text-faint">
                        {appeal.windowWorkingDays} working days to appeal from the
                        date of the notice, and a decision within{" "}
                        {appeal.decisionWorkingDays} working days of that. These
                        periods are provisional until the governance framework
                        settles them.
                      </p>
                    ) : null}

                    </div>

                    <div className="flex min-w-0 flex-col gap-4 @min-[880px]/page:border-l @min-[880px]/page:border-subtle @min-[880px]/page:pl-6">
                    {/* ---- The submission ---- */}
                    {appeal.submission ? (
                      <div className="rounded-[12px] border border-grid px-3.5 py-3">
                        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">
                          {isOwner ? `${subject.name} says` : "What you said"}
                        </p>
                        <p className="mt-1.5 max-w-[62ch] text-[13px] leading-[1.6] text-body">
                          {appeal.submission}
                        </p>
                        {appeal.submittedAt ? (
                          <p className="mt-2 text-[12px] text-faint">
                            Submitted {formatDate(appeal.submittedAt)}
                          </p>
                        ) : null}
                        {appeal.evidence.length > 0 ? (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {appeal.evidence.map((file) => (
                              <li
                                key={file}
                                className="flex items-center gap-1.5 rounded-full border border-grid px-2.5 py-1 text-[12px] text-muted"
                              >
                                <Icon name="fileText" size={12} strokeWidth={2} />
                                {file}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}

                    {/* ---- The outcome ---- */}
                    {state === "upheld_reinstated" ? (
                      <div className="flex items-start gap-2.5">
                        <Icon
                          name="check"
                          size={16}
                          strokeWidth={2.4}
                          className="mt-0.5 flex-none text-accent"
                        />
                        <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                          The appeal was upheld and {appeal.againstTitle} has been
                          reinstated. It verifies again wherever it is used —
                          including anything that hangs off it.
                        </p>
                      </div>
                    ) : null}

                    {state === "rejected" ? (
                      <div className="flex items-start gap-2.5">
                        <Icon
                          name="info"
                          size={16}
                          strokeWidth={2}
                          className="mt-0.5 flex-none"
                          style={{ color: "var(--text-faint)" }}
                        />
                        <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                          The appeal was not upheld. The withdrawal stands, and
                          the reasoning is part of the entity&rsquo;s permanent
                          record.
                        </p>
                      </div>
                    ) : null}

                    {/* ---- What each side can do ---- */}
                    {!isOwner && state === "notice_issued" ? (
                      <div className="flex flex-col gap-3 border-t border-subtle pt-4 @min-[880px]/page:border-t-0 @min-[880px]/page:pt-0">
                        <label className={FIELD_BLOCK_CLASS}>
                          <span className={LABEL_CLASS}>Your answer</span>
                          <textarea
                            value={draft}
                            onChange={(e) =>
                              setDrafts((d) => ({ ...d, [appeal.id]: e.target.value }))
                            }
                            rows={4}
                            placeholder="Say what you think the entity got wrong, and what you would like put right."
                            className={`${FIELD_CLASS} resize-y py-3`}
                          />
                        </label>

                        <div className="flex flex-wrap items-center gap-2.5">
                          <GradientButton
                            onClick={() => submitAppeal(appeal.id, draft.trim())}
                            disabled={draft.trim() === ""}
                          >
                            <Icon name="send" size={15} strokeWidth={2} />
                            Submit the appeal
                          </GradientButton>
                          <HairlineButton>
                            <Icon name="download" size={14} strokeWidth={2} />
                            Attach evidence
                          </HairlineButton>
                        </div>
                        <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
                          You can also ask for the entity&rsquo;s record of what
                          happened. An appeal you cannot see the evidence for is
                          not much of an appeal.
                        </p>
                      </div>
                    ) : null}

                    {!isOwner && state === "under_review" ? (
                      <p className="border-t border-subtle pt-4 @min-[880px]/page:border-t-0 @min-[880px]/page:pt-0 text-[13px] leading-[1.6] text-muted">
                        Submitted and waiting on a decision. You will be told the
                        outcome either way — a decision is due within{" "}
                        {appeal.decisionWorkingDays} working days.
                      </p>
                    ) : null}

                    {isOwner && state === "under_review" ? (
                      <div className="flex flex-col gap-2.5 border-t border-subtle pt-4 @min-[880px]/page:border-t-0 @min-[880px]/page:pt-0">
                        <div className="flex flex-wrap items-center gap-2.5">
                          <GradientButton
                            onClick={() => decideAppeal(appeal.id, "upheld_reinstated")}
                          >
                            <Icon name="check" size={15} strokeWidth={2.2} />
                            Uphold and reinstate
                          </GradientButton>
                          <button
                            type="button"
                            onClick={() => decideAppeal(appeal.id, "rejected")}
                            className="ndi-dialog-confirm inline-flex h-11 items-center gap-2 rounded-[10px] px-4 font-display text-[13.5px] font-semibold"
                            data-tone="danger"
                          >
                            Reject the appeal
                          </button>
                        </div>
                        <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
                          Upholding it puts {appeal.againstTitle} back exactly as
                          it was. Either decision goes into the record with your
                          name on it.
                        </p>
                      </div>
                    ) : null}

                    {isOwner && state === "notice_issued" ? (
                      <p className="border-t border-subtle pt-4 @min-[880px]/page:border-t-0 @min-[880px]/page:pt-0 text-[13px] leading-[1.6] text-muted">
                        {subject.name} has been told and has not answered yet.
                        There is nothing for you to do until they do, or until the
                        window closes.
                      </p>
                    ) : null}
                    </div>
                  </div>
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </AppShell>
  );
}
