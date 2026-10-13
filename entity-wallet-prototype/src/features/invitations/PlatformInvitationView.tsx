"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { Countdown } from "@/components/ui/Countdown";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { AccountSetupForm } from "@/features/account/AccountSetupForm";
import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

import { ReviewInvitationView } from "./ReviewInvitationView";

/**
 * /invitation/[id] — which invitation screen a link opens.
 *
 * Member and agency invitations (FLOW-ONB-02's M and O) keep SCR-INV-04 as
 * it was. The platform's own two — an administrator invited by root (A), an
 * existing NDI organisation invited to its Entity Wallet (W) — get the
 * screen below: the same informed-consent shape, with what each one grants.
 */
export function InvitationView({ id }: { id: string }) {
  const { orgInvitations } = useDemo();
  const inv = orgInvitations.find((i) => i.id === id);
  if (inv && (inv.kind === "A" || inv.kind === "W")) return <PlatformInvitationView id={id} />;
  return <ReviewInvitationView id={id} />;
}

/**
 * WHAT EACH ONE HAS TO MAKE CLEAR
 *
 * An administrator's invitation grants power over other people's
 * organisations, so it names who is granting it (root, by name) and says
 * plainly what it does not include: acting for any business.
 *
 * AN ADMINISTRATOR SETS UP HERE, NOT THROUGH SIGN-UP
 *
 * The admin used to be sent off to the general sign-up — type the address
 * again, wait for a confirmation email, confirm, come back, then accept.
 * Every one of those steps re-proved something the link already proves:
 * that this person reads mail at the invited address. So the invitation is
 * the onboarding. They read what it grants, give their name and a password,
 * and the account and the acceptance happen together.
 *
 * An Entity Wallet invitation goes to someone who already has an NDI account
 * — the bank has issued on the platform for years — so there is no sign-up
 * detour. What it has to say is that accepting is not the end: the register
 * still has to confirm the person represents the bank. NDI inviting them
 * does not make them its representative, any more than it does for a
 * business that signs up by itself.
 */
