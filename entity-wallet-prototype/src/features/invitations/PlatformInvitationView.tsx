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
import { SimulatedAction, SimulatedStep } from "@/components/ui/SimulatedStep";
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
 * existing NDI organisation invited to hold its own records (W) — get the
 * screen below: the same informed-consent shape, with what each one grants.
 *
 * KINDS A AND W ARE THE PROTOTYPE'S, NOT FLOW-ONB-02'S
 *
 * FLOW-ONB-02 defines Kind M and Kind O only. Platform admins are a
 * deployment precondition there (P6), and an existing organisation reaching
 * Flow 2 has no invitation at all. The prototype needed to show both on
 * screen, so it added these two kinds; they reuse Kind O's 30-day expiry.
 * They are recorded as deviations in the PR and on the what's-real page, so
 * the showcase doesn't take them as round-1 evidence for the spec.
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
    currentPerson,
    signIn,
  } = useDemo();

  const forced = useScreenState("SCR-INV-04-platform", [
    "live",
    "loading",
    "default",
    "no_account",
    "setup",
    "wrong_person",
    "accepted",
    "expired",
    "revoked",
    "void",
    "declined",
  ]);
  const [busy, setBusy] = useState(false);
  /* What the store answered when the person pressed a button. It decides
     the face over the invitation's recorded state: a refusal at
     acceptance (expired on the day, root no longer root) must show, not
     leave the person looking at a spinner that stopped. */
  const [result, setResult] = useState<Face | null>(null);
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
  /* SCR-INV-04: "signed in as the invited address". In the demo the link
     is usually opened straight after sending, still as the inviter — the
     case the screen has to catch rather than accept for them. */
  const signedInAsInvitee = Boolean(
    inv && (madeNow || currentPerson.email.toLowerCase() === inv.email.toLowerCase()),
  );
  /* A pending invitation past its date is expired, whatever the record
     says — the store refuses it, so the screen should not offer it. */
  const pastDate = Boolean(inv?.expiresAt && inv.expiresAt < new Date().toISOString().slice(0, 10));

  const natural: Face | "loading" = !hydrated
    ? "loading"
    : /* Unknown and expired render identically (UX-EW-01 §3.4). */
      !inv || inv.state === "EXPIRED" || (inv.state === "PENDING" && pastDate)
      ? "expired"
      : inv.state === "ACCEPTED"
        ? "accepted"
        : inv.state === "VOID"
          ? "void"
          : inv.state === "DECLINED"
            ? "declined"
            : inv.state !== "PENDING"
              ? "revoked"
              : hasAccount
                ? signedInAsInvitee
                  ? "default"
                  : "wrong_person"
                : admin
                  ? "setup"
                  : "no_account";
  const face = forced !== "live" ? (forced as Face | "loading") : (result ?? natural);

  /* The store's answer, as a face. */
  const faceFor = (error: string): Face =>
    error === "E4"
      ? "expired"
      : error === "E6"
        ? "void"
        : error === "E7"
          ? "accepted"
          : error === "no_account"
            ? admin
              ? "setup"
              : "no_account"
            : error === "wrong_person" || error === "has_account"
              ? signedInAsInvitee
                ? "default"
                : "wrong_person"
              : "revoked";

  const setUp = (name: string) => {
    setFormError(null);
    setBusy(true);
    window.setTimeout(() => {
      setBusy(false);
      const r = setUpPlatformAdmin(id, name);
      if (r.ok) return router.push("/dashboard");
      if (r.error === "invalid") return setFormError("Enter your name.");
      setResult(faceFor(r.error));
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
      const r = acceptInvitation(id);
      if (!r.ok) {
        setResult(faceFor(r.error));
        return;
      }
      if (invitee) setPersona(invitee.id as Parameters<typeof setPersona>[0]);
      if (admin) {
        router.push("/admin/organisations");
      } else {
        startOrgOnboarding("company", id);
        router.push("/onboarding/prove");
      }
    }, ROUND_TRIP_MS);
  };

  /* Stands in for signing in from the link as the invited address — the
     invitee's own browser, in the product. */
  const signInAsInvitee = () => {
    if (!inv) return;
    if (signIn(inv.email).ok) setResult(null);
  };

  const decline = () => {
    declineInvitation(id);
    setResult("declined");
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
          : "Read what it gives you before you accept. This lets the organisation keep its own proof of registration and show it itself."
      }
    >
      {face === "loading" ? (
        <>
          <AuthCardHeader title="Opening your invitation" />
          <p role="status" className="relative z-[4] m-0 text-center text-[14px] text-muted">One moment…</p>
        </>
      ) : face === "expired" ? (
        /* E4 names who to ask; it is not the revoked copy (UX-EW-01 §3.5). */
        <Outcome title="This invitation has expired" body={`Ask ${inviterName} to send you a new one.`} />
      ) : face === "revoked" ? (
        <Outcome title="This invitation is no longer valid" body={`If you think you should still have it, ask ${inviterName}.`} />
      ) : face === "void" ? (
        /* E6: the person has just consented and is being refused, so it
           reads as a lapse, never a rejection of them. */
        <Outcome
          title="This invitation can no longer be accepted"
          body={`It has lapsed since it was sent — nothing you did caused that. Ask ${inviterName} to send you a new one.`}
        />
      ) : face === "declined" ? (
        <Outcome title="You've declined this invitation" body={`${inviterName} has been told.`} />
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
                : `${inviterName} has invited ${orgName} to keep its own proof of registration`
            }
          />
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex flex-col gap-2.5 rounded-[12px] border border-grid px-4 py-3.5">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What you&rsquo;ll be able to do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                {admin
                  ? "Decide organisations' requests about what they're allowed to do on the platform, with your name on each decision, and invite organisations onto it."
                  : `Let ${orgName} keep its own proof of registration, and the records other agencies give it, and show them itself — with the people it chooses able to act for it, within limits it sets.`}
              </p>
              <p className="m-0 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">What this does not do</p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                {admin
                  ? "It doesn't let you act for any organisation, or see anything they keep. Making other administrators stays with root."
                  : `It doesn't change anything ${orgName} already does on the platform. And it doesn't confirm you represent it — the register is still asked, after you prove who you are.`}
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
                onDecline={decline}
              />
            ) : face === "wrong_person" ? (
              <>
                <AuthNotice tone="warning">
                  This invitation is for <strong className="text-strong">{inv?.email}</strong>, and
                  you&rsquo;re signed in as {currentPerson.email}.
                </AuthNotice>
                {/* The invited address already has an account: its owner
                    signs in with it, then accepts — never a second set-up. */}
                <SimulatedStep
                  standsFor="signing in as the invited address"
                  action={<SimulatedAction onClick={signInAsInvitee}>Sign in as {inv?.email}</SimulatedAction>}
                >
                  In the product they would sign in from the link in their own browser.
                </SimulatedStep>
              </>
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
                <HairlineButton onClick={decline} disabled={busy}>
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

type Face =
  | "default"
  | "no_account"
  | "setup"
  | "wrong_person"
  | "accepted"
  | "expired"
  | "revoked"
  | "void"
  | "declined";

function Outcome({ title, body }: { title: string; body: string }) {
  return (
    <>
      <AuthCardHeader title={title} />
      <p role="status" className="relative z-[4] m-0 text-center text-[14px] leading-[1.6] text-muted">
        {body}
      </p>
    </>
  );
}
