"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { Dialog } from "@/components/ui/Dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Select } from "@/components/ui/Select";
import { Icon } from "@/components/ui/icons";
import { roleIn, type OrgKind } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";
import { LOCAL_MS } from "@/lib/demoTiming";

import { NOTHING_UNVERIFIED, kindPlural, kindTitle } from "./shared";

/**
 * SCR-ADO-04 — Stop something. FLOW-ORG-03 A1–A3: the highest-risk screen
 * in UX-EW-02, and the one UC-12 is written for.
 *
 * THREE STOPS, NONE PRE-SELECTED
 *
 * The failure this screen prevents is choosing the wrong stop — retiring an
 * entity type when the intent was to pause NDI. A default is a choice made
 * for someone who hasn't yet understood the difference, so the screen opens
 * with nothing selected (UXD-17), each option says what stops and what
 * carries on, and pausing NDI — the option most often wanted and most
 * easily missed — comes first. "Change what people are asked" isn't a stop
 * at all; it's here because officers look for it here.
 *
 * THE FEAR ARRIVES BEFORE THE CHOICE
 *
 * "None of these un-verifies a business" is visible before anything is
 * selected (UXD-20), and the confirmation restates both halves — what stops
 * and what continues (SC 3.3.4). Nothing is ever partially applied.
 */
type Option = "pause" | "stop_type" | "change";
type Face = "live" | "default" | "loading" | "error" | "success" | "offline" | "no_permission";

