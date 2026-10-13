"use client";

import Link from "next/link";

import { Countdown } from "@/components/ui/Countdown";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon, type IconName } from "@/components/ui/icons";
import { inOrg, shortOrgName } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { describeRelation } from "@/features/controllership/scopeModel";

/**
 * B1 — "what needs me", and a reminder of what the person is allowed to do.
 *
 * ORDERED BY WHO IS WAITING, NOT BY WHAT IS URGENT TO US
 *
 * Approvals first, because somebody else is blocked until they are decided —
 * a parked operation is a colleague standing still. Then inbound requests
 * from relying parties, who are also waiting. Then offers, which nobody is
 * waiting on. Sorting by expiry instead would put a lapsing offer above a
 * colleague, which is the wrong answer to "what should I do next".
 *
 * WHY THE AUTHORITY SUMMARY IS ON THE LANDING SCREEN
 *
 * The brief asks for a compact "what am I allowed to do" on the dashboard,
 * and it is worth more than it looks: a Controller who is reminded of their
 * scope every time they sign in never has to discover it from a refusal.
 * Denials are the expensive way to learn where a boundary is.
 */
interface Task {
  key: string;
  icon: IconName;
  label: string;
  detail: string;
  href: string;
  expiresAt?: string;
  emphasis?: boolean;
}

