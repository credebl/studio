"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { draftFor, roleIn, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { AskedList, kindSingular, kindTitle } from "./shared";

/**
 * SCR-ADO-01 — What people will be asked. FLOW-ORG-03 step 3: the officer
 * reads, in plain words, exactly what a citizen will be shown — before
 * agreeing to it being asked in the authority's name (UN-20).
 *
 * FROM THE CITIZEN'S SIDE
 *
 * Second person, item by item, with why each is needed and the purpose the
 * wallet will show. It reads as the request a person receives, not as a
 * definition an engineer wrote.
 *
 * REVIEW IS NOT THEATRE
 *
 * NDI may have drafted this, and the authority is the one adopting it —
 * its name is on it (EW-FLOW5-SD/D7), so the screen says so. And there is
 * an objection route on the item it concerns: the sole proprietorship draft
 * asks for the date of birth, which confirming a licence holder doesn't
 * need (P5, E4). Sending it back takes it out of what is adopted; nothing
 * is overridden, and it doesn't have to be agreed today.
 *
 * For a type already live, this is where its current version is read, and
 * where a change — a new version — starts.
 */
type Face = "live" | "default" | "loading" | "empty" | "error" | "offline" | "no_permission";

export function WhatPeopleAreAskedView({ kind }: { kind: OrgKind }) {
  const router = useRouter();
  const params = useSearchParams();
  const changing = params.get("change") === "1";
  const { designations, adoptions, artefactObjections, organizations, currentPerson, personById, activeOrgId, objectToArtefacts, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ADO-01", ["live", "default", "loading", "empty", "error", "offline", "no_permission"]) as Face;

  const [objecting, setObjecting] = useState(false);
  const [note, setNote] = useState("");

  const org =
    organizations.find((o) => o.id === activeOrgId && designations.some((d) => d.orgId === o.id)) ??
    organizations.find((o) => o.memberIds.includes(currentPerson.id) && designations.some((d) => d.orgId === o.id));
  const d = designations.find((x) => x.orgId === org?.id && x.state === "ACTIVE");
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;
  const draft = draftFor(kind);
  const objection = artefactObjections.find((o) => o.designationId === d?.id && o.entityType === kind);
  const live = adoptions.find((a) => a.designationId === d?.id && a.entityType === kind && a.state === "ACTIVE");
  const viewingLive = Boolean(live) && !changing;
  const asked = viewingLive ? live!.asked : objection?.item ? draft.asked.filter((a) => a.item !== objection.item) : draft.asked;
  const flagged = viewingLive || objection ? null : draft.overBroad;

  const natural: Face = !d || !d.entityTypes.includes(kind) ? "empty" : !owner ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const canContinue = owner && !offline && face !== "no_permission";

  const header = (
    <PageHeader
      crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "Authority", href: "/authority" }, { label: kindTitle(kind) }]}
      title="What people will be asked"
    />
  );

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState icon="fileText" title="There's nothing to review yet." message="NDI is preparing it with you." />
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so this is read-only. You can still print it.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You can read this. Only your organisation&rsquo;s owner can adopt it.
          </p>
        ) : null}
        {objection ? (
          <p role="status" className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} className="mt-[2px] flex-none" style={{ color: "var(--ndi-success)" }} />
            Sent back to NDI on {formatDate(objection.at)}
            {objection.item ? `: ${objection.item} is out of what people will be asked` : ""}. &ldquo;{objection.note}&rdquo;
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <p className="m-0 max-w-[66ch] text-[15px] leading-[1.65] text-body">
              This is what a person will see in their NDI wallet when they ask to verify a {kindSingular(kind)} with you.
            </p>

            {viewingLive ? (
              <p className="m-0 text-[13px] text-muted">
                Version {live!.version}, live since {formatDate(live!.adoptedAt)}, adopted by {personById(live!.adoptedBy).name}.
              </p>
            ) : (
              <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
                Each item is listed with why it&rsquo;s needed to answer your question. If something here isn&rsquo;t
                needed, say so — this doesn&rsquo;t have to be agreed today.
              </p>
            )}

            <div className="flex flex-col gap-2">
              <p className={LABEL_CLASS}>They&rsquo;ll be asked for</p>
              <AskedList asked={asked} flagged={flagged} />
            </div>

            <div className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
              <p className={LABEL_CLASS}>Why, as their wallet shows it</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">&ldquo;{draft.purpose}&rdquo;</p>
            </div>

            <div className="flex flex-col gap-1.5">
              <p className={LABEL_CLASS}>What the {draft.credential} will contain</p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-body">{draft.contents.join(" · ")}</p>
            </div>

            {viewingLive ? null : (
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                NDI may have drafted this. You are the one adopting it, and your name is on it.
              </p>
            )}

            {objecting ? (
              <div className="flex flex-col gap-3 rounded-[12px] border border-grid px-4 py-3">
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>What should change</span>
                  <textarea
                    className={`${FIELD_CLASS} resize-y py-3`}
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={draft.overBroad ? `Our register doesn't need the ${draft.overBroad.toLowerCase()} to answer.` : ""}
                  />
                </label>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton
                    disabled={!note.trim()}
                    onClick={() => {
                      objectToArtefacts(d!.id, kind, draft.overBroad, note);
                      setObjecting(false);
                      setNote("");
                    }}
                  >
                    Send back to NDI
                  </GradientButton>
                  <HairlineButton onClick={() => setObjecting(false)}>Cancel</HairlineButton>
                </div>
              </div>
            ) : null}

            {face === "error" ? (
              <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
                This request asks for more than is needed to confirm a representative: {draft.overBroad ?? "Date of birth"}.
                Send it back with a note.
              </p>
            ) : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              {viewingLive ? (
                <HairlineButton onClick={() => router.push(`/authority/${kind}?change=1`)} disabled={!canContinue}>
                  Change what people are asked
                </HairlineButton>
              ) : (
                <GradientButton
                  onClick={() => router.push(`/authority/${kind}/adopt${changing ? "?change=1" : ""}`)}
                  disabled={!canContinue || face === "error"}
                >
                  Continue to adopt
                  <Icon name="arrowRight" size={16} strokeWidth={2} />
                </GradientButton>
              )}
              {viewingLive || objection ? null : (
                <HairlineButton onClick={() => setObjecting(true)} disabled={!canContinue || objecting}>
                  Raise an objection
                </HairlineButton>
              )}
              <HairlineButton onClick={() => window.print()}>Print</HairlineButton>
              <HairlineButton onClick={() => router.push("/authority")}>Back</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
