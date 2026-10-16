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
import { SimulatedStep, SimulatedAction } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

type Face = "apply" | "requested" | "invited" | "declined" | "active";

/**
 * An organisation already on NDI asks for an Entity Wallet.
 *
 * THE THIRD WAY ONTO THE ENTITY WALLET
 *
 * Bank of Bhutan has issued and verified on NDI for years; it has an owner
 * account and nobody needs to create one. What it does not have is a wallet
 * of its own. It cannot simply switch one on — the wallet rests on a
 * register confirming who represents the bank, and on NDI agreeing — so it
 * asks, a platform admin reviews the request, and the admin's answer is an
 * invitation to the person who asked. That person then proves who they are
 * and the register confirms them, exactly as a new company is confirmed.
 *
 * WHAT CHANGES, SAID BEFORE ANYONE ASKS
 *
 * Nothing about what the bank issues or verifies. The screen says so up
 * front, because the obvious worry from someone running an issuer is that
 * asking for a new thing puts the existing one at risk.
 */
export function EntityWalletRequestView() {
  const router = useRouter();
  const { organizations, activeOrgId, accessRequests, orgInvitations, personById, applyForEntityWallet } = useDemo();
  const forced = useScreenState("SCR-EW-REQ", ["live", "apply", "requested", "invited", "declined", "active"]);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);

  const org = organizations.find((o) => o.id === activeOrgId);
  const name = org?.name ?? "Your organisation";
  const latest = accessRequests.find((a) => a.orgId === activeOrgId && a.capability === "holder");
  const invitation = latest?.invitationId ? orgInvitations.find((i) => i.id === latest.invitationId) : undefined;

  const natural: Face = org?.capabilities.includes("holder")
    ? "active"
    : !latest
      ? "apply"
      : latest.state === "PENDING"
        ? "requested"
        : latest.state === "DECLINED"
          ? "declined"
          : "invited";
  const face: Face = forced === "live" ? natural : (forced as Face);

  const send = () => {
    setBusy(true);
    window.setTimeout(() => {
      applyForEntityWallet(note.trim());
      setBusy(false);
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        <PageHeader crumbs={[{ label: name }, { label: "Entity Wallet" }]} title="An Entity Wallet for your organisation" />
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          {name} already issues and verifies credentials on NDI. An Entity Wallet adds something
          different: the organisation holds credentials issued <em>to it</em> — its registration,
          its licences — and named people act for it under scoped authority.
        </p>

        <Panel>
          <div className="relative z-[4] grid gap-4 min-[761px]:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What changes</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                {name} gets a wallet of its own, holding its registration once the register confirms who
                represents it.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What doesn&rsquo;t</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                Everything it issues and verifies today carries on exactly as it is.
              </p>
            </div>
          </div>
        </Panel>

        {face === "apply" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-4">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Ask NDI for one</h2>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                A platform administrator reviews the request. If they approve it, they invite you to set
                the wallet up — and you&rsquo;ll prove who you are so the register can confirm you
                represent {name}.
              </p>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>What you&rsquo;ll use it for</span>
                <textarea
                  className={`${FIELD_CLASS} resize-y py-3`}
                  rows={3}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="For example: to hold our registration and banking licence, and present them to correspondent banks."
                />
              </label>
              <div>
                <GradientButton onClick={send} disabled={busy}>
                  <Icon name="send" size={15} strokeWidth={2} />
                  {busy ? "Sending…" : "Send the request to NDI"}
                </GradientButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {face === "requested" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-2" role="status">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Sent to NDI</h2>
                <StatusPill status="requested" label="Waiting for a platform admin" />
              </div>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                {latest ? `Sent ${formatDate(latest.submittedAt)}. ` : ""}A platform administrator will
                review it. If they approve, an invitation comes to you by email.
              </p>
            </div>
          </Panel>
        ) : null}

        {face === "invited" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">NDI approved it — check your email</h2>
                <StatusPill status="invited" label="Invitation sent" />
              </div>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                {latest?.decidedBy ? `${personById(latest.decidedBy).name} approved the request` : "The request was approved"}
                {invitation ? ` and sent an invitation to ${invitation.email}.` : "."} Opening it starts the
                set-up: you prove who you are, and the register confirms you represent {name}.
              </p>
              {invitation ? (
                <SimulatedStep
                  standsFor="the invitation email"
                  action={
                    <SimulatedAction onClick={() => router.push(`/invitation/${invitation.id}`)}>
                      Open the invitation
                    </SimulatedAction>
                  }
                >
                  No email is sent in this prototype.
                </SimulatedStep>
              ) : null}
            </div>
          </Panel>
        ) : null}

        {face === "declined" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3" role="status">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">NDI didn&rsquo;t approve it this time</h2>
              <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-body">{latest?.reason ?? "No reason was recorded."}</p>
            </div>
          </Panel>
        ) : null}

        {face === "active" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">{name}&rsquo;s Entity Wallet is set up</h2>
                <StatusPill status="active" label="Active" />
              </div>
              <div className="flex flex-wrap gap-2.5">
                <Link href="/wallet/credentials">
                  <GradientButton>See what it holds</GradientButton>
                </Link>
                <Link href="/dashboard">
                  <HairlineButton>Go to the dashboard</HairlineButton>
                </Link>
              </div>
            </div>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
