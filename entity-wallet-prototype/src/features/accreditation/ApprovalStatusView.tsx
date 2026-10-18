"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, roleIn, type AccState, type Accreditation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { ScopeList, accPill, capApproved, daysUntil, inline } from "./shared";

/**
 * SCR-ACC-04 — Approval status. FLOW-ACC-01 steps 8–11; FLOW-ACC-02 steps
 * 5–11. A region of the organisation's console, here its own page so both
 * an institution and a business reach it from the nav.
 *
 * WHAT IS REFUSED, BEFORE IT IS A SUPPORT CALL
 *
 * Per capability: whether it is approved, what may be asked for or issued —
 * the same list, in the same words, that was accepted — that it is listed
 * and since when, the public identity it is listed under, and what has been
 * refused in the last 30 days, with the items that were outside scope. An
 * integration that keeps asking for a date of birth it is not approved for
 * shows up here first, worded as what happened rather than as an error.
 *
 * EVERY ENDING SAYS WHAT STILL WORKS
 *
 * Resigning is always a stop, never a deletion (EW-FLOW4-SD §5.2), so the
 * confirmation says both halves: what stops straight away, and — for an
 * issuer — that what it has already issued stays valid (UXD-17). Each other
 * ending names who did it and what the organisation can do next.
 */
type Face =
  | "live"
  | "default"
  | "waiting"
  | "withdrawn"
  | "request_lapsed"
  | "listing_lapsed"
  | "suspended"
  | "superseded"
  | "declined"
  | "publishing"
  | "held"
  | "stopped"
  | "resigned"
  | "empty"
  | "offline"
  | "member";

const FORCED_STATE: Partial<Record<Face, AccState>> = {
  default: "ACTIVE",
  waiting: "SUBMITTED",
  withdrawn: "WITHDRAWN",
  request_lapsed: "WITHDRAWN",
  listing_lapsed: "LAPSED",
  suspended: "ACTIVE",
  superseded: "SUPERSEDED",
  declined: "DECLINED",
  publishing: "LISTING",
  held: "HELD",
  stopped: "STOPPED",
  resigned: "RESIGNED",
  offline: "ACTIVE",
  member: "ACTIVE",
};