export function NeedsAttention({ allClear = false }: { allClear?: boolean } = {}) {
  const {
    harness,
    relations,
    offers,
    verificationRequests,
    parkedOperations,
    currentPerson,
    personById,
    activeOrgId,
    organizations,
  } = useDemo();

  const persona = harness.persona;
  /* Only this organisation's wallet: Bank of Bhutan's dashboard never
     shows what is waiting in Pelden's. */
  const here = inOrg(activeOrgId);
  const orgName = organizations.find((o) => o.id === activeOrgId)?.name ?? "the organisation";

  const relation = relations.filter(here).find((r) => r.personId === persona && r.state === "ACTIVE");

  const canDecide = Boolean(
    relation?.scope.grants.some((g) => g.operation === "approval:decide"),
  );

  const tasks: Task[] = [];

  /* Somebody else is blocked. First, always. */
  if (canDecide && !allClear) {
    for (const operation of parkedOperations.filter(here).filter((p) => p.state === "parked")) {
      tasks.push({
        key: operation.id,
        icon: "userCheck",
        label: operation.summary,
        detail: `${personById(operation.requestedBy).name} is waiting on a decision`,
        href: `/approvals/${operation.id}`,
        expiresAt: operation.expiresAt,
        emphasis: true,
      });
    }
  }

  /* A relying party is waiting. */
  for (const request of allClear
    ? []
    : verificationRequests.filter(here).filter((v) => v.state === "ready")) {
    tasks.push({
      key: request.id,
      icon: "verify",
      label: `${request.relyingParty} is asking for a proof`,
      detail:
        request.decision === "out_of_scope"
          ? "Not something your authority covers"
          : `${request.credentialType} · ${request.requiredAttributes.length} attributes needed`,
      href: `/wallet/verification-requests/${request.id}`,
      expiresAt: request.expiresAt,
    });
  }

  /* Nobody is waiting on these. */
  for (const offer of allClear ? [] : offers.filter(here).filter((o) => o.state === "pending")) {
    tasks.push({
      key: offer.id,
      icon: "download",
      label: `${offer.issuer} has offered ${offer.type}`,
      detail:
        offer.decision === "out_of_scope"
          ? "Not something your authority covers"
          : offer.decision === "requires_approval"
            ? "Accepting it needs an approver"
            : "Within your authority",
      href: `/wallet/offers/${offer.id}`,
      expiresAt: offer.expiresAt,
    });
  }

  const sentences = relation
    ? describeRelation(currentPerson.name, relation.scope, relation.isRootAuthority)
    : [];

  return (
    <div className="grid gap-5 min-[1201px]:grid-cols-[minmax(0,1fr)_360px]">
      {/* ---- What needs me ---- */}
      <Panel>
        <div className="relative z-[4] flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-[15px] font-semibold text-strong">
            Needs you
          </h2>
          {tasks.length > 0 ? (
            <StatusPill status="pending" label={`${tasks.length} open`} />
          ) : null}
        </div>

        {tasks.length === 0 ? (
          <div className="relative z-[4] mt-4 flex items-start gap-3">
            <Icon name="check" size={17} strokeWidth={2.2} className="mt-0.5 flex-none text-accent" />
            <div className="flex flex-col gap-1">
              <p className="font-display text-[13.5px] font-medium text-body">All clear</p>
              <p className="max-w-[52ch] text-[13px] leading-[1.6] text-muted">
                Nothing is waiting on you. Offers and requests from relying
                parties will land here when they arrive.
              </p>
            </div>
          </div>
        ) : (
          <ul className="relative z-[4] mt-3 flex flex-col">
            {tasks.map((task, i) => (
              <li key={task.key} className={i > 0 ? "border-t border-subtle" : ""}>
                <Link
                  href={task.href}
                  className="ndi-navrow flex items-start gap-3 rounded-[10px] px-2 py-3"
                  data-active="0"
                >
                  <span
                    aria-hidden="true"
                    className="mt-0.5 flex h-7 w-7 flex-none items-center justify-center rounded-[8px] border border-grid"
                    style={{
                      background: task.emphasis ? "var(--ndi-mint-12)" : "rgb(var(--tint) / 0.04)",
                    }}
                  >
                    <Icon
                      name={task.icon}
                      size={14}
                      strokeWidth={1.9}
                      className={task.emphasis ? "text-accent" : undefined}
                    />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
                      {task.label}
                    </span>
                    <span className="text-[12.5px] leading-[1.5] text-faint">
                      {task.detail}
                    </span>
                  </span>
                  {task.expiresAt ? (
                    <span className="flex-none pt-0.5">
                      <Countdown expiresAt={task.expiresAt} />
                    </span>
                  ) : null}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </Panel>

      {/* ---- What I may do ---- */}
      <Panel>
        <div className="relative z-[4] flex flex-col gap-1">
          <h2 className="font-display text-[15px] font-semibold text-strong">
            What you may do
          </h2>
          {/* Said only to someone who does act for it — to a member with no
              authority, "acting for, never as" describes something they
              cannot do. */}
          {relation ? (
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Acting for {shortOrgName(orgName)}. Never as it.
            </p>
          ) : null}
        </div>

        {relation ? (
          <>
            <ul className="relative z-[4] mt-3 flex flex-col gap-2">
              {sentences.map((sentence, i) => (
                <li key={i} className="flex items-start gap-2">
                  <Icon
                    name="check"
                    size={12}
                    strokeWidth={2.6}
                    className="mt-[5px] flex-none text-accent"
                  />
                  <span className="text-[12.5px] leading-[1.55] text-muted">
                    {sentence.text}
                  </span>
                </li>
              ))}
            </ul>
            <div className="relative z-[4] mt-4">
              <Link
                href="/wallet/authority"
                className="ndi-plainlink text-[12.5px] font-medium text-accent"
              >
                See it in full →
              </Link>
            </div>
          </>
        ) : (
          /* Someone with no authority is most often a member who has just
             joined. The same two sentences the invitation used — what it
             lets them do, and what it does not — so the console agrees with
             what they accepted (UXD-04). */
          <ul className="relative z-[4] m-0 mt-3 flex list-none flex-col gap-2 p-0">
            <li className="flex items-start gap-2">
              <Icon name="check" size={12} strokeWidth={2.6} className="mt-[5px] flex-none text-accent" />
              <span className="text-[12.5px] leading-[1.55] text-muted">
                See {shortOrgName(orgName)}&rsquo;s information.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <Icon name="close" size={12} strokeWidth={2.6} className="mt-[5px] flex-none" style={{ color: "var(--text-faint)" }} />
              <span className="text-[12.5px] leading-[1.55] text-muted">
                Nothing on its behalf yet. If that&rsquo;s needed, the owner sets it up and you&rsquo;ll be
                asked to accept it.
              </span>
            </li>
          </ul>
        )}
      </Panel>
    </div>
  );
}
