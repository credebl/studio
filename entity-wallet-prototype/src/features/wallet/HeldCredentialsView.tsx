"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs } from "@/components/ui/Tabs";
import { Icon } from "@/components/ui/icons";
import { requestWords } from "@/features/receive/shared";
import { inOrg, type HeldCredential } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { formatDate } from "@/features/controllership/scopeModel";

/**
 * B3 — what the entity holds, drawn as the cards a wallet shows.
 *
 * The one thing it does beyond listing: the foundational credential is
 * visually separated rather than sorted to the top of the same table. It is
 * not one credential among several — it is the root every other credential
 * and every delegated authority chains back to, and burying it in a row
 * between a tax certificate and an insurance policy misstates what it is.
 *
 * SCR-CRD-05 (Flow 6) — WHAT'S HELD, AND WHAT HAPPENED
 *
 * Getting another credential is the page's primary action now that there
 * is somewhere to get one. Two markers say what a list of cards can't: a
 * credential replaced by a newer one is *Superseded* (kept — it's the
 * record — but no longer shared), and one whose issuer has left NDI's list
 * *Can't be shared right now* (FLOW-CRD-01 E15), which says what still
 * holds rather than implying it's gone.
 *
 * The Activity tab is the only place an offer the wallet refused on its own
 * appears (FLOW-CRD-02 E1, UXD-36). Nobody is notified of those — a
 * notification for every unlisted sender is how a wallet teaches people to
 * click through warnings — but they're kept, with the reason, so the
 * question "did anyone send us something?" has an answer.
 *
 * Empty is unreachable after verification (the foundational credential is
 * always held); the switcher keeps it because the screen predates that rule.
 */
type Face = "live" | "loading" | "error" | "offline" | "empty";

