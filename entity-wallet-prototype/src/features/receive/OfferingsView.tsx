"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Checkbox } from "@/components/ui/Checkbox";
import { Dialog } from "@/components/ui/Dialog";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Switch } from "@/components/ui/Switch";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import type { CredentialOffering } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { useIssuer } from "./issuerShared";
import { KIND_WORDS } from "./shared";

/**
 * SCR-CRD-07 — What you offer on request. Before FLOW-CRD-03: the issuer
 * publishes, pauses and changes what businesses can ask it for.
 *
 * ASK FOR LESS
 *
 * The items an issuer says it uses are what the business sees on
 * SCR-CRD-02, item by item. Choosing them is where an issuer decides how
 * much it asks of every business that comes to it, so the composer says so
 * in the issuer's own interest: they'll see exactly what you ask for (UN-42).
 * And because the business shares the whole prerequisite whatever is chosen
 * (EW-FLOW6-SD/D20), the screen says that too — an issuer shouldn't believe
 * it is receiving less than it is.
 *
 * A CHANGE IS A VERSION
 *
 * Requests already made keep the version they agreed to. Without that, an
 * issuer widening what it uses would retroactively change what businesses
 * consented to.
 *
 * Creating a brand-new offering isn't built: the prerequisite chooser it
 * needs reads the issuer's verifier scope, which the prototype doesn't
 * model. That's on the what's-real page.
 */
type Face = "live" | "default" | "empty" | "e2" | "offline" | "no_permission";

export function OfferingsView() {
  const router = useRouter();
  const { setOfferingStatus, publishOfferingVersion, hydrated } = useDemo();
  const issuer = useIssuer();
  const forced = useScreenState("SCR-CRD-07", ["live", "default", "empty", "e2", "offline", "no_permission"]) as Face;
  const [editing, setEditing] = useState<CredentialOffering | null>(null);
  const [retiring, setRetiring] = useState<CredentialOffering | null>(null);
  const [published, setPublished] = useState<string | null>(null);

  const natural: Face = !issuer.offerings.length ? "empty" : !issuer.isOwner ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const readOnly = face === "no_permission" || face === "offline";

  const header = <PageHeader crumbs={[{ label: issuer.name }, { label: "What you offer" }]} title="What you offer on request" />;

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
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
              icon="certificate"
              title="You don't offer anything on request yet."
              message="Businesses can't ask you for credentials until you do."
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
          Ask businesses only for what you need to decide. They&rsquo;ll see exactly what you ask for. Businesses share
          the whole credential you ask to see, not only the items you use.
        </p>
        {face === "offline" ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline. Nothing can be changed until you&rsquo;re back.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            You can see what {issuer.name} offers. Only its owner can change it.
          </p>
        ) : null}
        {published ? (
          <p role="status" className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="check" size={14} strokeWidth={2.4} className="mt-[2px] flex-none" style={{ color: "var(--ndi-success)" }} />
            {published}
          </p>
        ) : null}

        <ul className="m-0 flex list-none flex-col gap-4 p-0">
          {issuer.offerings.map((o, i) => {
            const uncovered = !o.covered || (face === "e2" && i === 0);
            return (
              <li key={o.id}>
                <Panel>
                  <div className="relative z-[4] flex flex-col gap-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex flex-col gap-1">
                        <h2 className="m-0 font-display text-[17px] font-semibold text-strong">{o.credential}</h2>
                        <p className="m-0 text-[12.5px] text-faint">Version {o.version}</p>
                      </div>
                      {uncovered ? (
                        <StatusPill status="stopped" label="Not available to businesses" />
                      ) : (
                        <StatusPill status={o.status} label={o.status === "ACTIVE" ? "Offered" : o.status === "PAUSED" ? "Paused" : "Retired"} />
                      )}
                    </div>
                    {uncovered ? (
                      <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
                        {o.credential} can&rsquo;t be issued: your approval to issue doesn&rsquo;t cover it. Contact NDI.
                      </p>
                    ) : null}
                    <dl className="m-0 grid gap-x-6 gap-y-3 min-[641px]:grid-cols-2">
                      <Fact term="Who can ask" value={o.eligibleKinds.map((k) => KIND_WORDS[k]).join(", ")} />
                      <Fact
                        term="What they show first"
                        value={`Their ${o.prerequisite.credential} (${o.prerequisite.issuer}). You use: ${o.prerequisite.uses.join(", ")}.`}
                      />
                      <Fact term="How it's answered" value={o.answering === "queue" ? "By your officers, from the queue" : "By your system, with the queue as fallback"} />
                      <Fact term="Answer window" value={`${o.answerWindowDays} days`} />
                      <Fact term="Renewable" value={o.renewable ? "Yes — a business that holds it can ask again" : "No"} />
                    </dl>
                    <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
                      <HairlineButton onClick={() => setEditing(o)} disabled={readOnly || o.status === "RETIRED"}>
                        New version
                      </HairlineButton>
                      {o.status === "ACTIVE" ? (
                        <HairlineButton onClick={() => setOfferingStatus(o.id, "PAUSED")} disabled={readOnly}>
                          Pause
                        </HairlineButton>
                      ) : o.status === "PAUSED" ? (
                        <HairlineButton onClick={() => setOfferingStatus(o.id, "ACTIVE")} disabled={readOnly}>
                          Resume
                        </HairlineButton>
                      ) : null}
                      {o.status !== "RETIRED" ? (
                        <HairlineButton onClick={() => setRetiring(o)} disabled={readOnly}>
                          Retire
                        </HairlineButton>
                      ) : null}
                    </div>
                    {editing?.id === o.id ? (
                      <Composer
                        offering={o}
                        onCancel={() => setEditing(null)}
                        onPublish={(changes) => {
                          publishOfferingVersion(o.id, changes);
                          setEditing(null);
                          setPublished(`Published version ${o.version + 1} of ${o.credential}. Requests already made keep the version they agreed to.`);
                        }}
                      />
                    ) : null}
                  </div>
                </Panel>
              </li>
            );
          })}
        </ul>

        <div>
          <HairlineButton onClick={() => router.push("/issuer/requests")}>Requests to answer</HairlineButton>
        </div>

        <Dialog
          open={Boolean(retiring)}
          onClose={() => setRetiring(null)}
          tone="danger"
          title={retiring ? `Retire ${retiring.credential}?` : "Retire?"}
          lead="Businesses can no longer ask you for it. Requests already made are still answered, and credentials you've issued stay valid."
          consequences={["New requests for it stop", "It can't be offered again under this version"]}
          confirmLabel="Retire"
          onConfirm={() => {
            if (retiring) setOfferingStatus(retiring.id, "RETIRED");
            setRetiring(null);
          }}
        />
      </div>
    </AppShell>
  );
}

