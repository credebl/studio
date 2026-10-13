"use client";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { CredentialCard } from "@/components/ui/CredentialCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { inOrg } from "@/lib/demoData";
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
 */
export function HeldCredentialsView() {
  const { heldCredentials, activeOrgId, organizations } = useDemo();
  const orgName = organizations.find((o) => o.id === activeOrgId)?.name.replace(/ Pvt\. Ltd\.$/, "") ?? "The organisation";

  const variant = useScreenState("B3", ["populated", "empty"]);
  const all = variant === "empty" ? [] : heldCredentials.filter(inOrg(activeOrgId));

  const foundational = all.find((c) => c.isFoundational);
  const rest = all.filter((c) => !c.isFoundational);

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Wallet" }, { label: "Held credentials" }]} title="What we hold" />

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
              {rest.map((credential) => (
                <li key={credential.id} className="flex flex-col gap-2">
                  <CredentialCard type={credential.type} issuer={credential.issuer} status={credential.status} />
                  <p className="m-0 text-[12.5px] leading-[1.5] text-faint">
                    Received {formatDate(credential.receivedAt)}
                    {credential.expiresAt ? ` · expires ${formatDate(credential.expiresAt)}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        ) : (
          <Panel padded={false}>
            <EmptyState
              icon="credentials"
              title={variant === "empty" ? "The wallet is empty" : "Nothing else held yet"}
              message="Credentials offered to the entity appear under Offers. Accepting one puts it here."
            />
          </Panel>
        )}
      </div>
    </AppShell>
  );
}
