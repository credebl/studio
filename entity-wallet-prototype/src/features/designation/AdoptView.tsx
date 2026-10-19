"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { draftFor, isPlatformAdmin, roleIn, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { ROUND_TRIP_MS } from "@/lib/demoTiming";

import { kindPlural, kindSingular, kindTitle } from "./shared";

/**
 * SCR-ADO-02 — Adopt for an entity type. FLOW-ORG-03 step 4: the
 * credential, what people are asked, and NDI's permission to ask it in the
 * authority's name — as one act (EW-FLOW5-SD/D16).
 *
 * ONE ACT, BECAUSE HALF IS WORSE THAN NONE
 *
 * An entity type with the credential adopted and no request would resolve
 * and then fail, looking like an outage (FLOW-ORG-03 §5). So the three
 * parts are shown together, adopted together, and if it fails nothing was
 * adopted. The screen says they can be stopped separately afterwards,
 * which sets up SCR-ADO-04 before anyone needs it.
 *
 * NO NDI ROLE REACHES THIS SCREEN
 *
 * The authority adopts; NDI only drafts (EW-FLOW5-SD/D7). An NDI
 * administrator arriving by address is told so rather than shown a form
 * the store would refuse.
 *
 * THE CONSEQUENCE, NOT "ARE YOU SURE?"
 *
 * From the moment of adoption businesses can verify, and people are asked
 * exactly what was read (SC 3.3.4). And changing it later is a new version:
 * people already verified stay verified under the version in force at the
 * time — pre-empting UC-13's misreading before it can form.
 */
type Face = "live" | "default" | "loading" | "e1" | "e2" | "e3" | "e4" | "e7" | "success" | "offline" | "ndi_admin";