function Composer({
  offering,
  onCancel,
  onPublish,
}: {
  offering: CredentialOffering;
  onCancel: () => void;
  onPublish: (changes: { uses: string[]; answerWindowDays: number; renewable: boolean }) => void;
}) {
  const [uses, setUses] = useState<string[]>(offering.prerequisite.uses);
  const [days, setDays] = useState(String(offering.answerWindowDays));
  const [renewable, setRenewable] = useState(offering.renewable);
  const n = Number(days);
  const valid = uses.length > 0 && Number.isInteger(n) && n >= 1 && n <= 30;

  return (
    <div className="flex flex-col gap-4 rounded-[12px] border border-grid px-4 py-4">
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className={`${LABEL_CLASS} mb-2`}>What you use from their {offering.prerequisite.credential}</legend>
        {offering.prerequisite.attributes.map((a) => (
          <Checkbox
            key={a}
            label={a}
            checked={uses.includes(a)}
            onChange={(on: boolean) => setUses((u) => (on ? [...u, a] : u.filter((x) => x !== a)))}
          />
        ))}
        {!uses.length ? <p className="m-0 text-[12.5px] text-muted">Choose at least one item.</p> : null}
      </fieldset>
      <label className={`${FIELD_BLOCK_CLASS} max-w-[220px]`}>
        <span className={LABEL_CLASS}>Answer window, in days</span>
        <input className={FIELD_CLASS} inputMode="numeric" value={days} onChange={(e) => setDays(e.target.value)} />
      </label>
      <Switch id={`renew-${offering.id}`} checked={renewable} onChange={setRenewable} label="Renewable" description="A business that holds it can ask again." />
      <p className="m-0 text-[13px] text-muted">
        Publishing a change creates version {offering.version + 1}. Requests already made keep the version they agreed to.
      </p>
      <div className="flex flex-wrap gap-2.5">
        <GradientButton disabled={!valid} onClick={() => onPublish({ uses, answerWindowDays: n, renewable })}>
          Publish version {offering.version + 1}
        </GradientButton>
        <HairlineButton onClick={onCancel}>Cancel</HairlineButton>
      </div>
    </div>
  );
}

function Fact({ term, value }: { term: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <dt className={LABEL_CLASS}>{term}</dt>
      <dd className="m-0 text-[13.5px] leading-[1.55] text-body">{value}</dd>
    </div>
  );
}
