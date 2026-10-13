"use client";

import { useRouter } from "next/navigation";
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
import { SimulatedLink } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { NDI_ORG, shortOrgName, type AccessRequest, type OrgCapability } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

const CAPABILITY_LABEL: Record<OrgCapability, string> = {
  issuer: "Issue credentials",
  verifier: "Verify credentials",
  holder: "Entity Wallet",
};

/**
 * Organisations — what each one may do on the platform, and what it has
 * asked for.
 *
 * THREE GRANTS, ONE PLACE
 *
 * Issuing, verifying and holding (the Entity Wallet) are separate, and an
 * organisation can have any mix: Bank of Bhutan issues and verifies and asks
 * for a wallet; Pelden holds and does neither of the others. Showing all
 * three side by side, per organisation, is what lets an administrator see
 * that asking for a wallet adds to what a bank does rather than replacing it.
 *
 * APPROVING A WALLET SENDS AN INVITATION, NOT A WALLET
 *
 * An Entity Wallet rests on the register confirming who represents the
 * organisation. So approving the request invites the person who asked; they
 * still prove who they are and the register still answers. Issuing and
 * verifying are granted directly — the platform's existing product, where
 * NDI's approval is the decision.
 *
 * A decline needs a reason the organisation is shown, as in manual review.
 */