export function StopSomethingView() {
  const router = useRouter();
  const { designations, adoptions, organizations, currentPerson, personById, activeOrgId, setNdiAccess, stopEntityType, hydrated } = useDemo();
  const forced = useScreenState("SCR-ADO-04", ["live", "default", "loading", "error", "success", "offline", "no_permission"]) as Face;

  const [choice, setChoice] = useState<Option | null>(null);
  const [kind, setKind] = useState<OrgKind | "">("");
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);

  const org =
    organizations.find((o) => o.id === activeOrgId && designations.some((d) => d.orgId === o.id)) ??
    organizations.find((o) => o.memberIds.includes(currentPerson.id) && designations.some((d) => d.orgId === o.id));
  const d = designations.find((x) => x.orgId === org?.id && x.state === "ACTIVE");
  const owner = org ? roleIn(org, currentPerson) === "Owner" : false;
  const ownerId = org ? Object.entries(org.roles ?? {}).find(([, r]) => r === "Owner")?.[0] : undefined;
  const liveKinds = (d?.entityTypes ?? []).filter((k) => adoptions.some((a) => a.designationId === d?.id && a.entityType === k && a.state === "ACTIVE"));

  const natural: Face = done ? "success" : busy ? "loading" : !owner ? "no_permission" : "default";
  const face: Face = forced === "live" ? natural : forced;
  const offline = face === "offline";
  const readOnly = offline || face === "no_permission";
  const name = org?.name ?? "your organisation";

  const header = (
    <PageHeader crumbs={[{ label: org?.name ?? "Your organisation" }, { label: "Authority", href: "/authority" }, { label: "Stop something" }]} title="What do you want to stop?" />
  );

  if (!hydrated) {
    return (
      <AppShell>
        <div aria-hidden="true" className="h-96 animate-pulse rounded-[16px] border border-grid" />
      </AppShell>
    );
  }

  const restatement =
    choice === "pause"
      ? {
          title: "Pause NDI's access?",
          lead: "You're about to pause NDI's access: NDI's service account can no longer send requests in your name. What you've agreed stays agreed, and you can turn it back on.",
          consequences: ["Businesses can't verify with you while it's paused", "Businesses already verified are not affected"],
        }
      : {
          title: kind ? `Stop ${kindPlural(kind)}?` : "Stop an entity type?",
          lead: kind
            ? `You're about to stop ${kindPlural(kind)}: new businesses can't verify with you as ${kindPlural(kind)}. Businesses already verified are not affected. Your other entity types carry on.`
            : "",
          consequences: ["You can adopt it again later", "NDI's access is unchanged"],
        };

  const apply = () => {
    if (!d) return;
    setConfirming(false);
    setBusy(true);
    setFailed(false);
    window.setTimeout(() => {
      setBusy(false);
      if (forced === "error") {
        setFailed(true);
        return;
      }
      if (choice === "pause") {
        const r = setNdiAccess(d.id, false);
        if (!r.ok) return setFailed(true);
        setDone("NDI's service account can no longer send requests in your name. What you've agreed stays agreed.");
      } else if (choice === "stop_type" && kind) {
        const r = stopEntityType(d.id, kind);
        if (!r.ok) return setFailed(true);
        setDone(`New verifications for ${kindPlural(kind)} have stopped. Businesses already verified are not affected. Your other entity types carry on.`);
      }
    }, LOCAL_MS);
  };

  if (face === "success") {
    return (
      <AppShell>
        <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
          {header}
          <Panel>
            <div className="relative z-[4] flex flex-col gap-3">
              <p role="status" className="m-0 flex items-start gap-2 text-[15px] font-medium text-strong">
                <Icon name="check" size={16} strokeWidth={2.4} className="mt-[3px] flex-none" style={{ color: "var(--ndi-success)" }} />
                {done ?? "NDI's service account can no longer send requests in your name. What you've agreed stays agreed."}
              </p>
              <p className="m-0 text-[13.5px] leading-[1.6] text-muted">
                {choice === "stop_type" ? "You can adopt it again from your authority console." : "You can turn NDI's access back on from your authority console."}
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

  const options: { id: Option; heading: string; body: string }[] = [
    {
      id: "pause",
      heading: "Pause NDI's access.",
      body: "NDI's service account can no longer send requests in your name. What you've agreed stays agreed, and you can turn it back on.",
    },
    {
      id: "stop_type",
      heading: "Stop an entity type.",
      body: `New businesses can't verify with you as ${kind ? kindPlural(kind) : "that type"}. Businesses already verified are not affected. Other entity types carry on.`,
    },
    {
      id: "change",
      heading: "Change what people are asked.",
      body: "Adopt a new version. The old one is kept as the record of what was asked before.",
    },
  ];

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[860px] flex-col gap-5">
        {header}

        <p className="m-0 flex items-start gap-2 rounded-[12px] border border-grid px-4 py-3 text-[13.5px] leading-[1.6] text-body" style={{ background: "rgb(var(--tint) / 0.04)" }}>
          <Icon name="info" size={14} strokeWidth={2} className="mt-[3px] flex-none" />
          {NOTHING_UNVERIFIED}
        </p>
        {offline ? (
          <p role="status" className="m-0 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            You&rsquo;re offline, so nothing can be stopped. Nothing is ever stopped halfway.
          </p>
        ) : null}
        {face === "no_permission" ? (
          <p role="status" className="m-0 flex items-start gap-2.5 rounded-[12px] border border-grid px-4 py-3 text-[13px] text-body">
            <Icon name="lockRounded" size={14} strokeWidth={2} className="mt-[2px] flex-none" style={{ color: "var(--ndi-warning)" }} />
            {org && ownerId
              ? `Only ${personById(ownerId).name}, who owns ${name} on the platform, can stop anything here.`
              : "Only a designated authority's owner can stop anything here."}
          </p>
        ) : null}
        {failed || face === "error" ? (
          <p role="alert" className="m-0 rounded-[12px] border px-4 py-3 text-[13px]" style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}>
            That wasn&rsquo;t recorded. Nothing has stopped and nothing has changed — try again.
          </p>
        ) : null}

        <Panel>
          <fieldset className="relative z-[4] m-0 flex flex-col gap-3 border-0 p-0">
            <legend className="sr-only">What do you want to stop?</legend>
            {options.map((o) => {
              const on = choice === o.id;
              return (
                <label
                  key={o.id}
                  className="flex cursor-pointer items-start gap-3 rounded-[12px] border px-4 py-3"
                  style={{ borderColor: on ? "var(--accent)" : "var(--border-grid)" }}
                >
                  <input
                    type="radio"
                    name="stop"
                    className="mt-[5px]"
                    checked={on}
                    disabled={readOnly}
                    onChange={() => setChoice(o.id)}
                  />
                  <span className="flex flex-col gap-1">
                    <span className="text-[14px] font-semibold text-strong">{o.heading}</span>
                    <span className="text-[13.5px] leading-[1.6] text-body">{o.body}</span>
                  </span>
                </label>
              );
            })}

            {choice === "stop_type" || choice === "change" ? (
              <div className="max-w-[360px]">
                <Select
                  label={choice === "change" ? "For which kind of business?" : "Which kind of business?"}
                  value={kind}
                  onChange={(v) => setKind(v as OrgKind)}
                  placeholder="Choose one"
                  options={liveKinds.map((k) => ({ value: k, label: kindTitle(k) }))}
                />
              </div>
            ) : null}

            <div className="flex flex-wrap gap-2.5 border-t border-subtle pt-4">
              <GradientButton
                disabled={readOnly || !choice || ((choice === "stop_type" || choice === "change") && !kind)}
                onClick={() => (choice === "change" ? router.push(`/authority/${kind}?change=1`) : setConfirming(true))}
              >
                {choice === "change" ? "Continue" : "Stop it"}
              </GradientButton>
              <HairlineButton onClick={() => router.push("/authority")}>Cancel</HairlineButton>
            </div>
          </fieldset>
        </Panel>

        <Dialog
          open={confirming}
          onClose={() => setConfirming(false)}
          tone="danger"
          title={restatement.title}
          lead={restatement.lead}
          consequences={restatement.consequences}
          confirmLabel={choice === "pause" ? "Pause NDI's access" : "Stop it"}
          onConfirm={apply}
        />
      </div>
    </AppShell>
  );
}
