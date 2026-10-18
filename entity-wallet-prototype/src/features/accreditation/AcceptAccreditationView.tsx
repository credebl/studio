"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { WalletHandoff } from "@/components/ui/WalletHandoff";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { ENFORCEMENT_DATE, VERIFICATION_ORG_NAME, roleIn, type Accreditation } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS, WALLET_HANDOFF_MS } from "@/lib/demoTiming";

import { ScopeList, daysUntil, inline } from "./shared";

/**
 * SCR-ACC-03 — What you're being approved for. FLOW-ACC-01 steps 4–7.
 *
 * THE MOST CONSEQUENTIAL SCREEN OF THE SET
 *
 * This is where an institution consents, by name, to being on NDI's public
 * list of trusted organisations. Everything after it is publishing. So the
 * screen says, before the decision and in this order: what NDI is
 * approving, what may be asked for or issued and that anything else is
 * refused; that accepting puts the organisation on a public list and
 * records the officer's name (the sentence that must survive review
 * unchanged, UXD-29); the public identity it will be listed under — one of
 * the two places a DID is shown, because the officer is accepting it too
 * (UXD-31); and that NDI hosts the keys. Declining is offered on equal
 * footing, with what declining does.
 *
 * SET UP, THEN THE WALLET, THEN ACCEPTED
 *
 * Accept first asks the store whether the organisation can be listed at
 * all — finished setting up (E5), a conforming public identity (E6). If not,
 * the screen says what is missing and offers the one action that fixes it,
 * before the wallet, so the officer approves the identity in the same step
 * as the acceptance rather than being asked twice. Then one wallet approval
 * confirms who they are and records that they accept. "Didn't confirm"
 * (E4) says plainly that nothing was accepted.
 */
type Face =
  | "live"
  | "default"
  | "recognition"
  | "setting_up"
  | "set_up_failed"
  | "not_set_up"
  | "waiting_wallet"
  | "not_confirmed"
  | "loading"
  | "success"
  | "expired"
  | "offline"
  | "no_permission"
  | "declined"
  | "not_found";