export function OrganisationsAdminView() {
  const router = useRouter();
  const { organizations, accessRequests, orgInvitations, personById, currentPerson, decideAccessRequest } = useDemo();
  const forced = useScreenState("SCR-ADM-02", ["default", "loading", "empty", "offline"]);

  const [confirming, setConfirming] = useState<{ id: string; approve: boolean } | null>(null);
  const [reason, setReason] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const pending = forced === "empty" ? [] : accessRequests.filter((a) => a.state === "PENDING");
  const decided = accessRequests.filter((a) => a.state !== "PENDING");
  const target = confirming ? accessRequests.find((a) => a.id === confirming.id) : undefined;
  const orgName = (id: string) => organizations.find((o) => o.id === id)?.name ?? "An organisation";
  const offline = forced === "offline";
  const admin = currentPerson.platformRole === "admin" || currentPerson.platformRole === "root";

  const close = () => {
    setConfirming(null);
    setReason("");
  };

  const walletState = (orgId: string) => {
    const org = organizations.find((o) => o.id === orgId);
    if (org?.capabilities.includes("holder")) return { status: "active", label: "Active" };
    const req = accessRequests.find((a) => a.orgId === orgId && a.capability === "holder" && a.state !== "DECLINED");
    if (req?.state === "APPROVED") return { status: "invited", label: "Owner invited" };
    if (req?.state === "PENDING") return { status: "requested", label: "Requested" };
    return { status: "not_set_up", label: "Not set up" };
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[1000px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Organisations" }]} title="Organisations" />
        <p className="max-w-[70ch] text-[13.5px] leading-[1.65] text-muted">
          What each organisation may do on the platform — issue, verify, and hold an Entity Wallet —
          and what it has asked for. Your decision is recorded with your name.
        </p>

        {done ? (
          <p role="status" className="flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-accent" style={{ background: "var(--ndi-mint-08)" }}>
            <Icon name="check" size={14} strokeWidth={2.4} />
            {done}
          </p>
        ) : null}
        {offline ? (
          <p role="status" className="rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so decisions are switched off.
          </p>
        ) : null}

        <section aria-labelledby="req-heading" className="flex flex-col gap-3">
          <h2 id="req-heading" className="m-0 font-display text-[16px] font-semibold text-strong">
            Waiting for a decision
          </h2>
          {forced === "loading" ? (
            <div aria-hidden="true" className="h-40 animate-pulse rounded-[16px] border border-grid" />
          ) : pending.length === 0 ? (
            <Panel padded={false}>
              <EmptyState
                icon="building"
                title="No requests waiting"
                message="When an organisation asks for an Entity Wallet, or to issue or verify, it waits here."
              />
            </Panel>
          ) : (
            pending.map((req) => (
              <RequestCard
                key={req.id}
                req={req}
                orgName={orgName(req.orgId)}
                disabled={offline || !admin}
                onDecide={(approve) => setConfirming({ id: req.id, approve })}
              />
            ))
          )}
        </section>

        <section aria-labelledby="orgs-heading" className="flex flex-col gap-3">
          <h2 id="orgs-heading" className="m-0 font-display text-[16px] font-semibold text-strong">
            On the platform
          </h2>
          <Panel padded={false}>
            <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
              {/* NDI's own organisation runs the platform; it is not on it. */}
              {organizations.filter((o) => o.id !== NDI_ORG).map((o, i) => {
                const wallet = walletState(o.id);
                return (
                  <li key={o.id} className={`flex flex-col gap-2.5 px-5 py-4 min-[761px]:flex-row min-[761px]:items-center min-[761px]:justify-between ${i > 0 ? "border-t border-subtle" : ""}`}>
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[14px] font-medium text-body">{o.name}</span>
                      <span className="text-[12.5px] text-faint">{o.description}</span>
                    </span>
                    <span className="flex flex-wrap items-center gap-1.5">
                      <StatusPill status={o.capabilities.includes("issuer") ? "active" : "inactive"} label={o.capabilities.includes("issuer") ? "Issues" : "Doesn't issue"} />
                      <StatusPill status={o.capabilities.includes("verifier") ? "active" : "inactive"} label={o.capabilities.includes("verifier") ? "Verifies" : "Doesn't verify"} />
                      <StatusPill status={wallet.status} label={`Entity Wallet: ${wallet.label.toLowerCase()}`} />
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>
        </section>

        {decided.length ? (
          <section aria-labelledby="decided-heading" className="flex flex-col gap-2.5">
            <h2 id="decided-heading" className={LABEL_CLASS}>
              Decided
            </h2>
            {decided.map((req) => {
              const inv = req.invitationId ? orgInvitations.find((x) => x.id === req.invitationId) : undefined;
              return (
                <div key={req.id} className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3">
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-body">
                      {orgName(req.orgId)} · {CAPABILITY_LABEL[req.capability]}
                    </span>
                    <span className="text-[12.5px] text-faint">
                      {req.decidedBy ? personById(req.decidedBy).name : "—"}
                      {req.decidedAt ? `, ${formatDate(req.decidedAt)}` : ""}
                      {req.reason ? ` · ${req.reason}` : ""}
                      {inv ? ` · invitation to ${inv.email}${inv.state === "ACCEPTED" ? ", accepted" : ""}` : ""}
                    </span>
                  </span>
                  <span className="flex flex-wrap items-center gap-2.5">
                    {inv && inv.state === "PENDING" ? (
                      <SimulatedLink onClick={() => router.push(`/invitation/${inv.id}`)}>Open as the invitee</SimulatedLink>
                    ) : null}
                    <StatusPill
                      status={req.state === "APPROVED" ? "approved" : "declined"}
                      label={req.state === "APPROVED" ? (req.capability === "holder" ? "Owner invited" : "Granted") : "Declined"}
                    />
                  </span>
                </div>
              );
            })}
          </section>
        ) : null}

        <Dialog
          open={confirming?.approve === true}
          onClose={close}
          title={
            target?.capability === "holder"
              ? `Invite ${target.requesterName} to set up ${orgName(target.orgId)}'s Entity Wallet?`
              : `Let ${target ? orgName(target.orgId) : "this organisation"} ${target?.capability === "verifier" ? "verify" : "issue"} credentials?`
          }
          lead={
            target?.capability === "holder"
              ? "An invitation goes to the person who asked. The wallet exists only once the register confirms they represent the organisation."
              : "This takes effect now. It is recorded with your name."
          }
          consequences={
            target?.capability === "holder"
              ? [
                  `The invitation goes to ${target.requesterEmail} and lasts 30 days`,
                  "What the organisation issues and verifies is unchanged",
                  "The decision is recorded with your name",
                ]
              : ["The decision is recorded with your name, and the organisation sees it"]
          }
          confirmLabel={target?.capability === "holder" ? "Send the invitation" : "Grant it"}
          onConfirm={() => {
            if (!target) return;
            decideAccessRequest(target.id, true);
            setDone(
              target.capability === "holder"
                ? `Invitation sent to ${target.requesterName} at ${orgName(target.orgId)}.`
                : `${orgName(target.orgId)} can now ${target.capability === "verifier" ? "verify" : "issue"} credentials.`,
            );
            close();
          }}
        />
        <Dialog
          open={confirming?.approve === false}
          onClose={close}
          tone="danger"
          title={`Decline ${target ? orgName(target.orgId) : "this organisation"}'s request?`}
          lead="The organisation is shown your reason, so write it for them."
          confirmLabel="Decline"
          confirmDisabled={!reason.trim()}
          onConfirm={() => {
            if (!target || !reason.trim()) return;
            decideAccessRequest(target.id, false, reason.trim());
            setDone(`Declined — ${orgName(target.orgId)} has been told why.`);
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
              placeholder="For example: we need the board resolution naming who will own the wallet."
            />
            <span className="text-[12.5px] leading-[1.5] text-faint">Required — a decline needs a reason they can act on.</span>
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}

function RequestCard({
  req,
  orgName,
  disabled,
  onDecide,
}: {
  req: AccessRequest;
  orgName: string;
  disabled: boolean;
  onDecide: (approve: boolean) => void;
}) {
  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">{CAPABILITY_LABEL[req.capability]}</p>
            <p className="font-display text-[17px] font-semibold text-strong">{orgName}</p>
          </div>
          <StatusPill status="requested" label="Waiting for a decision" />
        </div>
        <DetailList
          items={[
            { label: "Asked for", value: req.capability === "holder" ? "An Entity Wallet — to hold its own credentials" : CAPABILITY_LABEL[req.capability] },
            { label: "Asked by", value: `${req.requesterName} · ${req.requesterEmail}` },
            { label: "Why", value: req.note || "—" },
            { label: "Sent", value: formatDate(req.submittedAt) },
          ]}
        />
        <div className="flex flex-col gap-3 border-t border-subtle pt-4">
          <p className="text-[13px] leading-[1.6] text-muted">
            {req.capability === "holder"
              ? `Approving invites ${req.requesterName} to set it up. The register still has to confirm they represent ${shortOrgName(orgName)}.`
              : `Approving lets ${orgName} ${req.capability === "verifier" ? "verify credentials people present to it" : "issue credentials"} from now on.`}
          </p>
          <div className="flex flex-wrap gap-2.5">
            <GradientButton onClick={() => onDecide(true)} disabled={disabled}>
              <Icon name="check" size={15} strokeWidth={2.2} />
              {req.capability === "holder" ? "Approve and invite" : "Approve"}
            </GradientButton>
            <HairlineButton onClick={() => onDecide(false)} disabled={disabled}>
              Decline
            </HairlineButton>
          </div>
        </div>
      </div>
    </Panel>
  );
}