function PlatformInvitationView({ id }: { id: string }) {
  const router = useRouter();
  const {
    orgInvitations,
    organizations,
    people,
    personById,
    signup,
    hydrated,
    acceptInvitation,
    declineInvitation,
    setSignupReturn,
    clearSignup,
    setPersona,
    startOrgOnboarding,
    setUpPlatformAdmin,
  } = useDemo();

  const forced = useScreenState("SCR-INV-04-platform", [
    "live",
    "loading",
    "default",
    "no_account",
    "setup",
    "accepted",
    "invalid",
  ]);
  const [busy, setBusy] = useState(false);
  const [declined, setDeclined] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const inv = orgInvitations.find((i) => i.id === id);
  const admin = inv?.kind === "A";
  const inviter = inv ? personById(inv.invitedBy) : null;
  const invitee = inv ? people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase()) : undefined;
  const org = inv?.orgId ? organizations.find((o) => o.id === inv.orgId) : undefined;

  /* An account exists if the invitee has one already (Bank of Bhutan's
     owner) or has just made one on the way here (an administrator). */
  const madeNow = signup?.stage === "done" && inv && signup.email.toLowerCase() === inv.email.toLowerCase();
  const hasAccount = Boolean(madeNow || (invitee && invitee.hasAccount !== false));

  const natural = !hydrated
    ? "loading"
    : !inv || inv.state === "REVOKED" || inv.state === "EXPIRED" || inv.state === "VOID" || inv.state === "DECLINED"
      ? "invalid"
      : inv.state === "ACCEPTED"
        ? "accepted"
        : admin
          ? "setup"
          : hasAccount
            ? "default"
            : "no_account";
  const face = forced !== "live" ? forced : declined ? "invalid" : natural;

  const setUp = (name: string) => {
    setFormError(null);
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const result = setUpPlatformAdmin(id, name);
      if (!result.ok) return setFormError("This invitation can no longer be used. Ask the root administrator to send a new one.");
      router.push("/dashboard");
    }, ROUND_TRIP_MS);
  };

  const createAccount = () => {
    if (!inv) return;
    if (signup && signup.email.toLowerCase() !== inv.email.toLowerCase()) clearSignup();
    setSignupReturn(`/invitation/${id}`, inv.email);
    router.push("/sign-up");
  };

  const accept = () => {
    if (!inv) return;
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const result = acceptInvitation(id);
      if (!result.ok) return;
      if (invitee) setPersona(invitee.id as Parameters<typeof setPersona>[0]);
      if (admin) {
        router.push("/admin/organisations");
      } else {
        startOrgOnboarding("company", id);
        router.push("/onboarding/prove");
      }
    }, ROUND_TRIP_MS);
  };

  const inviterName = inviter?.name ?? "NDI";
  const orgName = org?.name ?? inv?.legalName ?? "your organisation";

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          You&rsquo;ve been <span className="ndi-wave-text">invited</span>
        </>
      }
      lead={
        admin
          ? "Read what it gives you before you accept. Administering the platform means deciding other organisations' requests."
          : "Read what it gives you before you accept. An Entity Wallet lets the organisation hold its own credentials."
      }
    >
      {face === "loading" ? (
        <>
          <AuthCardHeader title="Opening your invitation" />
          <p role="status" className="relative z-[4] m-0 text-center text-[14px] text-muted">One moment…</p>
        </>
      ) : face === "invalid" ? (
        <>
          <AuthCardHeader title={declined ? "You've declined this invitation" : "This invitation is no longer valid"} />
          <p role="status" className="relative z-[4] m-0 text-center text-[14px] leading-[1.6] text-muted">
            {declined ? `${inviterName} has been told.` : `If you think you should still have it, ask ${inviterName}.`}
          </p>
        </>
      ) : face === "accepted" ? (
        <>
          <AuthCardHeader title="You've already accepted this invitation" />
          <div className="relative z-[4] flex flex-col gap-4">
            <GradientButton block onClick={() => router.push(admin ? "/sign-in" : "/dashboard")}>
              {admin ? "Sign in" : `Go to ${orgName}`}
            </GradientButton>
          </div>
        </>
      ) : (
        <>
          <AuthCardHeader
            title={
              admin
                ? `${inviterName} has invited you to administer Bhutan NDI`
                : `${inviterName} has invited ${orgName} to set up its Entity Wallet`
            }
          />
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[12px] border border-grid px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What you&rsquo;ll be able to do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                {admin
                  ? "Review organisations' requests for access — an Entity Wallet, issuing or verifying — and decide them, with your name on each decision. Invite organisations, and review the cases a register couldn't match."
                  : `Give ${orgName} a wallet of its own: it holds its registration and the credentials others issue to it, and named people act for it under scoped authority.`}
              </p>
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What this does not do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                {admin
                  ? "It doesn't let you act for any organisation, or hold any credential of theirs. Making other administrators stays with root."
                  : `It doesn't change what ${orgName} issues or verifies. And it doesn't confirm you represent it — the register is still asked, after you prove who you are.`}
              </p>
            </div>

            {inv?.expiresAt ? (
              <p className="m-0 flex items-center gap-2 text-[12.5px] text-faint">
                Invitation expires <Countdown expiresAt={inv.expiresAt} />
              </p>
            ) : null}

            {face === "setup" ? (
              <AccountSetupForm
                idPrefix="admin"
                email={inv?.email ?? ""}
                busy={busy}
                error={formError}
                onDismissError={() => setFormError(null)}
                onSubmit={setUp}
                submitLabel="Set up account and accept"
                busyLabel="Setting up your account…"
                onDecline={() => {
                  declineInvitation(id);
                  setDeclined(true);
                }}
              />
            ) : face === "no_account" ? (
              <>
                <AuthNotice>
                  You&rsquo;ll need an account to accept this. It takes a minute — we&rsquo;ll bring
                  you straight back here.
                </AuthNotice>
                <GradientButton block onClick={createAccount}>
                  Create an account
                  <Icon name="arrowRight" size={16} strokeWidth={2} />
                </GradientButton>
              </>
            ) : (
              <div className="flex flex-col gap-2.5">
                <GradientButton block onClick={accept} disabled={busy}>
                  {busy ? "Accepting…" : "Accept"}
                </GradientButton>
                <HairlineButton
                  onClick={() => {
                    declineInvitation(id);
                    setDeclined(true);
                  }}
                  disabled={busy}
                >
                  Decline
                </HairlineButton>
              </div>
            )}
          </div>
        </>
      )}
    </AuthShell>
  );
}
