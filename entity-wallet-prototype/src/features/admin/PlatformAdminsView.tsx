"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
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
 * Platform admins — the first thing root does on the platform.
 *
 * INVITED BY ADDRESS, NOT PICKED FROM A LIST
 *
 * The first version listed NDI's staff with an "Invite" button beside each
 * name. It read as though the platform already knew who its administrators
 * would be and root was ticking boxes — and it implied an account for every
 * name before anyone had made one. An administrator is someone root decides
 * to trust, so root types the address the invitation goes to, and the
 * person sets up their own account from the link. The page lists only who
 * is an administrator and who has been invited, nothing speculative.
 *
 * ONLY ROOT MAKES ADMINISTRATORS
 *
 * An administrator sees this page read-only, with the reason stated where
 * the form would be (UXD-03). The store refuses a non-root invitation
 * regardless: the page is not the boundary.
 */
export function PlatformAdminsView() {
  const router = useRouter();
  const { people, orgInvitations, currentPerson, invitePlatformAdmin, withdrawInvitation, personById } = useDemo();
  const forced = useScreenState("SCR-ADM-01", ["default", "loading", "read_only"]);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ id: string; email: string } | null>(null);
  /* The confirmation, and the way on to the invitee's side, sit under the
     form — below the fold at laptop height once the list has rows — so the
     page brings them up when they appear. */
  const sentRef = useReveal<HTMLDivElement>(sent?.id);

  const isRoot = currentPerson.platformRole === "root" && forced !== "read_only";
  const root = people.find((p) => p.platformRole === "root");
  const admins = people.filter((p) => p.platformRole === "admin" && p.hasAccount !== false);
  const pending = orgInvitations.filter((i) => i.kind === "A" && i.state === "PENDING");

  const send = (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const result = invitePlatformAdmin(email);
      if (!result.ok) {
        setError(
          result.error === "invalid"
            ? "Enter a full email address, like name@bhutanndi.bt."
            : result.error === "already"
              ? "That address is already a platform admin, or has an invitation waiting."
              : "Only the root administrator can invite platform admins.",
        );
        return;
      }
      setSent({ id: result.id, email: email.trim().toLowerCase() });
      setEmail("");
    }, LOCAL_MS);
  };

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[900px] flex-col gap-5">
        <PageHeader crumbs={[{ label: "NDI administration" }, { label: "Platform admins" }]} title="Platform admins" />
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          The people who run the platform day to day: they review organisations&rsquo; requests for
          access and decide them. Nobody can bring an organisation onto the Entity Wallet until at
          least one of them has accepted.
        </p>

        {isRoot ? (
          <Panel>
            <form noValidate onSubmit={send} className="relative z-[4] flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Invite a platform admin</h2>
                <p className="m-0 max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  The invitation goes to this address. They open the link, set up their own account —
                  name and password — and become a platform admin. It lasts 30 days.
                </p>
              </div>
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
                    setError("");
                  }}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={error ? "admin-invite-error" : undefined}
                  className={`${FIELD_CLASS} h-12`}
                />
              </label>
              {error ? (
                <p id="admin-invite-error" role="alert" className="m-0 flex items-center gap-2 text-[13px]" style={{ color: "var(--text-danger)" }}>
                  <Icon name="shieldAlert" size={14} strokeWidth={2} className="flex-none" />
                  {error}
                </p>
              ) : null}
              <div>
                <GradientButton type="submit" disabled={busy || !email.trim()}>
                  <Icon name="send" size={14} strokeWidth={2} />
                  {busy ? "Sending…" : "Send invitation"}
                </GradientButton>
              </div>
            </form>
          </Panel>
        ) : (
          <p className="flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] leading-[1.6] text-body">
            <Icon name="lockRounded" size={15} strokeWidth={2} className="mt-[3px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            Only the root administrator can make someone a platform admin.
          </p>
        )}

        {sent ? (
          <div ref={sentRef} role="status" className="flex flex-col gap-3">
            <p className="m-0 flex items-center gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-accent" style={{ background: "var(--ndi-mint-08)" }}>
              <Icon name="check" size={14} strokeWidth={2.4} />
              Invitation sent to {sent.email}.
            </p>
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
          </div>
        ) : null}

        {forced === "loading" ? (
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
                    <StatusPill status="active" label="Root administrator" />
                  </Row>
                ) : null}
                {admins.map((p) => (
                  <Row key={p.id} name={p.name} email={p.email} divided>
                    <StatusPill status="active" label="Platform admin" />
                  </Row>
                ))}
                {pending.map((inv) => (
                  <Row key={inv.id} name="Invitation sent" email={inv.email} divided>
                    <StatusPill
                      status="pending"
                      label={`Invited by ${personById(inv.invitedBy).name.split(" ")[0]}${inv.expiresAt ? ` · until ${formatDate(inv.expiresAt)}` : ""}`}
                    />
                    <SimulatedLink onClick={() => router.push(`/invitation/${inv.id}`)}>Open as the invitee</SimulatedLink>
                    {isRoot ? (
                      <HairlineButton onClick={() => withdrawInvitation(inv.id)}>Withdraw</HairlineButton>
                    ) : null}
                  </Row>
                ))}
              </ul>
            </Panel>
            {admins.length === 0 && pending.length === 0 ? (
              <p className="m-0 text-[13px] leading-[1.6] text-muted">
                No platform admins yet{isRoot ? " — invite the first one above." : "."}
              </p>
            ) : null}
          </section>
        )}
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
