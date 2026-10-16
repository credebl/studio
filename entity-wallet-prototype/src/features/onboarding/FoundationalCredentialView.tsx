"use client";

import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { GradientButton } from "@/components/ui/GradientButton";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { formatDate } from "@/features/controllership/scopeModel";
import { Icon } from "@/components/ui/icons";
import { PELDEN, inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { NextCredentialAction } from "./NextCredentialAction";
import { OnboardingShell } from "./OnboardingShell";
import { kindOf } from "./orgKinds";

/**
 * SCR-ORG-07 — Organisation verified. FLOW-ORG-01 step 12.
 *
 * NOTHING TO ACCEPT
 *
 * The registration is accepted into the organisation's wallet automatically
 * at step 10 — agent to agent, scoped to the offer from the designated
 * authority. This screen used to ask the person to "accept the
 * registration": a user action the specification never had, and one that
 * made the most important credential in the chain look optional. It now
 * shows what the organisation already holds.
 *
 * THE NEXT CREDENTIAL, NOT THE NEXT ADMINISTRATIVE TASK
 *
 * The primary action is the next link in the chain — for a company, its
 * tax identity, which is applied for with this registration (UXD-14). It is
 * what shows the wallet works. Inviting colleagues and appointing someone
 * are administration offered before the organisation has done anything
 * with what it just received, and the largest group of users is the
 * proprietor who *is* the representative. Requesting a credential is
 * FLOW-CRD-01, not built here; the button says so rather than leading
 * nowhere silently.
 *
 * WHAT IT CAN DO, AND WHAT IT CAN'T
 *
 * "Verified" alone reads as "approved for everything". So the summary
 * carries the negative clause (UXD-04): it can hold and present
 * credentials; it can't issue them or verify anyone else's.
 *
 * NOT YET ACCEPTED
 *
 * Verified is not the same as usable. Until the representative accepts
 * responsibility (SCR-DEL-01, FLOW-DEL-02) the screen names the organisation
 * as verified and offers one thing — accepting — and nothing else that
 * could be used. A decline is stated without reading as a penalty, with the
 * way back offered and, for the other case, the authority named as the
 * place to change who the representative is (DEL-02/E2).
 *
 * GIVING OTHERS AUTHORITY, ONLY WHERE IT MEANS SOMETHING
 *
 * Giving someone authority to act and seeing who can act are secondary,
 * and only for an organisation that is not a sole proprietorship (UXD-24):
 * a proprietor delegating to themselves is not a task. "Ask NDI" to verify
 * or issue (FLOW-ACC-02) waits for Flow 4.
 *
 * NAME DIFFERS
 *
 * The organisation takes the name the authority returned. Where that
 * differs from the name the person knew it by — the invitation's, or the
 * organisation's name on the platform — the difference is stated rather
 * than substituted silently.
 */
export function FoundationalCredentialView() {
  const router = useRouter();
  const { heldCredentials, orgOnboarding, orgInvitations, organizations, responsibilities, hydrated, setActiveOrg, setPersona } =
    useDemo();
  const forced = useScreenState("SCR-ORG-07", [
    "live",
    "default",
    "name_differs",
    "not_yet_accepted",
    "declined",
    "sole_proprietorship",
  ]);

  const kind = kindOf(orgOnboarding?.kind);
  const invitation = orgInvitations.find((i) => i.id === orgOnboarding?.invitationId);
  const existingId = orgOnboarding?.existingOrgId ?? (invitation?.kind === "W" ? invitation.orgId : null);
  const existing = existingId ? organizations.find((o) => o.id === existingId) : undefined;
  const orgId = existing?.id ?? PELDEN;

  const legalName = orgOnboarding?.authoritativeName ?? "Pelden Trading Pvt. Ltd.";
  const shortName = legalName.replace(/ (Pvt\. )?Ltd\.$/, "");
  const knownAs = existing?.name ?? invitation?.legalName ?? null;
  const nameDiffers =
    forced === "name_differs" || (forced === "live" && Boolean(knownAs) && knownAs !== legalName);
  const shownKnownAs = knownAs && knownAs !== legalName ? knownAs : "Pelden Trading";

  const foundational = heldCredentials.filter(inOrg(orgId)).find((c) => c.isFoundational);
  const attributes = foundational?.attributes ?? [
    { name: "registered_name", value: legalName },
    { name: "registration_number", value: orgOnboarding?.identifier ?? "CRA-2019-04477" },
    { name: "entity_type", value: kind.label },
    { name: "status", value: "Active" },
  ];
  const company = kind.value === "company";

  const open = (path: string) => {
    setActiveOrg(orgId);
    if (!existing) setPersona("dorji");
    router.push(path);
  };

  if (!hydrated) {
    return (
      <OnboardingShell current={4}>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </OnboardingShell>
    );
  }

  /* Reached by URL with nothing verified. The credential is the authority's
     to give, and a screen reached by address must not appear to hand it out. */
  const responsibility = responsibilities.find((r) => r.orgId === orgId)?.state ?? "ACCEPTED";
  const notAccepted =
    forced === "not_yet_accepted" || forced === "declined" || (forced === "live" && responsibility !== "ACCEPTED");
  const declined = forced === "declined" || (forced === "live" && responsibility === "DECLINED");
  const delegation = forced === "sole_proprietorship" ? false : kind.value !== "sole_proprietorship";

  if (forced === "live" && orgOnboarding?.stage !== "verified") {
    return (
      <OnboardingShell current={0}>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <p className="font-display text-[15px] font-semibold text-strong">No organisation has been verified yet</p>
            <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
              An organisation is verified once the authority that registered it confirms you represent it.
            </p>
            <div>
              <HairlineButton onClick={() => router.push("/onboarding")}>Verify an organisation</HairlineButton>
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  if (notAccepted) {
    return (
      <OnboardingShell current={4}>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
            {shortName} is <span className="ndi-wave-text">verified</span>
          </h1>
        </div>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.65] text-body">
              {declined
                ? `You've declined. Nobody can act for ${shortName} until someone accepts. If you're not the right person, the ${kind.authority} needs to update its records.`
                : `${shortName} is verified. Before you can use it, accept responsibility for acting on its behalf.`}
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <GradientButton onClick={() => router.push("/onboarding/responsibility")}>
                {declined ? "Reopen and accept" : "Accept responsibility"}
              </GradientButton>
              {declined ? (
                <HairlineButton onClick={() => router.push("/welcome")}>Leave</HairlineButton>
              ) : null}
            </div>
          </div>
        </Panel>
      </OnboardingShell>
    );
  }

  return (
    <OnboardingShell current={4}>
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-[26px] font-semibold leading-[1.15] tracking-[-0.025em] text-strong">
          {shortName} is <span className="ndi-wave-text">verified</span>
        </h1>
        <p className="max-w-[64ch] text-[13.5px] leading-[1.65] text-muted">
          The {kind.authority} confirmed you represent it, and its registration is now in the
          organisation&rsquo;s own wallet — added automatically, with nothing for you to accept.
        </p>
      </div>

      {nameDiffers ? (
        <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
          <Icon name="info" size={15} strokeWidth={2} className="mt-[3px] flex-none text-faint" />
          <span>
            The {kind.authority} has it registered as <span className="font-medium">{legalName}</span>, not{" "}
            {shownKnownAs}. That&rsquo;s the name it&rsquo;s known by here.
          </span>
        </p>
      ) : null}

      {/* The next step leads, above the sheet: it is what this screen is for. */}
      <Panel>
        <div className="relative z-[4] flex flex-col gap-3">
          <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Next</h2>
          {company ? (
            <>
              <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-body">
                Get {shortName}&rsquo;s tax identity (TPN) from the Department of Revenue &amp; Customs.
                It&rsquo;s applied for with the registration it now holds.
              </p>
              <div className="flex flex-wrap items-start gap-2.5">
                <NextCredentialAction orgName={shortName} />
                <HairlineButton onClick={() => open("/wallet/credentials")}>View the credential</HairlineButton>
              </div>
            </>
          ) : (
            <>
              <p className="m-0 max-w-[62ch] text-[13.5px] leading-[1.6] text-body">
                {shortName} can now hold the credentials issued to it and present them when it&rsquo;s
                asked to prove something about itself.
              </p>
              <div>
                <HairlineButton onClick={() => open("/wallet/credentials")}>View the credential</HairlineButton>
              </div>
            </>
          )}
        </div>
      </Panel>

      {/* One sheet, laid out the way a wallet shows a credential it holds:
          the card and the facts about the credential on the left, what it
          certifies about the organisation on the right. */}
      <Panel padded={false}>
        <div className="relative z-[4] grid min-[761px]:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4 border-b border-subtle p-5 min-[641px]:p-6 min-[761px]:border-b-0 min-[761px]:border-r">
            <CredentialCard type="Business Registration" issuer={kind.authority} status="active" />
            <dl className="m-0 flex flex-col">
              {[
                { label: "Issued by", value: kind.authority },
                { label: "Held by", value: `${shortName}’s wallet` },
                { label: "Added", value: "Automatically, when it was verified" },
                { label: "Valid until", value: "Doesn’t expire" },
              ].map((row, i) => (
                <div key={row.label} className={`flex items-baseline justify-between gap-4 py-2 ${i > 0 ? "border-t border-subtle" : ""}`}>
                  <dt className="flex-none text-[12.5px] text-faint">{row.label}</dt>
                  <dd className="m-0 min-w-0 text-right text-[13px] text-body">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="flex min-w-0 flex-col gap-5 p-5 min-[641px]:p-6">
            <div>
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What it certifies</h2>
              <dl className="m-0 mt-2 flex flex-col">
                {attributes.map((attribute, i) => (
                  <div
                    key={attribute.name}
                    className={`grid gap-0.5 py-3 min-[521px]:grid-cols-[minmax(0,170px)_minmax(0,1fr)] min-[521px]:items-baseline min-[521px]:gap-5 ${
                      i > 0 ? "border-t border-subtle" : ""
                    }`}
                  >
                    <dt className="text-[12.5px] text-faint">{attributeLabel(attribute.name)}</dt>
                    <dd className="m-0 min-w-0 break-words text-[14px] font-medium text-strong">
                      <AttributeValue name={attribute.name} value={attribute.value} />
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="flex flex-col gap-2 border-t border-subtle pt-4">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What {shortName} can do now</h2>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                Receive credentials issued to it, and present them when asked.
              </p>
              <p className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                {existing?.capabilities.some((c) => c === "issuer" || c === "verifier")
                  ? "Its issuing and verifying carry on exactly as before — verifying it changed neither."
                  : "It can't issue credentials to others or verify anyone else's."}
              </p>
            </div>
          </div>
        </div>
      </Panel>

      <div className="flex flex-wrap items-center gap-2.5">
        {/* Straight to the organisation's dashboard, which is where the
            specification sends this screen. It used to go back to the
            account's list of organisations (SCR-ONB-05) — a list of one,
            where the person had to choose the organisation they had just
            verified. The list is still there at the next sign-in. */}
        <HairlineButton onClick={() => open("/dashboard")}>
          {`Go to ${existing?.name ?? shortName}`}
          <Icon name="arrowRight" size={14} strokeWidth={2} />
        </HairlineButton>
        {delegation ? (
          <>
            <HairlineButton onClick={() => open("/people-who-can-act/give")}>Give someone authority to act</HairlineButton>
            <button type="button" onClick={() => open("/people-who-can-act")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
              See who can act
            </button>
          </>
        ) : null}
        {existing ? null : (
          <button type="button" onClick={() => router.push("/onboarding")} className="ndi-plainlink text-[12.5px] font-medium text-muted">
            Add another organisation
          </button>
        )}
      </div>
    </OnboardingShell>
  );
}

/* The payload's own attribute names are snake case — right for the wire,
   wrong on a document. */
function attributeLabel(name: string): string {
  /* "Entity" is not a word the person is shown (UX-EW-01 §2.4). */
  if (name === "entity_type") return "Type of organisation";
  const words = name.replace(/_/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/* Dates arrive as ISO strings and are written the way the rest of the
   console writes them; the registration number is set in mono because it is
   an identifier people read out and compare character by character; and the
   register's status goes through StatusPill, because a status is never told
   by the word alone in this console either. */
function AttributeValue({ name, value }: { name: string; value: string }) {
  if (name === "status") {
    return <StatusPill status={value.toLowerCase() === "active" ? "active" : "pending"} label={value} />;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return <>{formatDate(value)}</>;
  if (name === "registration_number") return <span className="font-mono text-[13.5px] tabular-nums">{value}</span>;
  return <>{value}</>;
}
