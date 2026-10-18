"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { ENFORCEMENT_DATE, isNamedAdmin, type Accreditation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { Criteria, issueOverlaps } from "./Criteria";
import { ScopeList, accPill, capVerb, daysUntil, inline } from "./shared";

/**
 * SCR-ACC-02 — Approve an accreditation. FLOW-ACC-01 step 2; FLOW-ACC-02
 * step 7. Also the record of an accreditation in every later state, because
 * an administrator following one up arrives at the same address.
 *
 * DUAL CONTROL, SHOWN BEFORE IT IS ENFORCED
 *
 * Whoever proposed it — or, for a business's request, whoever reviewed it —
 * sees it in full with the approve control replaced by the reason they
 * can't (E1, ACC-02/E5), and who can. The store refuses regardless: the
 * screen is not the boundary (standing rule 9), it only avoids offering
 * something and then refusing it.
 *
 * AS SUBMITTED, AND NO APPROVE AGAINST A DECLINE
 *
 * A business's request is approved or declined as the business wrote it —
 * NDI does not narrow it on their behalf (EW-FLOW4-SD/D9, UXD-30), because
 * then the business would be approved for something it never asked for and
 * never saw. If it asks for too much, the decline says what to remove. And
 * when the reviewer recommended declining, there is no approve control at
 * all (ACC-02/E11): confirm the decline, or send it for a different review.
 * Overruling a reviewer quietly is the exact failure dual control exists
 * to prevent.
 */
type Face =
  | "live"
  | "default"
  | "self_proposed"
  | "recommended_decline"
  | "lapsed"
  | "loading"
  | "success"
  | "offline"
  | "not_found";

