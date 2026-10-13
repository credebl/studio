"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedAction, SimulatedLink, SimulatedStep } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useReveal } from "@/components/ui/useReveal";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

/**
 * Platform admins — SCR-INV-01 and SCR-INV-03 for Kind A (FLOW-ONB-02 v0.6).
 *
 * INVITED BY ADDRESS, NOT PICKED FROM A LIST
 *
 * The first version listed NDI's staff with an "Invite" button beside each
 * name. It read as though the platform already knew who its administrators
 * would be — and it implied an account for every name before anyone had
 * made one. So the inviter types the address, and the person sets up their
 * own account from the link.
 *
 * THE ROOT ACCOUNT IS BREAK-GLASS, NOT A WORKING ACCOUNT
 *
 * This page used to be root's alone: only root made administrators, and
 * root then counted as the second approver on everything. FLOW-ONB-02 v0.6
 * (§12 item 7) reversed both. The root account is an NDI role account under
 * split custody, used only to bring on the first two administrators and to
 * restore them if fewer than two are active (S9). So:
 *
 * - Root sees the form only while P8 allows another invitation, and is told
 *   why when it doesn't — instead of a form that would be refused (E14 stays
 *   the store's backstop). Root's form asks for a reason and the custodians
 *   present, because the platform can't tell which custodian acted (S10).
 * - After that, administrators invite each other, and every such invitation
 *   waits for a second, distinct administrator (S2) — refused outright while
 *   there is nobody to give it (E12).
 * - Root sees only the invitations it issued, and revoking one needs a
 *   reason, logged like every other use.
 */
type Face =
  | "live"
  | "root"
  | "root_two_active"
  | "root_enough_pending"
  | "admin"
  | "no_second_admin"
  | "refused"
  | "loading"
  | "offline";

