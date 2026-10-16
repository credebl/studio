"use client";

import Link from "next/link";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { Panel } from "@/components/ui/Panel";
import { WaveBanner } from "@/components/ui/WaveBanner";
import { Icon } from "@/components/ui/icons";
import { NextCredentialAction } from "@/features/onboarding/NextCredentialAction";
import { NeedsAttention } from "@/features/wallet/NeedsAttention";

import { NdiDashboard } from "./NdiDashboard";
import { StatusPill } from "@/components/ui/StatusPill";
import { NDI_ORG, PELDEN, roleIn, shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * B1 — the landing surface.
 *
 * The entity wallet's screen and nothing else. It used to share the page
 * with the inherited Studio issuer panels — schema, credential-definition
 * and issued-credential counts under an "Issue credential" button — which
 * told the room this organisation issues credentials. It doesn't: it holds
 * and presents them, and issuing is reached only through endorsement
 * (Flow 4). So the page is what needs you, what you may do, and — for the
 * owner — what has happened.
 */
export function DashboardView({ firstName }: { firstName?: string } = {}) {
  const { organizations, activeOrgId, activity, currentPerson, harness, firstRun, people, relations, orgInvitations } =
    useDemo();

  /* The suspended face is a §9 global rather than a fixture state: a
     controller whose authority is pulled mid-session must hit an explained
     dead end, not a dashboard that quietly still works. */
  const screenState = useScreenState("B1", ["has_tasks", "all_clear", "access_suspended"]);

  const name = firstName ?? currentPerson.name.split(" ")[0];
  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "The organisation";
  /* Pelden's owner gets the owner's dashboard: granting authority, the
     history. The feed and the first-day steps are Pelden's alone. */
  const isOwner = harness.persona === "dorji" && activeOrgId === PELDEN;
  const holder = Boolean(org?.capabilities.includes("holder"));
  /* This organisation's history only — see `log` in the store. */
  const feed = activity.filter((a) => (a.orgId ?? PELDEN) === activeOrgId);
  /* Whether anyone besides the owner has joined yet. On the first day the
     owner is alone, and the one useful next step is inviting colleagues:
     authority can only be granted to someone who is already a member
     (FLOW-ONB-02 hands its members to controller appointment). */
  const colleagues = people.filter((p) => p.id !== harness.persona && p.hasAccount !== false && roleIn(org, p));
  const invitationsWaiting = orgInvitations.filter(
    (i) => i.kind === "M" && i.orgId === activeOrgId && i.state === "PENDING",
  ).length;
  /* A member who holds no authority — typically someone who has just
     accepted an invitation. Their dashboard says what membership is. */
  const memberOnly =
    !isOwner && Boolean(roleIn(org, currentPerson)) && !relations.some((r) => r.personId === harness.persona && r.state === "ACTIVE");

  /* NDI's own organisation — root's and the admins' console. */
  if (activeOrgId === NDI_ORG) {
    return (
      <AppShell>
        <NdiDashboard name={name} />
      </AppShell>
    );
  }

  /* An organisation on NDI its authority has not confirmed — Bank of
     Bhutan before its owner verifies it. Its dashboard is about what it
     already does, with the way to verify it beside that (FLOW-ORG-01 A1).
     It used to offer to ask NDI for a wallet; verifying is the owner's to
     do directly, and NDI decides nothing about it. */
  if (!holder) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <WaveBanner
            eyebrow="— Dashboard"
            title={
              <>
                Welcome back, <span className="ndi-wave-text ndi-wave-tight">{name}</span>
              </>
            }
            lead={`${orgName} issues and verifies credentials on the Bhutan NDI network.`}
            action={
              <Link href="/entity-wallet">
                <GradientButton>
                  <Icon name="shieldCheck" size={16} strokeWidth={2} />
                  Verify {orgName}
                </GradientButton>
              </Link>
            }
          />
          <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(300px,1fr))]">
            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">What {orgName} does on NDI</h2>
                <ul className="m-0 flex list-none flex-col gap-2 p-0">
                  {org?.capabilities.includes("issuer") ? (
                    <li className="flex items-center justify-between gap-3 text-[13.5px] text-body">
                      Issues credentials
                      <Link href="/credentials/issue" className="ndi-plainlink text-[12.5px] font-medium text-accent">
                        Issue one
                      </Link>
                    </li>
                  ) : null}
                  {org?.capabilities.includes("verifier") ? (
                    <li className="flex items-center justify-between gap-3 text-[13.5px] text-body">
                      Verifies credentials
                      <Link href="/verification" className="ndi-plainlink text-[12.5px] font-medium text-accent">
                        Verify
                      </Link>
                    </li>
                  ) : null}
                </ul>
              </div>
            </Panel>
            <Panel>
              <div className="relative z-[4] flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Verification</h2>
                  <StatusPill status="unverified" label="Not verified" />
                </div>
                <p className="m-0 text-[13px] leading-[1.6] text-muted">
                  {orgName} hasn&rsquo;t been verified yet. Verify it to start using it: the authority
                  that registered it confirms who represents it, and it gets a wallet of its own
                  holding its registration. What it issues and verifies stays as it is.
                </p>
              </div>
            </Panel>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {/* A first day is greeted as one. "Welcome back" over an empty
            console reads as data that went missing; "welcome" over the same
            console reads as a beginning. */}
        <WaveBanner
          eyebrow="— Dashboard"
          title={
            <>
              {firstRun ? "Welcome" : "Welcome back"},{" "}
              <span className="ndi-wave-text ndi-wave-tight">{name}</span>
            </>
          }
          lead={
            firstRun && isOwner
              ? colleagues.length === 0
                ? `${orgName} is verified and holds its registration. Nothing has happened here yet.`
                : `${orgName} is verified and holds its registration.`
              : memberOnly
                ? `You're a member of ${shortOrgName(orgName)}. You can see its information; acting for it is set up separately.`
                : `${orgName}'s wallet — what needs you, and what you may do for it.`
          }
          action={
            activeOrgId !== PELDEN ? (
              <Link href="/wallet/credentials">
                <GradientButton>
                  <Icon name="credentials" size={16} strokeWidth={2} />
                  See what it holds
                </GradientButton>
              </Link>
            ) : isOwner && firstRun ? (
              /* The first day leads with the next credential, not with
                 inviting people or appointing anyone (UXD-14): it is what
                 the owner most likely came for. Inviting is offered below,
                 and appointing is available but not prompted. */
              <NextCredentialAction orgName={shortOrgName(orgName)} />
            ) : isOwner && org?.kind !== "sole_proprietorship" ? (
              /* UXD-24: never for a sole proprietorship — a proprietor
                 delegating to themselves is not a task. */
              <Link href="/people-who-can-act/give">
                <GradientButton>
                  <Icon name="userCheck" size={16} strokeWidth={2} />
                  Give someone authority
                </GradientButton>
              </Link>
            ) : (
              <Link href="/wallet/authority">
                <GradientButton>
                  <Icon name="lockRounded" size={16} strokeWidth={2} />
                  See my authority
                </GradientButton>
              </Link>
            )
          }
        />

        {firstRun && isOwner && screenState !== "access_suspended" ? (
          <FirstSteps colleagues={colleagues.length} invitationsWaiting={invitationsWaiting} />
        ) : null}

        {screenState === "access_suspended" ? (
          <Panel>
            <div className="relative z-[4] flex items-start gap-3">
              <Icon
                name="shieldAlert"
                size={18}
                strokeWidth={2}
                className="mt-0.5 flex-none"
                style={{ color: "var(--ndi-danger)" }}
              />
              <div className="flex flex-col gap-1">
                <p className="font-display text-[14.5px] font-semibold text-strong">
                  Your access has been suspended
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Nothing you attempt will go through while it is paused, so
                  there is no point starting anything. The owner can lift it, and
                  you can appeal it.
                </p>
                <div className="mt-2 flex flex-wrap gap-2.5">
                  <Link href="/wallet/authority">
                    <HairlineButton className="h-10 px-4 text-[13px]">
                      See my authority
                    </HairlineButton>
                  </Link>
                  <Link href="/appeals">
                    <HairlineButton className="h-10 px-4 text-[13px]">Appeal it</HairlineButton>
                  </Link>
                </div>
              </div>
            </div>
          </Panel>
        ) : (
          /* The entity wallet leads. `all_clear` empties the queue so the
             cleared face can be reviewed without deciding everything first. */
          <NeedsAttention key={screenState} allClear={screenState === "all_clear"} />
        )}

        {/* What has happened, for the owner. Others see their own tasks and
            authority above; the organisation's history is not theirs to
            browse. */}
        {!isOwner ? null : (
        <>
        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <h2 className="m-0 font-display text-[17px] font-semibold leading-[1.25] tracking-[-0.01em] text-strong">
              Recent activity
            </h2>
            {feed.length ? (
              <ol className="m-0 flex list-none flex-col p-0">
                {feed.slice(0, 6).map((a, i) => (
                  <li
                    key={a.id}
                    className={`flex flex-wrap items-center justify-between gap-3 py-2.5 ${
                      i > 0 ? "border-t border-subtle" : ""
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        aria-hidden="true"
                        className="h-1.5 w-1.5 flex-none rounded-full"
                        style={{ background: "var(--accent)" }}
                      />
                      <span className="truncate text-[13.5px] text-body">{a.text}</span>
                    </span>
                    <span className="flex-none text-[12px] text-faint">{a.at}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="m-0 text-[13.5px] text-muted">Looks like there is no activity yet.</p>
            )}
          </div>
        </Panel>
        </>
        )}
      </div>
    </AppShell>
  );
}

/**
 * What a new organisation's owner can do next. Shown only on the first day,
 * and only to the owner.
 *
 * THE ORDER IS THE USER'S, NOT THE CATALOGUE'S
 *
 * The next credential leads (UXD-14): for a company, its tax identity,
 * applied for with the registration it just received. Seeing that
 * registration comes second. Inviting colleagues is third and stays
 * available — it is how anyone else joins — but it is not what the first
 * day is for. Appointing someone to act (FLOW-DEL-01) used to be a step
 * here; it is available, not prompted, and the proprietor who *is* the
 * representative has nobody to appoint.
 */
function FirstSteps({ colleagues, invitationsWaiting }: { colleagues: number; invitationsWaiting: number }) {
  const steps: { icon: "users" | "credentials"; title: string; body: string; href: string | null; cta: string }[] = [
    {
      icon: "credentials",
      title: "Get its tax identity (TPN)",
      body: "From the Department of Revenue & Customs, applied for with the registration it now holds.",
      href: null,
      cta: "Get the TPN",
    },
    {
      icon: "credentials",
      title: "See its registration",
      body: "Added to its wallet automatically when it was verified.",
      href: "/wallet/credentials",
      cta: "Open held credentials",
    },
    {
      icon: "users",
      title: "Invite your colleagues",
      body:
        colleagues > 0
          ? `${colleagues === 1 ? "One colleague has" : `${colleagues} colleagues have`} joined${invitationsWaiting ? `, and ${invitationsWaiting} ${invitationsWaiting === 1 ? "invitation is" : "invitations are"} waiting` : ""}. Members can see the organisation; acting for it is set up separately.`
          : invitationsWaiting > 0
            ? `${invitationsWaiting === 1 ? "One invitation is" : `${invitationsWaiting} invitations are`} waiting to be accepted. Members can see the organisation; acting for it is set up separately.`
            : "Members can see the organisation. Acting for it is set up separately.",
      href: colleagues > 0 || invitationsWaiting > 0 ? "/members" : "/members/invite",
      cta: colleagues > 0 || invitationsWaiting > 0 ? "See members" : "Invite a member",
    },
  ];
  const [tpnNote, setTpnNote] = useState(false);
  return (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-4">
        <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Start here</h2>
        <ol className="m-0 grid list-none gap-3 p-0 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {steps.map((step, i) => (
            <li key={step.title} className="flex flex-col gap-2 rounded-[12px] border border-grid px-4 py-3.5">
              <span className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full border border-grid font-mono text-[11px] text-muted">
                  {i + 1}
                </span>
                <span className="font-display text-[13.5px] font-medium text-body">{step.title}</span>
              </span>
              <span className="text-[12.5px] leading-[1.55] text-faint">{step.body}</span>
              {step.href ? (
                <Link href={step.href} className="ndi-plainlink mt-auto inline-flex items-center gap-1.5 text-[12.5px] font-medium text-accent">
                  {step.cta}
                  <Icon name="arrowRight" size={13} strokeWidth={2} />
                </Link>
              ) : (
                <span className="mt-auto flex flex-col gap-1">
                  <button type="button" onClick={() => setTpnNote(true)} className="ndi-plainlink inline-flex items-center gap-1.5 self-start text-[12.5px] font-medium text-accent">
                    {step.cta}
                    <Icon name="arrowRight" size={13} strokeWidth={2} />
                  </button>
                  {tpnNote ? (
                    <span role="status" className="text-[12px] leading-[1.5] text-faint">
                      Prototype — requesting a credential isn&rsquo;t built here yet.
                    </span>
                  ) : null}
                </span>
              )}
            </li>
          ))}
        </ol>
      </div>
    </Panel>
  );
}