export function AdoptView({ kind }: { kind: OrgKind }) {
  const router = useRouter();
  const params = useSearchParams();
  const changing = params.get("change") === "1";
  const { designations, artefactObjections, organizations, currentPerson, activeOrgId, adoptArtefacts, hydrated } = useDemo();
  const forced = useScreenState("SCR-ADO-02", ["live", "default", "loading", "e1", "e2", "e3", "e4", "e7", "success", "offline", "ndi_admin"]) as Face;

  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ version: number } | null>(null);
  const [error, setError] = useState<"E1" | "E5" | "E7" | "offline" | null>(null);

  const org =
    organizations.find((o) => o.id === activeOrgId && designations.some((d) => d.orgId === o.id)) ??
    organizations.find((o) => o.memberIds.includes(currentPerson.id) && designations.some((d) => d.orgId === o.id));
  const d = designations.find((x) => x.orgId === org?.id && x.state === "ACTIVE");
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;
  const draft = draftFor(kind);
  const objection = artefactObjections.find((o) => o.designationId === d?.id && o.entityType === kind);
  const asked = objection?.item ? draft.asked.filter((a) => a.item !== objection.item) : draft.asked;

  const natural: Face = isPlatformAdmin(currentPerson) ? "ndi_admin" : result ? "success" : busy ? "loading" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const name = org?.name ?? "Your organisation";

  const header = (
    <PageHeader
      crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "Authority", href: "/authority" }, { label: `Adopt for ${kindPlural(kind)}` }]}
      title={`Adopt for ${kindPlural(kind)}`}
    />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  if (face === "ndi_admin") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <p role="status" className="relative z-[4] m-0 text-[14px] leading-[1.6] text-body">
              NDI doesn&rsquo;t adopt anything in an authority&rsquo;s name. NDI may draft what people will be
              asked; only the authority&rsquo;s owner adopts it.
            </p>
          </Panel>
        </div>
      </AppShell>
    );
  }

  if (face === "success") {
    const v = result?.version ?? 1;
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-center gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} style={{ color: "var(--ndi-success)" }} />
                {v > 1
                  ? `Version ${v} is now what people will be asked. Version ${v - 1} stays on record.`
                  : `${kindTitle(kind)} are now live.`}
              </p>
              <p className="m-0 max-w-[64ch] text-[13.5px] leading-[1.6] text-muted">
                From now, a {kindSingular(kind)} can verify with {name}, and people are asked exactly what you
                read.
              </p>
              <div>
                <GradientButton onClick={() => router.push("/authority")}>Go to your authority console</GradientButton>
              </div>
            </div>
          </Panel>
        </div>
      </AppShell>
    );
  }

  const adopt = () => {
    if (!d) return;
    if (forced === "offline") {
      setConfirming(false);
      setError("offline");
      return;
    }
    setBusy(true);
    setConfirming(false);
    window.setTimeout(() => {
      const r = adoptArtefacts(d.id, kind, changing);
      setBusy(false);
      if (r.ok) setResult({ version: r.version });
      else if (r.error === "E1" || r.error === "E5" || r.error === "E7") setError(r.error);
    }, ROUND_TRIP_MS);
  };

  /* The error faces, in UX-EW-02 §3.5's words, each saying whose it is to fix. */
  const errorFace =
    face === "e1" || error === "E1"
      ? `Your designation doesn't cover ${kindPlural(kind)}. NDI has to extend it before you can adopt this.`
      : face === "e2"
        ? "That schema isn't published yet. It has to be published before it can be adopted."
        : face === "e3"
          ? "This schema belongs to another organisation. A foundational credential has to be published by the authority that issues it."
          : face === "e4"
            ? `This request asks for more than is needed to confirm a representative: ${draft.overBroad ?? "Date of birth"}. Go back and send it back with a note.`
            : face === "e7" || error === "E7"
              ? `Someone else has just adopted for ${kindPlural(kind)}. View what was adopted.`
              : error === "E5"
                ? "Your designation is suspended, so nothing can be adopted at the moment. Businesses already verified are not affected."
                : null;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}
        {face === "offline" || error === "offline" ? (
          <p role="alert" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            Nothing was adopted — it&rsquo;s all three or none. Try again when you&rsquo;re back.
          </p>
        ) : null}
        {errorFace ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ borderColor: "var(--ndi-warning)" }}>
            {errorFace}
          </p>
        ) : null}
        {!owner ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            Only your organisation&rsquo;s owner can adopt this.
          </p>
        ) : null}

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <p className="m-0 max-w-[66ch] text-[14px] leading-[1.6] text-body">
              {changing ? "A new version of what people are asked, for " : "Three things, adopted together, for "}
              {kindPlural(kind)}:
            </p>
            <ol className="m-0 flex list-none flex-col gap-3 p-0">
              <li className="flex flex-col gap-1 rounded-[12px] border border-grid px-4 py-3">
                <span className={LABEL_CLASS}>1 · What the credential contains</span>
                <span className="text-[13.5px] text-body">
                  {draft.credential}: {draft.contents.join(", ")}
                </span>
              </li>
              <li className="flex flex-col gap-1 rounded-[12px] border border-grid px-4 py-3">
                <span className={LABEL_CLASS}>2 · What people will be asked</span>
                <span className="text-[13.5px] text-body">{asked.map((a) => a.item).join(", ")}</span>
                <span className="text-[12.5px] text-muted">&ldquo;{draft.purpose}&rdquo;</span>
              </li>
              <li className="flex flex-col gap-1 rounded-[12px] border border-grid px-4 py-3">
                <span className={LABEL_CLASS}>3 · NDI&rsquo;s permission</span>
                <span className="text-[13.5px] text-body">
                  NDI&rsquo;s service account may send this request in {name}&rsquo;s name — this request and nothing else.
                </span>
              </li>
            </ol>
            <p className="m-0 text-[13.5px] leading-[1.6] text-body">
              These three things go together. You can stop any of them afterwards, separately.
            </p>
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              If you change what people are asked, that&rsquo;s a new version. People already verified stay
              verified, under the version that was in force at the time.
            </p>
            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton onClick={() => setConfirming(true)} disabled={!owner || busy || !d || ["e1", "e2", "e3", "e4", "e7"].includes(face)}>
                {busy ? "Adopting…" : "Adopt"}
              </GradientButton>
              <HairlineButton onClick={() => router.push(`/authority/${kind}${changing ? "?change=1" : ""}`)}>Back</HairlineButton>
            </div>
          </div>
        </Panel>

        <Dialog
          open={confirming}
          onClose={() => setConfirming(false)}
          title={changing ? `Adopt a new version for ${kindPlural(kind)}?` : `Adopt for ${kindPlural(kind)}?`}
          lead={`From the moment you adopt this, businesses can verify with you as ${kindPlural(kind)}, and people will be asked exactly what you've just read.`}
          consequences={
            changing
              ? ["The new version governs every request from now", "The previous version is kept as the record of what was asked before"]
              : ["It switches on now", "You can stop it, or NDI's access, at any time — separately"]
          }
          confirmLabel="Adopt"
          onConfirm={adopt}
        />
      </div>
    </AppShell>
  );
}
