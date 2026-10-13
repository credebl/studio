"use client";

import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AuthShell } from "@/components/layout/AuthShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Icon } from "@/components/ui/icons";
import { SecureSignInScene } from "@/components/ui/scenes";
import { shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { AuthCardHeader, AuthNotice } from "@/features/auth/AuthCard";

/**
 * SCR-INV-05 — Invitation accepted. FLOW-ONB-02 step 9.
 *
 * The two kinds land in sharply different places, and the screen has to set
 * the right expectation for each (UX-EW-01 §3.2):
 *
 * - A member lands in the organisation's console, told what they can now
 *   see and — again — that acting for it is separate. The organisation is
 *   named on the button, because a person who now belongs to two
 *   organisations must be able to tell which one they have just joined.
 * - A business invited to register (self-service sign-up off) goes straight
 *   into Flow 2 with the organisation already named by the invitation.
 * - An agency official lands on a task, with the steps ahead, because
 *   accepting is where their work starts rather than ends. Those steps are
 *   Flow 5, which this prototype has not built yet; the screen says so
 *   rather than leading into a page that pretends otherwise.
 */
export function InvitationAcceptedView({ id }: { id: string }) {
  const router = useRouter();
  const { orgInvitations, organizations, people, setPersona, setActiveOrg, startOrgOnboarding } = useDemo();

  const forced = useScreenState("SCR-INV-05", ["live", "loading", "member", "agency", "business", "error", "offline"]);

  const inv = orgInvitations.find((i) => i.id === id);
  const org = inv?.orgId ? organizations.find((o) => o.id === inv.orgId) : null;
  const kind =
    forced === "member" ? "M" : forced === "agency" || forced === "business" ? "O" : (inv?.kind ?? "M");
  /* An ordinary business invited to register — the route every business
     takes while self-service sign-up is off. Unlike an agency it has
     somewhere to go now: Flow 2, with the organisation already named. */
  const business = forced === "business" || (forced !== "agency" && kind === "O" && inv?.needsSecondApproval === false);
  const name = kind === "M" ? (org?.name ?? "Pelden Trading Pvt. Ltd.") : (inv?.legalName ?? "the organisation");

  /* Whoever accepted: the record the acceptance made or reused for that
     address (see joinOrganisation in the store). */
  const member = inv ? people.find((p) => p.email.toLowerCase() === inv.email.toLowerCase() && p.hasAccount !== false) : undefined;

  const goToOrg = () => {
    if (member) setPersona(member.id);
    if (inv?.orgId) setActiveOrg(inv.orgId);
    router.push("/dashboard");
  };

  return (
    <AuthShell
      scene={<SecureSignInScene />}
      title={
        <>
          You&rsquo;re <span className="ndi-wave-text">in</span>
        </>
      }
      lead="Membership lets you see the organisation. Authority to act for it, if you need it, is set up separately and you'll be asked to accept it."
    >
      {forced === "loading" ? (
        <>
          <AuthCardHeader title="Setting things up" />
          <div aria-hidden="true" className="relative z-[4] h-24 animate-pulse rounded-[12px] bg-[rgb(var(--tint)/0.04)]" />
        </>
      ) : forced === "error" ? (
        <>
          <AuthCardHeader title="We couldn't complete this" />
          <div className="relative z-[4] flex flex-col gap-4">
            <AuthNotice role="alert" tone="warning">
              Your account is fine, but joining didn&rsquo;t go through. Your link still works — try
              again shortly.
            </AuthNotice>
            <GradientButton block onClick={() => router.push(`/invitation/${id}`)}>
              Try again
            </GradientButton>
          </div>
        </>
      ) : kind === "M" ? (
        <>
          <AuthCardHeader title={`You've joined ${name}`} />
          <div className="relative z-[4] flex flex-col gap-4">
            <p role="status" className="m-0 text-center text-[14px] leading-[1.6] text-muted">
              You can now see {shortOrgName(name)}&rsquo;s information. You can&rsquo;t act for it yet —
              that&rsquo;s set up separately if you need it.
            </p>
            {forced === "offline" ? (
              <AuthNotice tone="warning">You&rsquo;re offline — the console will open when you&rsquo;re back.</AuthNotice>
            ) : null}
            <GradientButton block onClick={goToOrg} disabled={forced === "offline"}>
              Go to {name}
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </GradientButton>
            <HairlineButton onClick={() => router.push("/sign-in")}>Sign out</HairlineButton>
          </div>
        </>
      ) : business ? (
        <>
          <AuthCardHeader title={`Next: register ${name}`} />
          <div className="relative z-[4] flex flex-col gap-4">
            <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
              {[
                ["Prove who you are", "From your own NDI Wallet — the register is asked about the person, never about a typed name."],
                ["The register confirms you represent it", `The invitation names ${name}; the register still has to confirm it. NDI inviting you doesn't make you its representative.`],
                ["Receive its registration", "The organisation accepts its registration into its own wallet, and you become its owner."],
              ].map(([title, body], i) => (
                <li key={title} className="flex items-start gap-3 rounded-[12px] border border-grid px-3.5 py-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-grid font-mono text-[11px] text-muted">
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-body">{title}</span>
                    <span className="text-[12.5px] leading-[1.5] text-faint">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <GradientButton
              block
              disabled={forced === "offline"}
              onClick={() => {
                startOrgOnboarding("company", inv?.id);
                router.push("/onboarding/prove");
              }}
            >
              Register the organisation
              <Icon name="arrowRight" size={16} strokeWidth={2} />
            </GradientButton>
          </div>
        </>
      ) : (
        <>
          <AuthCardHeader title={`Next: register ${name}`} />
          <div className="relative z-[4] flex flex-col gap-4">
            <ol className="m-0 flex list-none flex-col gap-2.5 p-0">
              {[
                ["Register the organisation", "Its name and legal identity, as the invitation gave them."],
                ["Set up its identity on the platform", "Done by you, so the organisation's identity starts with it rather than with NDI."],
                ["NDI activates the designation", "Until then it can register but cannot issue anything."],
              ].map(([title, body], i) => (
                <li key={title} className="flex items-start gap-3 rounded-[12px] border border-grid px-3.5 py-3">
                  <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-grid font-mono text-[11px] text-muted">
                    {i + 1}
                  </span>
                  <span className="flex flex-col gap-0.5">
                    <span className="text-[13.5px] font-medium text-body">{title}</span>
                    <span className="text-[12.5px] leading-[1.5] text-faint">{body}</span>
                  </span>
                </li>
              ))}
            </ol>
            <GradientButton block disabled aria-describedby="flow5-note">
              Register the organisation
            </GradientButton>
            <p id="flow5-note" className="m-0 text-center text-[12.5px] leading-[1.5] text-faint">
              Prototype: registering a foundational issuer is Flow 5, which hasn&rsquo;t been built
              yet.
            </p>
          </div>
        </>
      )}
    </AuthShell>
  );
}