export function PlatformAdminsView() {
  const router = useRouter();
  const { people, orgInvitations, currentPerson, invitePlatformAdmin, withdrawInvitation, personById, adminStatus } = useDemo();
  const forced = useScreenState("SCR-INV-01-admin", [
    "live",
    "root",
    "root_two_active",
    "root_enough_pending",
    "admin",
    "no_second_admin",
    "refused",
    "loading",
    "offline",
  ]) as Face;
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [custodians, setCustodians] = useState("");
  const [error, setError] = useState<{ field: "email" | "form"; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ id: string; email: string; queued: boolean } | null>(null);
  const [revoking, setRevoking] = useState<string | null>(null);
  const [revokeReason, setRevokeReason] = useState("");
  /* The confirmation, and the way on to the invitee's side, sit under the
     form — below the fold at laptop height once the list has rows — so the
     page brings them up when they appear. */
  const sentRef = useReveal<HTMLDivElement>(sent?.id);

  const status = adminStatus();
  const isRoot = currentPerson.platformRole === "root";
  const natural: Face = isRoot
    ? status.rootBlock === "two_active"
      ? "root_two_active"
      : status.rootBlock === "enough_pending"
        ? "root_enough_pending"
        : "root"
    : status.active < 2
      ? "no_second_admin"
      : "admin";
  const face: Face = forced === "live" ? natural : forced;
  const rootFace = face === "root" || face === "root_two_active" || face === "root_enough_pending" || (face === "refused" && isRoot);

  const root = people.find((p) => p.platformRole === "root");
  const admins = people.filter((p) => p.platformRole === "admin" && p.hasAccount !== false);
  /* SCR-INV-03: the root account sees only what it issued. */
  const pending = orgInvitations.filter(
    (i) => i.kind === "A" && (i.state === "PENDING" || i.state === "PENDING_APPROVAL") && (!isRoot || i.invitedBy === "root"),
  );

  const E12 = "There's no other administrator to approve this. Ask the root account custodians to restore one.";
  const E14 =
    "The root account can add administrators only while fewer than two are active, only as many as are needed to reach two, and only with a reason and the custodians named.";

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    if (face === "root" && (!reason.trim() || !custodians.trim())) {
      setError({ field: "form", text: "Give a reason and name the custodians present." });
      return;
    }
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      if (face === "offline") {
        setError({ field: "form", text: "You're offline. Nothing was sent — try again when you're back." });
        return;
      }
      if (face === "refused") {
        setError({ field: "form", text: isRoot ? E14 : E12 });
        return;
      }
      const result = invitePlatformAdmin(email, isRoot ? { reason, custodians } : undefined);
      if (!result.ok) {
        setError(
          result.error === "invalid"
            ? { field: "email", text: "Enter a full email address, like name@bhutanndi.bt." }
            : result.error === "E3"
              ? { field: "email", text: `${email.trim()} is already a platform admin, or has an invitation waiting.` }
              : result.error === "E12"
                ? { field: "form", text: E12 }
                : result.error === "E14"
                  ? { field: "form", text: E14 }
                  : { field: "form", text: "You don't have permission to invite administrators." },
        );
        return;
      }
      setSent({ id: result.id, email: email.trim().toLowerCase(), queued: result.queued });
      setEmail("");
      setReason("");
      setCustodians("");
    }, LOCAL_MS);
  };

  const errorText = (field: "email" | "form") =>
    error?.field === field ? (
      <p id={`admin-invite-${field}-error`} role="alert" className="m-0 flex items-start gap-2 text-[13px] leading-[1.55]" style={{ color: "var(--text-danger)" }}>
        <Icon name="shieldAlert" size={14} strokeWidth={2} className="mt-[3px] flex-none" />
        {error.text}
      </p>
    ) : null;

  const form = (
    <Panel>
      <form noValidate onSubmit={send} className="relative z-[4] flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Invite a platform admin</h2>
          <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
            The invitation goes to this address. They open the link, set up their own account — name and
            password — and become a platform admin. It lasts 14 days.
          </p>
        </div>
        {rootFace ? (
          <p className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
            <Icon name="key" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You&rsquo;re using the NDI root account. Give a reason and name the custodians present — this is
            logged and every administrator is told.
          </p>
        ) : null}
        <label className={FIELD_BLOCK_CLASS}>
          <span className={LABEL_CLASS}>Their email address</span>
          <input
            name="adminEmail"
            type="email"
            autoComplete="off"
            placeholder="name@bhutanndi.bt"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError(null);
            }}
            aria-invalid={error?.field === "email" ? true : undefined}
            aria-describedby={error?.field === "email" ? "admin-invite-email-error" : undefined}
            className={`${FIELD_CLASS} h-12`}
          />
          {errorText("email")}
        </label>
        {rootFace ? (
          <div className="grid gap-4 min-[761px]:grid-cols-2">
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Reason</span>
              <input
                name="rootReason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  setError(null);
                }}
                placeholder="For example: bringing on the first administrators"
                className={`${FIELD_CLASS} h-12`}
              />
            </label>
            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Custodians present</span>
              <input
                name="rootCustodians"
                value={custodians}
                onChange={(e) => {
                  setCustodians(e.target.value);
                  setError(null);
                }}
                placeholder="The two custodians, by name"
                className={`${FIELD_CLASS} h-12`}
              />
            </label>
          </div>
        ) : null}
        <div className="flex flex-col gap-1.5 rounded-[12px] border border-grid px-4 py-3">
          <p className="m-0 text-[13.5px] leading-[1.6] text-body">
            They&rsquo;ll be able to administer the platform, including approving what other administrators
            propose. They won&rsquo;t be able to approve anything they propose themselves.
          </p>
          {!rootFace ? (
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              This needs a second administrator to approve before it is sent.
            </p>
          ) : null}
        </div>
        {errorText("form")}
        <div>
          <GradientButton type="submit" disabled={busy || !email.trim()}>
            <Icon name="send" size={14} strokeWidth={2} />
            {busy ? "Sending…" : "Send invitation"}
          </GradientButton>
        </div>
      </form>
    </Panel>
  );

  const notice = (text: string) => (
    <div className="flex flex-col gap-2.5 rounded-[12px] border border-grid px-4 py-3">
      <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
        <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
        {text}
      </p>
      <div>
        <HairlineButton onClick={() => document.getElementById("admins-heading")?.scrollIntoView({ behavior: "smooth" })}>
          Go to pending list
        </HairlineButton>
      </div>
    </div>
  );

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Platform admins" }]} title="Platform admins" />
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          The people who run the platform day to day. The root account brings on the first two; after
          that, administrators invite each other, and each invitation needs a second administrator to
          approve it.
        </p>

        {face === "loading" ? null : face === "root_two_active" ? (
          notice("Two administrators are active, so the root account can't add more. Ask an administrator to invite them.")
        ) : face === "root_enough_pending" ? (
          notice("You've already invited enough administrators to reach two. Revoke one of those invitations if it's no longer needed.")
        ) : face === "no_second_admin" ? (
          <>
            {form}
            <p role="status" className="m-0 text-[13px] leading-[1.6] text-muted">
              Sending this will be refused: {E12.charAt(0).toLowerCase() + E12.slice(1)}
            </p>
          </>
        ) : (
          form
        )}

        {sent ? (
          <div ref={sentRef} role="status" className="flex flex-col gap-3">
            <p className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-accent" style={{ background: "var(--ndi-mint-08)" }}>
              <Icon name="check" size={14} strokeWidth={2.4} />
              {sent.queued
                ? `Waiting for a second administrator to approve the invitation to ${sent.email}. Nothing has been sent yet.`
                : `Invitation sent to ${sent.email}.`}
            </p>
            {!sent.queued ? (
              <SimulatedStep
                standsFor="the invitation email"
                action={
                  <SimulatedAction onClick={() => router.push(`/invitation/${sent.id}`)}>
                    Open the invitation as {sent.email}
                  </SimulatedAction>
                }
              >
                No email is sent in this prototype. Opening it is what the invitee would do from their inbox.
              </SimulatedStep>
            ) : null}
          </div>
        ) : null}

        {face === "loading" ? (
          <div aria-hidden="true" className="h-56 animate-pulse rounded-[16px] border border-grid" />
        ) : (
          <section aria-labelledby="admins-heading" className="flex flex-col gap-3">
            <h2 id="admins-heading" className="m-0 font-display text-[16px] font-semibold text-strong">
              Who administers the platform
            </h2>
            <Panel padded={false}>
              <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
                {root ? (
                  <Row name={root.name} email={root.email}>
                    <StatusPill status="active" label="Root account · bootstrap and emergencies" />
                  </Row>
                ) : null}
                {admins.map((p) => (
                  <Row key={p.id} name={p.name} email={p.email} divided>
                    <StatusPill status="active" label="Platform admin" />
                  </Row>
                ))}
                {pending.map((inv) => (
                  <Row key={inv.id} name="Invitation" email={inv.email} divided>
                    {inv.state === "PENDING_APPROVAL" ? (
                      <StatusPill status="pending_approval" label="Waiting for a second administrator to approve" />
                    ) : (
                      <StatusPill
                        status="pending"
                        label={`Sent by ${inv.invitedBy === "root" ? "the root account" : personById(inv.invitedBy).name.split(" ")[0]}${inv.expiresAt ? ` · until ${formatDate(inv.expiresAt)}` : ""}`}
                      />
                    )}
                    {inv.state === "PENDING" ? (
                      <SimulatedLink onClick={() => router.push(`/invitation/${inv.id}`)}>Open as the invitee</SimulatedLink>
                    ) : null}
                    {isRoot ? (
                      <HairlineButton onClick={() => setRevoking(inv.id)}>Revoke</HairlineButton>
                    ) : inv.invitedBy === currentPerson.id ? (
                      <HairlineButton onClick={() => withdrawInvitation(inv.id)}>Revoke</HairlineButton>
                    ) : null}
                  </Row>
                ))}
              </ul>
            </Panel>
            {admins.length === 0 && pending.length === 0 ? (
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                No platform admins yet{rootFace ? " — invite the first two above." : "."}
              </p>
            ) : null}
          </section>
        )}

        <Dialog
          open={revoking !== null}
          onClose={() => {
            setRevoking(null);
            setRevokeReason("");
          }}
          tone="danger"
          title="Revoke this invitation?"
          lead="It stops working straight away. Using the root account to revoke it is logged with your reason, and every administrator is told."
          confirmLabel="Revoke"
          confirmDisabled={!revokeReason.trim()}
          onConfirm={() => {
            if (revoking) withdrawInvitation(revoking, revokeReason);
            setRevoking(null);
            setRevokeReason("");
          }}
        >
          <label className={FIELD_BLOCK_CLASS}>
            <span className={LABEL_CLASS}>Reason</span>
            <input value={revokeReason} onChange={(e) => setRevokeReason(e.target.value)} className={`${FIELD_CLASS} h-11`} />
          </label>
        </Dialog>
      </div>
    </AppShell>
  );
}

function Row({
  name,
  email,
  divided,
  children,
}: {
  name: string;
  email: string;
  divided?: boolean;
  children: React.ReactNode;
}) {
  return (
    <li className={`flex flex-wrap items-center justify-between gap-3 px-5 py-4 ${divided ? "border-t border-subtle" : ""}`}>
      <span className="flex min-w-0 flex-col gap-0.5">
        <span className="text-[14px] font-medium text-body">{name}</span>
        <span className="text-[12.5px] text-faint">{email}</span>
      </span>
      <span className="flex flex-wrap items-center gap-2.5">{children}</span>
    </li>
  );
}