export function AcceptAccreditationView({ id }: { id: string }) {
  const router = useRouter();
  const {
    accreditations,
    organizations,
    people,
    currentPerson,
    personById,
    prepareAcceptance,
    acceptAccreditation,
    setUpPublicIdentity,
    declineAccreditationAsOrg,
    hydrated,
  } = useDemo();
  const forced = useScreenState("SCR-ACC-03", [
    "live",
    "default",
    "recognition",
    "setting_up",
    "set_up_failed",
    "not_set_up",
    "waiting_wallet",
    "not_confirmed",
    "loading",
    "success",
    "expired",
    "offline",
    "no_permission",
  ]) as Face;

  const [step, setStep] = useState<"idle" | "setting_up" | "set_up_failed" | "not_set_up" | "wallet" | "not_confirmed" | "done" | "declined">("idle");
  const [scan, setScan] = useState<"awaiting_scan" | "waiting">("awaiting_scan");
  const [busy, setBusy] = useState(false);

  const acc: Accreditation | undefined = accreditations.find((a) => a.id === id);
  const org = organizations.find((o) => o.id === acc?.orgId);
  const owner = people.find((p) => roleIn(org, p) === "Owner");
  const now = new Date().toISOString().slice(0, 10);

  const natural: Face = !acc
    ? "not_found"
    : step === "declined" || (acc.state === "DECLINED" && acc.declinedByOrg)
      ? "declined"
      : step === "done" || acc.state === "LISTING" || acc.state === "ACTIVE"
        ? "success"
        : acc.state === "EXPIRED" || (acc.state === "PENDING_ACCEPTANCE" && acc.expiresAt !== null && acc.expiresAt < now)
          ? "expired"
          : acc.state !== "PENDING_ACCEPTANCE"
            ? "not_found"
            : roleIn(org, currentPerson) !== "Owner"
              ? "no_permission"
              : step === "setting_up" || step === "set_up_failed" || step === "not_set_up"
                ? step
                : step === "wallet"
                  ? "waiting_wallet"
                  : step === "not_confirmed"
                    ? "not_confirmed"
                    : acc.door === "RECOGNITION"
                      ? "recognition"
                      : "default";
  const face: Face = forced === "live" ? natural : forced;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  /* A forced face with no record previews the bank's recognition below,
     so it is named as the bank too. */
  const name = org?.name ?? acc?.orgName ?? (forced !== "live" ? "Bank of Bhutan" : "Your organisation");
  const header = <PageHeader crumbs={[{ label: name }, { label: "Verify or issue", href: "/verify-or-issue" }, { label: "Approval" }]} title="What you're being approved for" />;
  const outcome = (text: React.ReactNode, action?: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            <div className="flex flex-wrap gap-2.5">{action}</div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (!acc && forced === "live") return outcome("There's no approval waiting at this address.");
  if (face === "not_found") return outcome("This approval isn't waiting for you any more.", <HairlineButton onClick={() => router.push("/verify-or-issue")}>See where it stands</HairlineButton>);
  if (face === "declined")
    return outcome("You've declined. Nothing is listed and NDI has been told.", <HairlineButton onClick={() => router.push("/dashboard")}>Close</HairlineButton>);
  if (face === "expired")
    return outcome(
      "This has expired. NDI would need to propose it again.",
      <Link href="/legal/support" className="ndi-plainlink text-[13.5px] font-medium text-accent">
        Contact NDI
      </Link>,
    );
  if (face === "success")
    return outcome(
      <>
        <Icon name="check" size={15} strokeWidth={2.4} className="mr-1.5 inline text-accent" />
        Accepted. We&rsquo;re publishing your listing — this can take a moment. Once it&rsquo;s published,{" "}
        {name} is approved to {acc?.capability === "issuer" ? "issue" : "verify"}.
      </>,
      <GradientButton onClick={() => router.push("/verify-or-issue")}>See approval status</GradientButton>,
    );

  /* From here on the approval is shown in full. Forced faces without a
     record borrow the bank's recognition, which is the story's own. */
  const a: Accreditation =
    acc ??
    ({
      id,
      orgId: "org-bob",
      orgName: "Bank of Bhutan Ltd.",
      officerEmail: null,
      door: "RECOGNITION",
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
      state: "PENDING_ACCEPTANCE",
      proposedBy: "tshering",
      proposedAt: now,
      requestedBy: null,
      requestedAt: null,
      recommendation: null,
      decidedBy: "root",
      decidedAt: now,
      declineReason: null,
      declinedByOrg: false,
      acceptedName: null,
      acceptedAt: null,
      listedAt: null,
      expiresAt: null,
      publicIdentity: null,
      refusals: null,
    } satisfies Accreditation);
  const short = name.replace(/ (Pvt\. )?Ltd\.$/, "");
  const did = org?.publicDid;
  const recognition = face === "recognition" || a.door === "RECOGNITION";
  const offline = face === "offline";
  const readOnly = offline || face === "no_permission";

  const accept = () => {
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const r = prepareAcceptance(a.id);
      if (r.ok) setStep("wallet");
      else if (r.error === "E6") setStep("setting_up");
      else if (r.error === "E5") setStep("not_set_up");
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <p className="m-0 max-w-[64ch] text-[14.5px] leading-[1.65] text-body">
              {a.capability === "verifier" ? (
                <>
                  NDI is approving {short} to ask people to share information from their NDI wallet, for:{" "}
                  {a.purpose.charAt(0).toLowerCase() + a.purpose.slice(1)}. You&rsquo;ll be able to ask for:{" "}
                  {a.ask.map((x) => inline(x.item)).join(", ")}. Anything else will be refused before it
                  reaches anyone.
                </>
              ) : (
                <>
                  NDI is approving {short} to issue {a.issue.map((t) => t.name).join(", ")}. People and
                  organisations will rely on them because {short} is on NDI&rsquo;s public list.
                </>
              )}
            </p>
            {recognition ? (
              <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-body">
                You&rsquo;re already doing this. Accepting keeps it running after {formatDate(ENFORCEMENT_DATE)}, when
                organisations that haven&rsquo;t been approved stop.
                {a.observed
                  ? ` NDI has seen ${short} asking for ${a.observed.ask.length} things since ${formatDate(a.observed.since)}; this approval covers ${a.ask.length}.`
                  : ""}
              </p>
            ) : null}
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                {a.capability === "verifier" ? "What you'll be able to ask for" : "What you'll be able to issue"}
              </h2>
              <ScopeList capability={a.capability} ask={a.ask} issue={a.issue} />
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="m-0 max-w-[64ch] text-[14px] leading-[1.6] text-body">
              Accepting adds {short} to NDI&rsquo;s public list of trusted organisations. Anyone can see that it is
              on the list. Your name is recorded as the person who accepted.
            </p>
            {did && face !== "setting_up" ? (
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                It will be listed under your organisation&rsquo;s public identity,{" "}
                <span className="break-all font-mono text-[12px] text-body">{did}</span>.
              </p>
            ) : null}
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              NDI hosts your organisation&rsquo;s keys, as it does for every organisation on the platform.
            </p>
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              Purpose: {a.purpose}. {a.agreementRef ? `Agreement ${a.agreementRef}. ` : ""}Proposed by{" "}
              {a.proposedBy ? personById(a.proposedBy).name : "NDI"}
              {a.decidedBy ? ` and approved by ${personById(a.decidedBy).name}` : ""}, at NDI.{" "}
              {a.expiresAt ? `${daysUntil(a.expiresAt)} days left to decide.` : ""}
            </p>
          </div>
        </Panel>

        {face === "setting_up" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 max-w-[64ch] text-[14px] leading-[1.6] text-body">
                {did
                  ? `Your organisation's public identity uses ${did.split(":").slice(0, 2).join(":")}. New approvals use did:ethr. Set it up here — it takes a moment.`
                  : "Your organisation doesn't have a public identity yet. New approvals use did:ethr. Set it up here — it takes a moment."}
              </p>
              <div>
                <GradientButton
                  onClick={() => {
                    if (!org) return;
                    setBusy(true);
                    window.setTimeout(() => {
                      setBusy(false);
                      const r = setUpPublicIdentity(org.id);
                      setStep(r.ok ? "wallet" : "set_up_failed");
                    }, LOCAL_MS);
                  }}
                  disabled={busy}
                >
                  {busy ? "Setting up…" : "Set it up"}
                </GradientButton>
              </div>
            </div>
          </Panel>
        ) : face === "set_up_failed" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="alert">
              <p className="m-0 text-[14px] leading-[1.6] text-body">
                We couldn&rsquo;t create your organisation&rsquo;s public identity. Nothing is listed yet — try again,
                or contact NDI.
              </p>
              <div>
                <HairlineButton onClick={() => setStep("setting_up")}>Try again</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : face === "not_set_up" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <p className="m-0 text-[14px] leading-[1.6] text-body">
                Your organisation hasn&rsquo;t finished setting up. Complete that, then return here.
              </p>
              <div>
                <HairlineButton onClick={() => router.push("/dashboard")}>Finish set-up</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : face === "waiting_wallet" ? (
          <Panel>
            <WalletHandoff
              value={`ndi-accept-${a.id}`}
              title={`${VERIFICATION_ORG_NAME} is asking who you are`}
              purpose="Approve in your NDI wallet. This confirms who you are and records your acceptance — including the public identity above — in one step."
              sharing={["Your identity, from your citizen credential"]}
              notSharing={["Anything else in your wallet"]}
              status={scan}
              onCancel={() => {
                setStep("idle");
                setScan("awaiting_scan");
              }}
              onSimulateScan={() => {
                setScan("waiting");
                window.setTimeout(() => {
                  const r = acceptAccreditation(a.id);
                  setScan("awaiting_scan");
                  setStep(r.ok ? "done" : "not_confirmed");
                }, WALLET_HANDOFF_MS);
              }}
            />
          </Panel>
        ) : null}

        {face === "not_confirmed" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
            Your NDI wallet didn&rsquo;t confirm. Nothing has been accepted — you can try again.
            {a.expiresAt ? ` ${daysUntil(a.expiresAt)} days left.` : ""}
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="m-0 text-[13.5px] text-body">
            You&rsquo;re offline, so you can&rsquo;t accept or decline right now. You can still print this.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 text-[13.5px] text-body">
            Only {owner?.name ?? "the organisation's owner"}, as {short}&rsquo;s owner, can accept or decline this.
          </p>
        ) : null}

        {face !== "waiting_wallet" && face !== "setting_up" && face !== "set_up_failed" && face !== "not_set_up" ? (
          <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <GradientButton onClick={accept} disabled={readOnly || busy}>
                <Icon name="wallet" size={15} strokeWidth={2} />
                {busy ? "Checking…" : face === "not_confirmed" ? "Try again" : "Accept with your NDI wallet"}
              </GradientButton>
              <HairlineButton
                onClick={() => {
                  declineAccreditationAsOrg(a.id);
                  setStep("declined");
                }}
                disabled={readOnly || busy}
              >
                Decline
              </HairlineButton>
              <HairlineButton onClick={() => window.print()}>Print</HairlineButton>
            </div>
            <p className="m-0 text-[12.5px] text-muted">You can decline. Nothing is listed and NDI is told.</p>
          </div>
        ) : null}
      </div>
    </AppShell>
  );
}