export function HeldCredentialsView() {
  const router = useRouter();
  const { heldCredentials, activeOrgId, organizations, credentialRequests, refusedOffers, offerings, personById, mayOperate } = useDemo();
  const orgName = organizations.find((o) => o.id === activeOrgId)?.name.replace(/ Pvt\. Ltd\.$/, "") ?? "The organisation";
  const [tab, setTab] = useState<"credentials" | "activity">("credentials");

  const face = useScreenState("SCR-CRD-05", ["live", "loading", "error", "offline", "empty"]) as Face;
  const variant = face === "empty" ? "empty" : "populated";
  const all = variant === "empty" ? [] : heldCredentials.filter(inOrg(activeOrgId));
  /* Newest first; a credential is superseded when a newer one of the same
     type is held. */
  const superseded = (c: HeldCredential) => all.some((x) => x.id !== c.id && x.type === c.type && x.receivedAt > c.receivedAt);

  const foundational = all.find((c) => c.isFoundational);
  const rest = all.filter((c) => !c.isFoundational);

  const header = (
    <PageHeader
      crumbs={[{ label: "Wallet" }, { label: "Held credentials" }]}
      title="What we hold"
      actions={
        mayOperate(activeOrgId, "credential:list") || face !== "live" ? (
          <GradientButton onClick={() => router.push("/wallet/get")} disabled={face === "offline"}>
            <Icon name="credentials" size={16} strokeWidth={2} />
            Get another credential
          </GradientButton>
        ) : null
      }
    />
  );

  if (face === "loading") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div aria-hidden="true" className="h-72 animate-pulse rounded-[16px] border border-grid" />
        </div>
      </AppShell>
    );
  }
  if (face === "error") {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          {header}
          <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            We couldn&rsquo;t load your credentials. Nothing has changed.
            <HairlineButton onClick={() => router.refresh()}>Retry</HairlineButton>
          </div>
        </div>
      </AppShell>
    );
  }

  const activity = [
    ...credentialRequests.filter(inOrg(activeOrgId)).map((r) => ({
      id: r.id,
      at: r.answeredAt ?? r.requestedAt,
      text: `${r.credential} from ${r.issuerName} — asked by ${personById(r.requestedBy).name}`,
      words: requestWords(r, offerings.find((o) => o.id === r.offeringId)?.answerWindowDays ?? 5),
    })),
    ...refusedOffers.filter(inOrg(activeOrgId)).map((o) => ({
      id: o.id,
      at: o.at,
      text: o.listed
        ? `Offer from ${o.claimedIssuer} refused — ${o.reason}.`
        : `Offer claiming to be from ${o.claimedIssuer} refused — ${o.reason}.`,
      words: { status: "refused", label: "Refused automatically", sentence: `${o.credential}. Nobody was notified.` },
    })),
  ].sort((a, b) => (a.at < b.at ? 1 : -1));

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        {header}
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. This is what was held when it was last loaded.
          </p>
        ) : null}
        <div>
          <Tabs
            label="Credentials and activity"
            active={tab}
            onChange={(id) => setTab(id as "credentials" | "activity")}
            tabs={[
              { id: "credentials", label: "Credentials", icon: "credentials" },
              { id: "activity", label: "Activity", icon: "fileText" },
            ]}
          />
        </div>

        {tab === "activity" ? (
          <Panel padded={false}>
            {activity.length ? (
              <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
                {activity.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-start justify-between gap-3 border-b border-subtle px-5 py-3.5 last:border-b-0">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="text-[13.5px] text-body">{a.text}</span>
                      <span className="text-[12.5px] text-muted">{a.words.sentence}</span>
                      <span className="text-[12px] text-faint">{formatDate(a.at)}</span>
                    </span>
                    <StatusPill status={a.words.status} label={a.words.label} />
                  </li>
                ))}
              </ul>
            ) : (
              <EmptyState icon="fileText" title="No activity yet" message="Requests, offers and anything refused automatically show here." />
            )}
          </Panel>
        ) : (
          <>

        <p className="max-w-[68ch] text-[13.5px] leading-[1.65] text-muted">
          Credentials issued to {orgName} itself, held in the
          entity&rsquo;s wallet. Nobody carries these on a device — they are
          presented from here, by a controller acting for the entity.
        </p>

        {foundational ? (
          <Panel>
            {/* Side by side only when the panel itself is wide enough — the
                guide's rail can take a third of a laptop screen, and a
                viewport breakpoint squeezed the details into a column one
                word wide. */}
            <div className="@container relative z-[4]">
            <div className="grid gap-5 @min-[820px]:grid-cols-[minmax(0,420px)_minmax(0,1fr)] @min-[820px]:items-start">
              <CredentialCard
                type={foundational.type}
                issuer={foundational.issuer}
                status={foundational.status}
                foundational
                size="lg"
              />
              <div className="flex min-w-0 flex-col gap-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex flex-col gap-0.5">
                    <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-muted">Root of trust</p>
                    <p className="text-[12.5px] leading-[1.5] text-faint">
                      Issued by {foundational.issuer} · received {formatDate(foundational.receivedAt)}
                    </p>
                  </div>
                  <StatusPill status={foundational.status} />
                </div>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Everything else the entity holds, and every authority it has delegated, traces back
                  to this. If it lapses, nothing below it verifies anywhere.
                </p>
                <dl className="m-0 grid gap-x-6 gap-y-2 min-[641px]:grid-cols-2">
                  {foundational.attributes.map((attribute) => (
                    <div key={attribute.name} className="flex flex-col gap-0.5">
                      <dt className="text-[12px] text-faint">{attribute.name.replace(/_/g, " ")}</dt>
                      <dd className="m-0 text-[13px] text-body">{attribute.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
            </div>
          </Panel>
        ) : null}

        {rest.length ? (
          <section aria-labelledby="held-rest" className="flex flex-col gap-3">
            <h2 id="held-rest" className="m-0 font-display text-[15px] font-semibold text-strong">
              Everything else it holds
            </h2>
            <ul className="m-0 grid list-none gap-5 p-0 grid-cols-[repeat(auto-fill,minmax(260px,1fr))]">
              {[...rest].sort((a, b) => (a.receivedAt < b.receivedAt ? 1 : -1)).map((credential) => (
                <li key={credential.id} className="flex flex-col gap-2">
                  <CredentialCard type={credential.type} issuer={credential.issuer} status={credential.status} />
                  <p className="m-0 text-[12.5px] leading-[1.5] text-faint">
                    Issued {formatDate(credential.receivedAt)}
                    {credential.expiresAt ? ` · valid until ${formatDate(credential.expiresAt)}` : ""}
                  </p>
                  {superseded(credential) ? <StatusPill status="superseded" label="Superseded" /> : null}
                  {!credential.issuerTrusted ? (
                    <p className="m-0 flex flex-col gap-1">
                      <StatusPill status="suspended" label="Can't be shared right now" />
                      <span className="text-[12.5px] leading-[1.5] text-muted">
                        {credential.issuer} is no longer on NDI&rsquo;s list of trusted organisations. You can&rsquo;t share this
                        credential for now. It&rsquo;s still yours — contact NDI.
                      </span>
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <Panel padded={false}>
            <EmptyState
              icon="credentials"
              title={variant === "empty" ? "The wallet is empty" : "Nothing else held yet"}
              message="Ask an office for one, or accept one you're sent, and it shows here."
            />
          </Panel>
        )}
          </>
        )}
      </div>
    </AppShell>
  );
}
