"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedLink } from "@/components/ui/SimulatedStep";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { presetOf } from "./presets";
import { FullTerms, Responsibilities } from "./Responsibilities";

/**
 * SCR-DEL-03 — Review your appointment. FLOW-DEL-01 steps 5–6.
 *
 * WHO, WHAT, AND WHAT NOT
 *
 * The appointee is told who is appointing them — the representative, by
 * name, not the organisation as a faceless sender — that the representative
 * has confirmed they may make this appointment, and the document they cited
 * if any. Then what they will be able to do and, just as plainly, what they
 * will not: the negative clause every grant summary carries (UXD-04). Then
 * their responsibilities as things to do. UC-21 asks whether they can say
 * who appointed them and what they can't do; the screen states both.
 *
 * ACCEPT LEADS TO THE WALLET, AND THE WALLET IS THE ACCEPTANCE
 *
 * This used to ask for the scan first and then a separate "Accept these
 * duties" click — and skipped the scan entirely for someone already
 * confirmed. In the specification one wallet approval both confirms who
 * the appointee is and records that they accept (EW-FLOW3-SD/D7), so
 * Accept here goes to that approval (SCR-DEL-04), and the screen says
 * before they press it that their NDI wallet is needed. Everyone scans,
 * whoever they are: the approval is the acceptance, not only the proof.
 */
type Face = "default" | "already_accepted" | "not_found" | "expired" | "declined" | "registration_lost" | "no_longer_valid" | "offline" | "not_yours";

