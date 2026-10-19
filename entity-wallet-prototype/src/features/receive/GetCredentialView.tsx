"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { inOrg, requestInFlight } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { cannotAsk, useHolder } from "./shared";

/**
 * SCR-CRD-01 — Get a credential. FLOW-CRD-01 step 1: what this business
 * can get next, and from whom.
 *
 * WHAT IT NEEDS, BEFORE ANYONE ASKS
 *
 * Every offering says what the issuer needs to see first. That is the one
 * fact that decides whether asking will go anywhere, and the business should
 * have it before it consents rather than learn it from a refusal (E4). An
 * offering whose prerequisite isn't held stays in the list — knowing a
 * bonded-warehouse authorisation exists, and that the TPN comes first, is
 * the useful answer — but its action becomes the way to get what's missing.
 *
 * REQUESTABLE FIRST
 *
 * Sorted by what can be asked for now, then what needs something first,
 * then what's already held or in flight. A list in issuer order puts the
 * thing someone came for below two they can't use.
 *
 * Badges are read from fixtures — held, in flight — and the decision about
 * whether a request is allowed is the store's on submit (P1–P5). The
 * screen only declines to offer an action it already knows will be refused.
 */
type Face = "live" | "default" | "empty" | "loading" | "error" | "offline" | "no_permission";

export function GetCredentialView() {
  const router = useRouter();
  const { offerings, credentialRequests, hydrated } = useDemo();
  const holder = useHolder();
  const forced = useScreenState("SCR-CRD-01", ["live", "default", "empty", "loading", "error", "offline", "no_permission"]) as Face;

  const listed = offerings.filter((o) => o.status === "ACTIVE" && o.covered && o.eligibleKinds.includes(holder.kind));
  const natural: Face = !listed.length ? "empty" : !holder.can("credential:receive") ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const mayAsk = face === "default";

  const rows = listed
    .map((o) => {
      const held = holder.held.some((c) => c.type === o.credential);
      const request = credentialRequests.find((r) => inOrg(holder.orgId)(r) && r.offeringId === o.id && requestInFlight(r));
      const needs = !holder.held.some((c) => c.type === o.prerequisite.credential);
      const rank = request || (held && !o.renewable) ? 2 : needs ? 1 : 0;
      return { o, held, request, needs, rank };
    })
    .sort((a, b) => a.rank - b.rank);

  const header = <PageHeader crumbs={[{ label: "Wallet" }, { label: "Get a credential" }]} title="What your business can get" />;

  if (!hydrated || face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          {[0, 1].map((i) => (
            <div key={i} aria-hidden="true" className="h-40 animate-pulse rounded-[16px] border border-grid" />
          ))}
        </div>
      </AppShell>
    );
  }

  if (face === "empty") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <Panel padded={false}>
            <EmptyState
              icon="credentials"
              title="Nothing else is available for your type of business yet."
              message="We'll show new credentials here as offices add them."
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Credentials offices on NDI issue to businesses like {holder.name}. You ask; the office checks what you
          share and decides. Nothing is added to your credentials until someone here accepts it.
        </p>

        {face === "error" ? (
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load this. Nothing has changed.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        ) : null}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is the list as it was last loaded, and may not be current.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {cannotAsk(holder.rootName)}
          </p>
        ) : null}

        {face === "error" ? null : (
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {rows.map(({ o, held, request, needs }) => {
              const prereqOffering = offerings.find((x) => x.credential === o.prerequisite.credential && x.status === "ACTIVE");
              return (
                <li key={o.id}>
                  <Panel>
                    <div className="relative z-[4] flex flex-col gap-3">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="flex flex-col gap-1">
                          <h2 className="m-0 font-display text-[17px] font-semibold text-strong">{o.credential}</h2>
                          <p className="m-0 text-[12.5px] text-faint">From {o.issuerName}</p>
                        </div>
                        {request ? (
                          <StatusPill status="requested" label="Requested" />
                        ) : held ? (
                          <StatusPill status="active" label="Held" />
                        ) : needs ? (
                          <StatusPill status="not_set_up" label={`Needs ${o.prerequisite.credential} first`} />
                        ) : null}
                      </div>
                      <p className="m-0 max-w-[66ch] text-[13.5px] leading-[1.6] text-body">{o.summary}</p>
                      <dl className="m-0 grid gap-x-6 gap-y-2 min-[641px]:grid-cols-2">
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[12px] text-faint">What it needs</dt>
                          <dd className="m-0 text-[13px] text-body">
                            {o.issuerName} needs to see your {o.prerequisite.credential} first.
                          </dd>
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <dt className="text-[12px] text-faint">Answer time</dt>
                          <dd className="m-0 text-[13px] text-body">Usually answered within {o.answerWindowDays} days</dd>
                        </div>
                      </dl>
                      <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-3">
                        {request ? (
                          <>
                            <p className="m-0 text-[13px] text-body">You&rsquo;ve already asked for this. Here&rsquo;s where it stands.</p>
                            <HairlineButton onClick={() => router.push(`/wallet/requests/${request.id}`)}>Go to status</HairlineButton>
                          </>
                        ) : held && !o.renewable ? (
                          <>
                            <p className="m-0 text-[13px] text-body">Your organisation already has this.</p>
                            <Link href="/wallet/credentials" className="ndi-plainlink text-[13px] font-medium text-muted">
                              Your credentials
                            </Link>
                          </>
                        ) : needs ? (
                          <>
                            <p className="m-0 text-[13px] text-body">To ask for this you first need: {o.prerequisite.credential}.</p>
                            {prereqOffering && !requestFor(prereqOffering.id) ? (
                              <HairlineButton onClick={() => router.push(`/wallet/get/${prereqOffering.id}`)} disabled={!mayAsk}>
                                Get {o.prerequisite.credential}
                              </HairlineButton>
                            ) : null}
                          </>
                        ) : mayAsk ? (
                          <GradientButton onClick={() => router.push(`/wallet/get/${o.id}`)}>
                            Ask for this
                            <Icon name="arrowRight" size={16} strokeWidth={2} />
                          </GradientButton>
                        ) : (
                          <p className="m-0 text-[13px] text-muted">
                            {face === "offline" ? "Asking needs a connection." : cannotAsk(holder.rootName)}
                          </p>
                        )}
                      </div>
                    </div>
                  </Panel>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </AppShell>
  );

  function requestFor(offeringId: string) {
    return credentialRequests.some((r) => inOrg(holder.orgId)(r) && r.offeringId === offeringId && requestInFlight(r));
  }
}