export function ApproveAccreditationView({ id }: { id: string }) {
  const router = useRouter();
  const { accreditations, organizations, people, harness, currentPerson, personById, decideAccreditation, sendBackForReview, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ACC-02", [
    "live",
    "default",
    "self_proposed",
    "recommended_decline",
    "lapsed",
    "loading",
    "success",
    "offline",
  ]) as Face;

  const [busy, setBusy] = useState(false);
  const [declining, setDeclining] = useState(false);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const live = accreditations.find((a) => a.id === id);
  /* Forced faces need something to show even when the address names
     nothing; a recognition proposal for the bank is the story's own. */
  const sample: Accreditation | undefined =
    live ??
    (forced !== "live"
      ? {
          id,
          orgId: "org-bob",
          orgName: "Bank of Bhutan Ltd.",
          officerEmail: null,
          door: forced === "recommended_decline" ? "REQUEST" : "RECOGNITION",
          capability: "verifier",
          purpose: "Confirming who a customer is when they open an account",
          agreementRef: "NDI/AGR/2024/003",
          ask: [
            { credential: "Citizen ID", item: "Full name", checkOnly: false },
            { credential: "Citizen ID", item: "Citizenship ID number", checkOnly: false },
            { credential: "Citizen ID", item: "Photo", checkOnly: false },
          ],
          issue: [],
          observed: null,
          state: "PROPOSED",
          proposedBy: "tshering",
          proposedAt: new Date().toISOString().slice(0, 10),
          requestedBy: null,
          requestedAt: null,
          recommendation: null,
          decidedBy: null,
          decidedAt: null,
          declineReason: null,
          declinedByOrg: false,
          acceptedName: null,
          acceptedAt: null,
          listedAt: null,
          expiresAt: null,
          publicIdentity: null,
          refusals: null,
        }
      : undefined);
  const acc: Accreditation | undefined =
    sample && forced === "recommended_decline"
      ? {
          ...sample,
          door: "REQUEST",
          state: "PROPOSED",
          recommendation: {
            by: sample.proposedBy ?? "tshering",
            approve: false,
            reason: sample.recommendation?.reason ?? "Ask to check age only, not the date of birth.",
            at: sample.proposedAt ?? "",
          },
        }
      : sample;

  const now = new Date().toISOString().slice(0, 10);
  const proposedHere = acc?.state === "PROPOSED";
  const natural: Face = !acc
    ? "not_found"
    : done
      ? "success"
      : proposedHere && acc.expiresAt && acc.expiresAt < now
        ? "lapsed"
        : proposedHere && acc.proposedBy === harness.persona
          ? "self_proposed"
          : proposedHere && acc.recommendation && !acc.recommendation.approve
            ? "recommended_decline"
            : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = (title: string) => (
    <PageHeader
      crumbs={[{ label: "NDI administration" }, { label: "Accreditations", href: "/admin/accreditations" }, { label: acc?.orgName ?? "Not found" }]}
      title={title}
    />
  );

  if (!acc || face === "not_found") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header("Accreditation")}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] text-body">
              There&rsquo;s no accreditation at this address.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const org = organizations.find((o) => o.id === acc.orgId);
  const verb = capVerb(acc.capability);
  const proposer = acc.proposedBy ? personById(acc.proposedBy).name : "—";
  const isRequest = acc.door === "REQUEST";
  const whoCan = people.filter((p) => isNamedAdmin(p) && p.hasAccount !== false && p.id !== acc.proposedBy).map((p) => p.name);
  const overlaps = issueOverlaps(acc, accreditations, (oid) => organizations.find((o) => o.id === oid)?.name ?? oid);
  const pill = face === "lapsed" ? { status: "lapsed", label: "Lapsed" } : accPill(acc, "admin");
  const offline = face === "offline";
  const canAct = isNamedAdmin(currentPerson) && !offline;

  const decide = (approve: boolean, why?: string) => {
    setBusy(true);
    window.setTimeout(() => {
      const r = decideAccreditation(acc.id, approve, why);
      setBusy(false);
      if (!r.ok) return;
      setDone(
        approve
          ? isRequest
            ? `Approved. ${acc.orgName} has been told, and its listing is being published.`
            : acc.door === "NEW"
              ? `Approved. ${acc.officerEmail} has been invited to register ${acc.orgName}; they accept once it's registered. They have 30 days.`
              : `Approved. ${acc.orgName}'s owner has been told, and has 30 days to accept it.`
          : isRequest
            ? `Declined. ${acc.orgName} has been told your reason, in your words.`
            : `Declined. ${proposer} has been told your reason.`,
      );
    }, LOCAL_MS);
  };

  /* What happened since the decision, for an administrator following up.
     Each sentence is the admin-console half of a FLOW-ACC error path. */
  const after = (() => {
    if (proposedHere) return null;
    switch (acc.state) {
      case "SUBMITTED":
      case "IN_REVIEW":
        return `Waiting for review since ${acc.requestedAt ? formatDate(acc.requestedAt) : "—"}.`;
      case "PENDING_ACCEPTANCE":
        if (acc.expiresAt && acc.expiresAt < now) return "This accreditation expired without being accepted.";
        return acc.door === "NEW" && !acc.orgId
          ? `Invitation sent to ${acc.officerEmail}. Waiting for them to register ${acc.orgName} — ${daysUntil(acc.expiresAt)} days left.`
          : `Waiting for ${acc.orgName} to accept — ${daysUntil(acc.expiresAt)} days left.`;
      case "LISTING":
        return `Accepted by ${acc.acceptedName ?? "its representative"}${acc.acceptedAt ? ` on ${formatDate(acc.acceptedAt)}` : ""}. Publishing the listing.`;
      case "ACTIVE":
        return `Listed since ${acc.listedAt ? formatDate(acc.listedAt) : "—"}${acc.acceptedName ? `, accepted by ${acc.acceptedName}` : ""}.`;
      case "DECLINED":
        return acc.declinedByOrg
          ? `${acc.orgName} declined the accreditation.`
          : `${acc.decidedBy ? personById(acc.decidedBy).name : "An administrator"} declined this: ${acc.declineReason ?? "—"}`;
      case "EXPIRED":
        return "This accreditation expired without being accepted.";
      case "LAPSED":
        return "This approval lapsed because the listing couldn't be published.";
      case "WITHDRAWN":
        return `${acc.orgName} withdrew its request.`;
      case "RESIGNED":
        return `${acc.orgName} stopped ${acc.capability === "verifier" ? "verifying" : "issuing"} on ${acc.decidedAt ? formatDate(acc.decidedAt) : "—"}.`;
      case "SUPERSEDED":
        return "Replaced by a wider approval, which is now active. This one stays on record.";
      case "HELD":
        return "This public identity is already listed for another organisation. The listing is held until that's resolved.";
      case "STOPPED":
        return `${acc.orgName}'s public identity has changed since it was approved. Verifying and issuing have stopped until it's put back.`;
      default:
        return null;
    }
  })();

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        {header(proposedHere ? "Approve an accreditation" : "Accreditation")}

        <div className="flex flex-wrap items-center gap-2.5">
          <StatusPill status={pill.status} label={pill.label} />
          <span className="text-[13px] text-muted">
            {acc.door === "RECOGNITION"
              ? "Recognising an organisation already operating"
              : acc.door === "NEW"
                ? "An institution not on the platform yet"
                : acc.door === "REQUEST"
                  ? "A business asked"
                  : "An organisation on the platform"}
          </span>
        </div>

        {face === "success" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 flex items-start gap-2 text-[14px] leading-[1.6] text-body">
                <Icon name="check" size={15} strokeWidth={2.4} className="mt-[4px] flex-none text-accent" />
                {done ?? `Approved. ${acc.orgName}'s owner has been told, and has 30 days to accept it.`}
              </p>
              <div>
                <GradientButton onClick={() => router.push("/admin/accreditations")}>Back to list</GradientButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {after ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">{after}</p>
              {acc.state === "ACTIVE" && acc.publicIdentity ? (
                <p className="m-0 text-[13px] text-muted">
                  Public identity: <span className="break-all font-mono text-[12px]">{acc.publicIdentity}</span>
                </p>
              ) : null}
              {/* E12: informs discretion, asks for nothing. */}
              {acc.state === "ACTIVE" && org && !org.capabilities.includes("holder") ? (
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {org.name} is no longer a verified holder. Its approval to {verb} is unchanged.
                </p>
              ) : null}
              {(acc.state === "DECLINED" && !acc.declinedByOrg && !isRequest) ||
              acc.state === "EXPIRED" ||
              (acc.state === "PENDING_ACCEPTANCE" && acc.expiresAt && acc.expiresAt < now) ? (
                <div>
                  <HairlineButton onClick={() => router.push("/admin/accreditations/new")}>
                    {acc.state === "DECLINED" ? "Propose again, changed" : "Propose again"}
                  </HairlineButton>
                </div>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {face === "lapsed" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 text-[14px] leading-[1.6] text-body">
                {isRequest
                  ? "This recommendation lapsed without a decision and has gone back for review."
                  : "This proposal lapsed without a decision. It confers nothing."}
              </p>
              <div>
                {isRequest ? (
                  <HairlineButton
                    onClick={() => {
                      sendBackForReview(acc.id);
                      router.push(`/admin/accreditations/${acc.id}/review`);
                    }}
                  >
                    Review it afresh
                  </HairlineButton>
                ) : (
                  <HairlineButton onClick={() => router.push("/admin/accreditations/new")}>Propose again</HairlineButton>
                )}
              </div>
            </div>
          </Panel>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="m-0 font-display text-[17px] font-semibold leading-[1.35] text-strong">
              {proposedHere
                ? `You're approving ${acc.orgName} to ${verb}. Every citizen's NDI wallet will trust it for this.`
                : `${acc.orgName} — approval to ${verb}`}
            </p>
            {isRequest && proposedHere ? (
              <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-muted">
                You can approve or decline this as the business asked for it. You can&rsquo;t change it — if it
                asks for too much, decline and say what to remove.
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                {acc.capability === "verifier" ? "What it can ask people for" : "What it can issue"}
              </h2>
              <ScopeList capability={acc.capability} ask={acc.ask} issue={acc.issue} observed={acc.observed?.ask} />
              {acc.capability === "verifier" ? (
                <p className="m-0 text-[13px] text-muted">Anything else will be refused before it reaches anyone.</p>
              ) : null}
              {overlaps.map((o) => (
                <p key={o.type} className="m-0 flex items-start gap-2 text-[13px] text-muted">
                  <Icon name="info" size={14} strokeWidth={2} className="mt-[3px] flex-none text-faint" />
                  {o.type} is also issued by {o.others.join(", ")}.
                </p>
              ))}
            </div>
            {acc.observed ? (
              <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-muted">
                Seen since {formatDate(acc.observed.since)}:{" "}
                {acc.capability === "verifier"
                  ? acc.observed.ask.map((a) => inline(a.item)).join(", ")
                  : acc.observed.issue.map((t) => t.name).join(", ")}
                . After {formatDate(ENFORCEMENT_DATE)}, anything not approved is refused.
              </p>
            ) : null}
            <DetailList
              items={[
                { label: "Purpose", value: acc.purpose || "—" },
                ...(acc.door === "NEW" ? [{ label: "Officer", value: acc.officerEmail ?? "—" }] : []),
                { label: "Agreement", value: acc.agreementRef || "—" },
                isRequest
                  ? {
                      label: "Asked by",
                      value: `${acc.requestedBy ? personById(acc.requestedBy).name : "—"}${acc.requestedAt ? `, ${formatDate(acc.requestedAt)}` : ""}`,
                    }
                  : { label: "Proposed by", value: `${proposer}${acc.proposedAt ? `, ${formatDate(acc.proposedAt)}` : ""}` },
                ...(acc.recommendation
                  ? [
                      {
                        label: "Reviewed by",
                        value: `${personById(acc.recommendation.by).name} — recommends ${acc.recommendation.approve ? "approving" : "declining"}${acc.recommendation.reason ? `: ${acc.recommendation.reason}` : ""}`,
                      },
                    ]
                  : []),
                ...(acc.decidedBy ? [{ label: "Decided by", value: `${personById(acc.decidedBy).name}${acc.decidedAt ? `, ${formatDate(acc.decidedAt)}` : ""}` }] : []),
                ...(proposedHere && face !== "lapsed" ? [{ label: "Lapses", value: `In ${daysUntil(acc.expiresAt)} days, if nobody decides` }] : []),
              ]}
            />
            <p className="m-0 text-[13.5px] leading-[1.6] text-body">
              {isRequest
                ? `Approving adds ${acc.orgName} to NDI's public list of trusted organisations.`
                : `Once accepted, ${acc.orgName} is added to NDI's public list of trusted organisations.`}
            </p>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What NDI checks</h2>
            <Criteria acc={acc} org={org} overlaps={overlaps} />
          </div>
        </Panel>

        {proposedHere && face !== "lapsed" && face !== "success" ? (
          <div className="flex flex-col gap-3">
            {offline ? (
              <p role="status" className="m-0 text-[13.5px] text-body">
                You&rsquo;re offline, so this is read-only.
              </p>
            ) : null}
            {currentPerson.platformRole === "root" ? (
              <p role="status" className="m-0 text-[13.5px] leading-[1.6] text-body">
                The root account doesn&rsquo;t approve anything. {whoCan.length ? `${whoCan.join(" or ")} can.` : ""}
              </p>
            ) : null}
            {face === "self_proposed" ? (
              <div className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3" style={{ background: "rgb(var(--tint) / 0.04)" }}>
                <p className="m-0 text-[13.5px] leading-[1.6] text-body">
                  {isRequest
                    ? "You reviewed this, so a different administrator has to approve it."
                    : "You proposed this, so a different administrator has to approve it."}
                </p>
                <p className="m-0 text-[13px] text-muted">{whoCan.length ? `${whoCan.join(" or ")} can.` : "No other administrator has an account yet."}</p>
              </div>
            ) : face === "recommended_decline" ? (
              <>
                <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">
                  {acc.recommendation ? personById(acc.recommendation.by).name : "The reviewer"} recommends declining:{" "}
                  {acc.recommendation?.reason}. Confirm, or send it for a different review.
                </p>
                <div className="flex flex-wrap gap-2.5">
                  <GradientButton
                    onClick={() => decide(false, acc.recommendation?.reason ?? "")}
                    disabled={!canAct || busy}
                  >
                    {busy ? "Recording…" : "Confirm the decline"}
                  </GradientButton>
                  <HairlineButton
                    onClick={() => {
                      sendBackForReview(acc.id);
                      router.push("/admin/accreditations");
                    }}
                    disabled={!canAct}
                  >
                    Send for a different review
                  </HairlineButton>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2.5">
                <GradientButton onClick={() => decide(true)} disabled={!canAct || busy}>
                  <Icon name="check" size={15} strokeWidth={2.2} />
                  {busy ? "Recording…" : "Approve"}
                </GradientButton>
                <HairlineButton onClick={() => setDeclining(true)} disabled={!canAct || busy}>
                  Decline
                </HairlineButton>
              </div>
            )}
          </div>
        ) : null}

        <Dialog
          open={declining}
          onClose={() => {
            setDeclining(false);
            setReason("");
          }}
          tone="danger"
          title={`Decline ${acc.orgName}'s accreditation?`}
          lead={isRequest ? "The business is shown your reason, in your words — say what to change." : `${proposer} is shown your reason.`}
          confirmLabel="Decline"
          confirmDisabled={!reason.trim()}
          onConfirm={() => {
            if (!reason.trim()) return;
            setDeclining(false);
            decide(false, reason.trim());
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason</span>
            <textarea
              className={`${FIELD_CLASS} resize-y py-3`}
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={isRequest ? 'For example: "Ask to check age only, not the date of birth."' : "For example: the purpose doesn't need the photo."}
            />
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}