export function ApprovalStatusView() {
  const router = useRouter();
  const { accreditations, organizations, relations, activeOrgId, currentPerson, harness, personById, completeListing, resignAccreditation, withdrawRequest, hydrated } =
    useDemo();
  const forced = useScreenState("SCR-ACC-04", [
    "live",
    "default",
    "waiting",
    "withdrawn",
    "request_lapsed",
    "listing_lapsed",
    "suspended",
    "superseded",
    "declined",
    "publishing",
    "held",
    "stopped",
    "resigned",
    "empty",
    "offline",
    "member",
  ]) as Face;
  const [resigning, setResigning] = useState<Accreditation | null>(null);
  const [restored, setRestored] = useState(false);

  const org = organizations.find((o) => o.id === activeOrgId);
  const name = org?.name ?? "Your organisation";
  const short = name.replace(/ (Pvt\. )?Ltd\.$/, "");
  const root = relations.find((r) => inOrg(org?.id ?? "")(r) && r.isRootAuthority && r.state === "ACTIVE");
  const isRoot = root?.personId === harness.persona;
  /* Only the Root of a verified holder is offered the way to ask
     (FLOW-ACC-02 P1, P2); anyone else is not shown it at all (E1). */
  const canAsk = isRoot && Boolean(org?.capabilities.includes("holder"));
  /* Resign and withdraw: OWNER for an institution, the Root for a business.
     The store checks again; this only decides whether to offer them. */
  const manages = (isRoot || roleIn(org, currentPerson) === "Owner") && forced !== "member";
  const mine = accreditations.filter((a) => a.orgId === activeOrgId && a.state !== "EXPIRED");

  /* Publishing the listing is simulated: whatever is LISTING when this page
     is open is published after a moment, standing in for the registry
     write (FLOW-ACC-01 step 9). */
  const listing = mine.filter((a) => a.state === "LISTING").map((a) => a.id);
  useEffect(() => {
    if (forced !== "live" || !listing.length) return;
    const t = window.setTimeout(() => listing.forEach((id) => completeListing(id)), WALLET_HANDOFF_MS);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listing.join(","), forced]);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  /* A forced face shows one approval in that state — the org's own record
     if it has one for that capability, otherwise the bank's verifying. */
  const sampleBase: Accreditation = mine[0] ?? {
    id: "acc-sample",
    orgId: activeOrgId,
    orgName: name,
    officerEmail: null,
    door: forced === "waiting" || forced === "withdrawn" || forced === "request_lapsed" || forced === "declined" ? "REQUEST" : "RECOGNITION",
    capability: "verifier",
    purpose: "Confirming who a customer is when they open an account",
    agreementRef: "",
    ask: [
      { credential: "Citizen ID", item: "Full name", checkOnly: false },
      { credential: "Citizen ID", item: "Citizenship ID number", checkOnly: false },
      { credential: "Citizen ID", item: "Photo", checkOnly: false },
    ],
    issue: [],
    observed: null,
    state: "ACTIVE",
    proposedBy: "tshering",
    proposedAt: null,
    requestedBy: root?.personId ?? null,
    requestedAt: new Date().toISOString().slice(0, 10),
    recommendation: null,
    decidedBy: "root",
    decidedAt: new Date().toISOString().slice(0, 10),
    declineReason: "Ask to check age only, not the date of birth.",
    declinedByOrg: false,
    acceptedName: currentPerson.name,
    acceptedAt: null,
    listedAt: new Date().toISOString().slice(0, 10),
    expiresAt: null,
    publicIdentity: org?.publicDid ?? "did:ethr:0x3f9a1c7e5b2d48a06e91f0c4d7b8a2e5c13f6d90",
    refusals: { count: 3, items: ["Date of birth", "Permanent address"] },
  };
  const shown: Accreditation[] =
    forced === "live"
      ? mine
      : forced === "empty"
        ? []
        : [
            {
              ...sampleBase,
              state: FORCED_STATE[forced] ?? "ACTIVE",
              door: ["waiting", "withdrawn", "request_lapsed", "declined"].includes(forced) ? "REQUEST" : sampleBase.door,
              declinedByOrg: false,
              declineReason: sampleBase.declineReason ?? "Ask to check age only, not the date of birth.",
              refusals: sampleBase.refusals ?? { count: 3, items: ["Date of birth", "Permanent address"] },
            },
          ];

  /* Superseded approvals are shown under the one that replaced them. */
  const top = shown.filter((a) => a.state !== "SUPERSEDED" || forced === "superseded");
  const replacedBy = (a: Accreditation) =>
    shown.filter((x) => x.state === "SUPERSEDED" && x.capability === a.capability && x.id !== a.id && a.state === "ACTIVE");

  const status = (a: Accreditation): { text: React.ReactNode; action?: React.ReactNode } => {
    const verb = a.capability === "verifier" ? "verify" : "issue";
    switch (forced === "live" ? a.state : forced) {
      case "suspended":
        return {
          text: `NDI has suspended ${short}'s approval to ${verb} while it checks how it's being used. Credentials you've already issued stay valid unless NDI says otherwise.`,
          action: <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">Contact NDI</Link>,
        };
      case "request_lapsed":
        return {
          text: `A request made by ${a.requestedBy ? personById(a.requestedBy).name : "your previous representative"} lapsed when their authority ended.`,
          action: isRoot ? <HairlineButton onClick={() => router.push("/verify-or-issue/ask")}>Ask again</HairlineButton> : null,
        };
      case "listing_lapsed":
        return {
          text: "This approval lapsed because the listing couldn't be published. NDI will contact you.",
          action: <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">Contact NDI</Link>,
        };
    }
    switch (a.state) {
      case "ACTIVE":
        return {
          text: `${capApproved(a.capability)}, listed since ${a.listedAt ? formatDate(a.listedAt) : "—"}.`,
          action:
            manages && forced !== "offline" ? (
              <HairlineButton onClick={() => setResigning(a)}>Stop {a.capability === "verifier" ? "verifying" : "issuing"}</HairlineButton>
            ) : null,
        };
      case "SUBMITTED":
      case "IN_REVIEW":
      case "PROPOSED":
        return {
          text: `Waiting for NDI since ${a.requestedAt ? formatDate(a.requestedAt) : "—"}.`,
          action:
            manages && a.door === "REQUEST" && forced !== "offline" ? (
              <HairlineButton onClick={() => withdrawRequest(a.id)}>Withdraw request</HairlineButton>
            ) : null,
        };
      case "PENDING_ACCEPTANCE":
        return {
          text: `NDI has proposed approving ${short} to ${verb}. It's waiting for ${manages ? "you" : "the owner"} to accept — ${daysUntil(a.expiresAt)} days left.`,
          action: <GradientButton onClick={() => router.push(`/verify-or-issue/${a.id}`)}>Review and accept</GradientButton>,
        };
      case "LISTING":
        return { text: `${a.door === "REQUEST" ? "Approved" : "Accepted"}. We're publishing your listing — this can take a moment.` };
      case "DECLINED":
        return a.declinedByOrg
          ? { text: "You declined. Nothing is listed and NDI has been told." }
          : {
              text: `NDI hasn't approved this. Their reason: ${a.declineReason ?? "—"} You can change your request and ask again.`,
              action: isRoot ? (
                <HairlineButton onClick={() => router.push(`/verify-or-issue/ask?from=${a.id}`)}>Change and ask again</HairlineButton>
              ) : null,
            };
      case "WITHDRAWN":
        return {
          text: "You've withdrawn your request.",
          action: isRoot ? <HairlineButton onClick={() => router.push("/verify-or-issue/ask")}>Ask again later</HairlineButton> : null,
        };
      case "LAPSED":
        return {
          text: "This approval lapsed because the listing couldn't be published. NDI will contact you.",
          action: <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">Contact NDI</Link>,
        };
      case "HELD":
        return {
          text: "Your listing is held while NDI checks something. We'll contact you.",
          action: <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">Contact NDI</Link>,
        };
      case "STOPPED":
        /* Only reachable from the state switcher — nothing in the demo
           changes an organisation's primary identity — so Restore here
           shows the outcome rather than calling the store. */
        return restored
          ? { text: "Put back. Your listed public identity is primary again, and verifying and issuing have restarted." }
          : {
              text: "Your organisation's public identity has changed since it was approved. Verifying and issuing have stopped until it's put back.",
              action: manages ? <GradientButton onClick={() => setRestored(true)}>Restore</GradientButton> : null,
            };
      case "RESIGNED":
        return {
          text:
            a.capability === "verifier"
              ? "You've stopped verifying. You can no longer ask people for information."
              : "You've stopped issuing. Credentials you've already issued stay valid.",
          action: <Link href="/legal/support" className="ndi-plainlink text-[13px] font-medium text-accent">Contact NDI to be approved again</Link>,
        };
      case "SUPERSEDED":
        return { text: "Replaced by a wider approval. Kept on record." };
      default:
        return { text: "This has expired. NDI would need to propose it again." };
    }
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[920px] flex-col gap-5">
        <PageHeader crumbs={[{ label: name }, { label: "Verify or issue" }]} title="Verify or issue" />
        {forced === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is how things stood when you were last connected, on{" "}
            {formatDate(new Date().toISOString().slice(0, 10))}.
          </p>
        ) : null}

        {top.length === 0 ? (
          <Panel padded={false}>
            <EmptyState
              icon="shieldCheck"
              title={`${short} isn't approved to verify or issue.`}
              message={canAsk ? "Want to verify customers or issue credentials?" : "NDI approves organisations to verify or issue."}
              action={canAsk ? <GradientButton onClick={() => router.push("/verify-or-issue/ask")}>Ask NDI</GradientButton> : undefined}
            />
          </Panel>
        ) : (
          top.map((a) => {
            const pill = forced === "suspended" ? { status: "suspended", label: "Suspended" } : accPill(a, "org");
            const s = status(a);
            return (
              <Panel key={a.id}>
                <div className="relative z-[4] flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="m-0 font-display text-[17px] font-semibold text-strong">
                      {a.capability === "verifier" ? "Verifying" : "Issuing"}
                    </h2>
                    <StatusPill status={pill.status} label={pill.label} />
                  </div>
                  <p role="status" className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
                    {s.text}
                  </p>
                  <div className="flex flex-col gap-2">
                    <p className="m-0 text-[12.5px] text-muted">
                      {a.capability === "verifier" ? "What you can ask people for" : "What you can issue"}
                      {a.state === "ACTIVE" ? "" : a.door === "REQUEST" ? " — as you asked" : " — as proposed"}
                    </p>
                    <ScopeList capability={a.capability} ask={a.ask} issue={a.issue} />
                  </div>
                  {a.state === "ACTIVE" && a.publicIdentity ? (
                    <p className="m-0 text-[13px] leading-[1.6] text-muted">
                      Your organisation&rsquo;s public identity is{" "}
                      <span className="break-all font-mono text-[12px] text-body">{a.publicIdentity}</span>.
                    </p>
                  ) : null}
                  {a.state === "ACTIVE" && a.refusals?.count ? (
                    <p className="m-0 max-w-[66ch] text-[13px] leading-[1.6] text-body">
                      Refused in the last 30 days: {a.refusals.count} request{a.refusals.count === 1 ? "" : "s"} asked for
                      things you&rsquo;re not approved to ask for — {a.refusals.items.map(inline).join(", ")}.
                    </p>
                  ) : null}
                  {s.action ? <div className="flex flex-wrap gap-2.5">{s.action}</div> : null}
                  {replacedBy(a).map((old) => (
                    <div key={old.id} className="flex flex-col gap-1.5 border-t border-subtle pt-3">
                      <StatusPill status="superseded" label="Replaced" />
                      <p className="m-0 text-[12.5px] text-muted">
                        Earlier approval{old.listedAt ? `, listed ${formatDate(old.listedAt)}` : ""}: {old.ask.map((x) => inline(x.item)).join(", ") || old.issue.map((t) => t.name).join(", ")}.
                      </p>
                    </div>
                  ))}
                </div>
              </Panel>
            );
          })
        )}

        {canAsk && top.length > 0 && !top.some((a) => a.door === "REQUEST" && ["SUBMITTED", "IN_REVIEW", "PROPOSED"].includes(a.state)) && top.length < 2 ? (
          <p className="m-0 text-[13px] text-muted">
            Want to {top[0].capability === "verifier" ? "issue credentials" : "verify customers"} as well?{" "}
            <Link href="/verify-or-issue/ask" className="ndi-plainlink font-medium text-accent">
              Ask NDI
            </Link>
          </p>
        ) : null}

        <Dialog
          open={resigning !== null}
          onClose={() => setResigning(null)}
          tone="danger"
          title={resigning?.capability === "issuer" ? `Stop issuing for ${short}?` : `Stop verifying for ${short}?`}
          lead={
            resigning?.capability === "issuer"
              ? "You'll stop being able to issue straight away. Credentials you've already issued stay valid."
              : "You'll stop being able to ask people for information straight away."
          }
          consequences={[`${short} is taken off NDI's public list for this. Being approved again needs NDI.`]}
          confirmLabel={resigning?.capability === "issuer" ? "Stop issuing" : "Stop verifying"}
          onConfirm={() => {
            if (resigning) resignAccreditation(resigning.id);
            setResigning(null);
          }}
        />
      </div>
    </AppShell>
  );
}
