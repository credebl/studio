"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { kindOf } from "@/features/onboarding/orgKinds";
import { inOrg, isNamedAdmin } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Criteria, issueOverlaps } from "./Criteria";
import { ScopeList, capVerb } from "./shared";

/**
 * SCR-ACC-05 — Review a request. FLOW-ACC-02 step 6.
 *
 * A RECOMMENDATION, NOT A DECISION
 *
 * The first administrator reads a business's request against the interim
 * criteria and recommends — either way. Either recommendation goes to a
 * second administrator on SCR-ACC-02, who decides. The reviewer cannot
 * edit the request (UXD-30): if it asks for more than it needs, the reason
 * for declining says what to remove, and the business reads that reason in
 * the reviewer's own words (UN-32). That is why the prompt for it gives an
 * example written to the business, not about it.
 *
 * ALERTS FIRST
 *
 * If the business has stopped being a verified holder since it asked
 * (ACC-02/E10), that is the first thing on the page — the reviewer decides
 * what it means, but must not find it after recommending. A request whose
 * asker no longer represents the business has lapsed (ACC-02/E9), and there
 * is nothing to decide.
 */
type Face = "live" | "default" | "holder_alert" | "overdue" | "lapsed" | "error" | "offline" | "empty" | "not_found" | "done";

const OVERDUE_DAYS = 14;

export function ReviewRequestView({ id }: { id: string }) {
  const router = useRouter();
  const { accreditations, organizations, relations, currentPerson, personById, reviewRequest, hydrated } = useDemo();
  const forced = useScreenState("SCR-ACC-05", ["live", "default", "holder_alert", "overdue", "lapsed", "error", "offline", "empty"]) as Face;

  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState<string | null>(null);

  const acc = accreditations.find((a) => a.id === id && a.door === "REQUEST");
  const org = organizations.find((o) => o.id === acc?.orgId);
  const askerStillRoot = relations.some(
    (r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE" && r.personId === acc?.requestedBy,
  );
  const waited = acc?.requestedAt ? Math.floor((Date.now() - new Date(acc.requestedAt).getTime()) / 86_400_000) : 0;
  const reviewable = acc?.state === "SUBMITTED" || acc?.state === "IN_REVIEW";

  const natural: Face = done
    ? "done"
    : !acc
      ? "not_found"
      : !reviewable
        ? "done"
        : !askerStillRoot
          ? "lapsed"
          : org && !org.capabilities.includes("holder")
            ? "holder_alert"
            : waited > OVERDUE_DAYS
              ? "overdue"
              : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Accreditations", href: "/admin/accreditations" }, { label: "Review" }]}
      title="Review a request"
    />
  );
  const message = (text: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            <div>
              <HairlineButton onClick={() => router.push("/admin/accreditations")}>Back to accreditations</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (face === "empty") return message("No requests are waiting for review.");
  if (!acc || face === "not_found") return message("There's no request at this address.");
  if (face === "done")
    return message(
      done ?? (
        <>
          This request has already been reviewed.{" "}
          <Link className="ndi-plainlink text-accent" href={`/admin/accreditations/${acc.id}`}>
            See where it stands
          </Link>
          .
        </>
      ),
    );
  if (face === "lapsed")
    return message(
      `A request made by ${acc.requestedBy ? personById(acc.requestedBy).name : "its previous representative"} lapsed when their authority ended. There's nothing to decide.`,
    );

  const overlaps = issueOverlaps(acc, accreditations, (oid) => organizations.find((o) => o.id === oid)?.name ?? oid);
  const offline = face === "offline";
  const canAct = isNamedAdmin(currentPerson) && !offline;

  const send = (approve: boolean) => {
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      setBusy(false);
      /* The forced error face stands in for a save that failed. */
      if (face === "error") {
        setFailed(true);
        return;
      }
      const r = reviewRequest(acc.id, approve, approve ? null : reason);
      if (!r.ok) {
        setFailed(true);
        return;
      }
      setDone(
        approve
          ? "Recommended for approval. A different administrator decides next."
          : "Recommended to decline. A different administrator confirms it, or sends it for another review; only then is the business told.",
      );
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header}

        {face === "holder_alert" ? (
          <p role="alert" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.05)" }}>
            <Icon name="shieldAlert" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {acc.orgName} is no longer a verified holder. This request came from its holder dashboard.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="m-0 font-display text-[17px] font-semibold text-strong">
              {acc.orgName} asks to {capVerb(acc.capability)}
            </p>
            <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
              Recommend approving or declining this as the business asked for it. You can&rsquo;t edit it.
            </p>
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                {acc.capability === "verifier" ? "What it asks to ask people for" : "What it asks to issue"}
              </h2>
              <ScopeList capability={acc.capability} ask={acc.ask} issue={acc.issue} />
            </div>
            <DetailList
              items={[
                { label: "Purpose", value: acc.purpose },
                { label: "Asked by", value: acc.requestedBy ? `${personById(acc.requestedBy).name}, its representative` : "—" },
                {
                  label: "Verified",
                  value: `By the ${kindOf(org?.kind).authority}${org?.createdAt ? `, ${formatDate(org.createdAt)}` : ""}`,
                },
                {
                  label: "Waiting since",
                  value: (
                    <>
                      {acc.requestedAt ? formatDate(acc.requestedAt) : "—"}
                      {face === "overdue" ? <span className="text-body"> · overdue</span> : null}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What NDI checks</h2>
            <Criteria acc={acc} org={org} overlaps={overlaps} />
          </div>
        </Panel>

        {offline ? (
          <p role="status" className="m-0 text-[13.5px] text-body">
            You&rsquo;re offline. Nothing can be recorded until you&rsquo;re back.
          </p>
        ) : null}
        {failed ? (
          <p role="alert" className="m-0 text-[13.5px] text-body">
            We couldn&rsquo;t save that. Nothing was recorded — try again.
          </p>
        ) : null}

        {currentPerson.platformRole === "root" ? (
          <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
            The root account doesn&rsquo;t review requests. NDI&rsquo;s platform administrators do.
          </p>
        ) : null}
        {declining ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Reason, for the business</span>
                <textarea
                  className={`${FIELD_CLASS} resize-y py-3`}
                  rows={3}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  Tell the business what to change — for example, &ldquo;Ask to check age only, not the date of birth.&rdquo;
                </span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                <GradientButton onClick={() => send(false)} disabled={!canAct || busy || !reason.trim()}>
                  {busy ? "Recording…" : "Recommend declining"}
                </GradientButton>
                <HairlineButton onClick={() => setDeclining(false)}>Cancel</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            <GradientButton onClick={() => send(true)} disabled={!canAct || busy}>
              {busy ? "Recording…" : "Recommend approval"}
            </GradientButton>
            <HairlineButton onClick={() => setDeclining(true)} disabled={!canAct || busy}>
              Recommend decline
            </HairlineButton>
          </div>
        )}
      </div>
    </AppShell>
  );
}