export function ReviewAppointmentView({ relationId }: { relationId: string }) {
  const router = useRouter();
  const { relations, people, organizations, harness, declineAppointment, setPersona, hydrated } = useDemo();
  const forced = useScreenState("SCR-DEL-03", ["live", "default", "expired", "declined", "registration_lost", "no_longer_valid", "offline"]);
  const [declined, setDeclined] = useState(false);

  const r = relations.find((x) => x.id === relationId);
  const org = organizations.find((o) => o.id === (r?.orgId ?? "org-pelden"));
  const orgName = org?.name ?? "Pelden Trading Pvt. Ltd.";
  const appointee = people.find((p) => p.id === r?.personId);
  const root = relations.find((x) => inOrg(org?.id ?? "org-pelden")(x) && x.isRootAuthority);
  const rep = people.find((p) => p.id === (r?.attestation?.attestedBy ?? root?.personId));
  const repName = rep?.name ?? "Dorji Wangchuk";
  const preset = presetOf(r?.preset ?? "receive");
  const shareWith = r?.scope.grants.flatMap((g) => (g.relyingParties.mode === "list" ? g.relyingParties.values : [])) ?? [];
  const uniqueShare = shareWith.filter((v, i, a) => a.indexOf(v) === i);
  const now = new Date().toISOString().slice(0, 10);

  /* E8 and E9 are both "the basis was lost", and the screen says which in
     plain words: the organisation's registration, or the representative. */
  /* An appointment already accepted is not offered again — reached by Back
     after accepting, it would otherwise reopen as pending. An address that
     matches nothing says so, without claiming anything about anyone. */
  const natural: Face = !r
    ? "not_found"
    : r.state === "ACTIVE" && r.personId === harness.persona
      ? "already_accepted"
      : declined || (r.state === "TERMINATED" && r.endedReason === "declined")
      ? "declined"
      : r.state === "EXPIRED" || (r.state === "PENDING_ACCEPTANCE" && r.expiresAt && r.expiresAt < now)
        ? "expired"
        : r.state !== "PENDING_ACCEPTANCE"
          ? org && !org.capabilities.includes("holder")
            ? "registration_lost"
            : "no_longer_valid"
          : r.personId !== harness.persona
            ? "not_yours"
            : "default";
  const face: Face = forced === "live" ? natural : (forced as Face);

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const header = <PageHeader crumbs={[{ label: orgName }, { label: "Your appointment" }]} title="Review your appointment" />;

  const outcome = (text: React.ReactNode, extra?: React.ReactNode) => (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3" role="status">
            <p className="m-0 max-w-[62ch] text-[14px] leading-[1.6] text-body">{text}</p>
            {extra}
            <div>
              <HairlineButton onClick={() => router.push("/dashboard")}>Leave</HairlineButton>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );

  if (face === "already_accepted")
    return outcome(
      <>You&rsquo;ve accepted this. You can act for {orgName} within what it covers.</>,
      <div>
        <GradientButton onClick={() => router.push("/organisation")}>See what you can do</GradientButton>
      </div>,
    );
  if (face === "not_found") return outcome(<>We can&rsquo;t find this appointment. Ask the person who appointed you.</>);
  if (face === "expired") return outcome(<>This appointment has expired. Ask {repName} to make it again.</>);
  if (face === "declined") return outcome(<>You&rsquo;ve declined. Nothing has changed.</>);
  if (face === "registration_lost")
    return outcome(<>This appointment can&rsquo;t go ahead because {orgName}&rsquo;s registration can&rsquo;t be confirmed.</>);
  if (face === "no_longer_valid")
    return outcome(
      <>
        This appointment is no longer valid because {repName} is no longer {orgName}&rsquo;s representative.
      </>,
    );
  if (face === "not_yours")
    return outcome(
      <>Only {appointee?.name ?? "the person appointed"} can accept this appointment.</>,
      appointee ? (
        <div>
          <SimulatedLink
            onClick={() => {
              setPersona(appointee.id as Parameters<typeof setPersona>[0]);
            }}
          >
            Continue as {appointee.name} (stands in for opening it on their own account)
          </SimulatedLink>
        </div>
      ) : null,
    );

  const first = repName.split(" ")[0];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        <p className="max-w-[64ch] text-[14.5px] leading-[1.65] text-body">
          {repName} has given you authority to act for {orgName.replace(/\.$/, "")}. {first} is recorded as its representative,
          and has confirmed they&rsquo;re authorised to appoint you.
          {r?.document
            ? ` They cited a ${r.document.type === "board_resolution" ? "board resolution" : r.document.type === "power_of_attorney" ? "power of attorney" : "written authority"}${r.document.date ? ` dated ${formatDate(r.document.date)}` : ""}${r.document.reference ? `, kept at ${r.document.reference}` : ""}.`
            : ""}
        </p>

        <Panel>
          <div className="relative z-[4] grid gap-5 min-[761px]:grid-cols-2">
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">You&rsquo;ll be able to</h2>
              <p className="m-0 font-mono text-[10.5px] uppercase tracking-[0.14em] text-muted">{preset?.label}</p>
              {preset?.allows.map((a) => (
                <p key={a} className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="check" size={14} strokeWidth={2.4} className="mt-[5px] flex-none text-accent" />
                  {a}
                </p>
              ))}
              {uniqueShare.length ? (
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  With: {uniqueShare.join(", ")}
                  {r?.shareNeedsApproval ? ". Each share needs approval." : "."}
                </p>
              ) : null}
              <p className="m-0 text-[13px] text-muted">
                {r?.scope.validUntil ? `Until ${formatDate(r.scope.validUntil)}.` : "No end date — until it's ended."}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">You won&rsquo;t be able to</h2>
              {preset?.doesNotAllow.map((a) => (
                <p key={a} className="m-0 flex items-start gap-2.5 text-[13.5px] leading-[1.6] text-body">
                  <Icon name="close" size={14} strokeWidth={2.4} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
                  {a}
                </p>
              ))}
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <Responsibilities orgName={orgName.replace(/ (Pvt\. )?Ltd\.$/, "")} />
            <FullTerms orgName={orgName.replace(/ (Pvt\. )?Ltd\.$/, "")} />
          </div>
        </Panel>

        <p className="m-0 flex max-w-[64ch] items-start gap-2.5 text-[13px] leading-[1.6] text-muted">
          <Icon name="wallet" size={15} strokeWidth={2} className="mt-[2px] flex-none text-faint" />
          Accepting needs your NDI wallet: one approval there confirms it&rsquo;s you and records that you
          accept. {r?.expiresAt ? `This offer lapses on ${formatDate(r.expiresAt)}.` : ""}
        </p>

        {face === "offline" ? (
          <p role="status" className="m-0 text-[13px] text-body">
            You&rsquo;re offline. Nothing has changed — try again when you&rsquo;re back.
          </p>
        ) : null}

        <div className="flex flex-wrap items-center gap-2.5">
          <GradientButton onClick={() => router.push(`/appointments/${relationId}/confirm`)} disabled={face === "offline"}>
            Accept
            <Icon name="arrowRight" size={15} strokeWidth={2} />
          </GradientButton>
          <HairlineButton
            onClick={() => {
              declineAppointment(relationId);
              setDeclined(true);
            }}
            disabled={face === "offline"}
          >
            Decline
          </HairlineButton>
        </div>
      </div>
    </AppShell>
  );
}
