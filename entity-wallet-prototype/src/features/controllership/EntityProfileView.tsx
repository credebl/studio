"use client";

import Link from "next/link";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { DetailList } from "@/components/ui/DetailList";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { DetailLayout } from "@/components/ui/DetailLayout";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { inOrg } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { formatDate } from "./scopeModel";

/**
 * C7 — the entity's own identity and trust posture, in one place.
 *
 * Two different things are easy to conflate here and the screen keeps them
 * apart, because they fail independently and mean different things:
 *
 *  - The **foundational credential** is whether the entity can prove who it
 *    is. If it lapses, everything the entity holds or has delegated stops
 *    verifying, because every chain runs through it.
 *  - **Operator certification** is an organisational prerequisite. It gates
 *    going live rather than any screen, so it is surfaced as status and
 *    nothing on this page depends on it.
 *
 * Collapsing them into one "verified" badge would let an organisation believe
 * it was fine when the thing that had lapsed was the one that mattered.
 *
 * There is no trust-registry row: an entity is not listed on the trust registry.
 */
export function EntityProfileView() {
  const { organizations, activeOrgId, heldCredentials, relations, delegatedAuthorities } =
    useDemo();

  const screenState = useScreenState("C7", [
    "verified",
    "certification_pending",
    "foundational_expired",
  ]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const foundational = heldCredentials.filter(inOrg(activeOrgId)).find((c) => c.isFoundational);

  const foundationalExpired = screenState === "foundational_expired";
  const certificationPending = screenState === "certification_pending";

  const activeRelations = relations.filter((r) => r.state === "ACTIVE").length;
  const liveAuthorities = delegatedAuthorities.filter((a) => a.status === "ACTIVE").length;

  /* The registered facts are what the rest of the page is about, so they
     read better as a card you keep in view than as the first thing you
     scroll past. */
  const identity = (
    <Panel>
      <div className="relative z-[4] flex flex-col gap-1">
        <h2 className="font-display text-[15px] font-semibold text-strong">Identity</h2>
      </div>
      <div className="relative z-[4]">
        <DetailList
          items={[
            { label: "Registered name", value: org?.name ?? "—" },
            {
              label: "Registration number",
              value:
                foundational?.attributes.find((a) => a.name === "registration_number")
                  ?.value ?? "—",
            },
            {
              label: "Kind",
              value:
                foundational?.attributes.find((a) => a.name === "entity_type")?.value ?? "—",
            },
            { label: "Registered address", value: org?.location ?? "—" },
            {
              label: "Organisation DID",
              value: "did:polygon:0x88047ff8975c42d148dfe267220f627281ce8a09",
              mono: true,
            },
          ]}
        />
      </div>
    </Panel>
  );

  return (
    <AppShell>
      <DetailLayout
        header={
          <PageHeader
            crumbs={[{ label: "Controllership" }, { label: "Entity" }]}
            title={org?.name ?? "The entity"}
            actions={
              <StatusPill
                status={
                  foundationalExpired
                    ? "expired"
                    : certificationPending
                      ? "pending"
                      : foundational
                        ? "verified"
                        : "unverified"
                }
                label={
                  foundationalExpired
                    ? "Cannot prove itself"
                    : certificationPending
                      ? "Certification pending"
                      : foundational
                        ? "Verified"
                        : "Not verified"
                }
              />
            }
          />
        }
        side={identity}
      >
        {foundationalExpired ? (
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
                  The registration credential has lapsed
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  Nothing the entity holds will verify and nothing it has
                  delegated will pass a check, because every authority chain
                  runs through this credential. {liveAuthorities} delegated
                  {liveAuthorities === 1 ? " authority" : " authorities"} and{" "}
                  {activeRelations} controllership
                  {activeRelations === 1 ? "" : "s"} are affected — none of them
                  is individually broken.
                </p>
                <p className="max-w-[62ch] text-[13px] leading-[1.6] text-muted">
                  It has to be reissued by the Corporate Regulatory Authority. Nothing
                  here can work around it.
                </p>
              </div>
            </div>
          </Panel>
        ) : null}

        {/* ---- The two things that can fail independently ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              Trust posture
            </h2>
            <p className="text-[12.5px] leading-[1.5] text-faint">
              Two separate things. They fail independently and they mean
              different things.
            </p>
          </div>

          <div className="relative z-[4] mt-4 flex flex-col gap-3">
            <PostureRow
              icon="shieldCheck"
              title="Registration credential"
              body="Whether the entity can prove who it is. Every authority chain runs through this, so nothing survives it lapsing."
              status={foundationalExpired ? "expired" : "active"}
              statusLabel={
                foundationalExpired
                  ? "Lapsed"
                  : foundational
                    ? `Held since ${formatDate(foundational.receivedAt)}`
                    : "Not held"
              }
              action={
                <Link href="/wallet/credentials">
                  <HairlineButton className="h-9 px-3 text-[12.5px]">View it</HairlineButton>
                </Link>
              }
            />

            <PostureRow
              icon="certificate"
              title="Operator certification"
              body="An organisational prerequisite for running an entity wallet in production. It gates going live rather than anything on these screens."
              status={certificationPending ? "pending" : "valid"}
              statusLabel={certificationPending ? "Assessment in progress" : "Certified"}
              action={
                certificationPending ? (
                  <HairlineButton className="h-9 px-3 text-[12.5px]">
                    What is required
                  </HairlineButton>
                ) : undefined
              }
            />
          </div>
        </Panel>

        {/* ---- What hangs off it ---- */}
        <Panel>
          <div className="relative z-[4] flex flex-col gap-1">
            <h2 className="font-display text-[15px] font-semibold text-strong">
              What rests on this
            </h2>
            <p className="max-w-[62ch] text-[12.5px] leading-[1.5] text-faint">
              Everything below traces back to the registration credential
              above.
            </p>
          </div>
          <div className="relative z-[4] mt-3 grid gap-3 min-[641px]:grid-cols-2">
            <Link
              href="/controllership/relations"
              className="ndi-navrow flex items-center justify-between gap-3 rounded-[11px] border border-grid px-3.5 py-3"
              data-active="0"
            >
              <span className="flex flex-col">
                <span className="font-display text-[13.5px] font-medium text-body">
                  {activeRelations} active controllership{activeRelations === 1 ? "" : "s"}
                </span>
                <span className="text-[12px] text-faint">People who may act for us</span>
              </span>
              <Icon name="arrowRight" size={14} strokeWidth={2} className="flex-none" />
            </Link>

            <Link
              href="/delegated-authority"
              className="ndi-navrow flex items-center justify-between gap-3 rounded-[11px] border border-grid px-3.5 py-3"
              data-active="0"
            >
              <span className="flex flex-col">
                <span className="font-display text-[13.5px] font-medium text-body">
                  {liveAuthorities} live delegated authorit{liveAuthorities === 1 ? "y" : "ies"}
                </span>
                <span className="text-[12px] text-faint">In other people&rsquo;s wallets</span>
              </span>
              <Icon name="arrowRight" size={14} strokeWidth={2} className="flex-none" />
            </Link>
          </div>
        </Panel>
      </DetailLayout>
    </AppShell>
  );
}

function PostureRow({
  icon,
  title,
  body,
  status,
  statusLabel,
  action,
}: {
  icon: "shieldCheck" | "link" | "certificate";
  title: string;
  body: string;
  status: string;
  statusLabel: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2.5 rounded-[12px] border border-grid px-3.5 py-3 min-[641px]:flex-row min-[641px]:items-start min-[641px]:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        <span
          aria-hidden="true"
          className="mt-0.5 flex h-8 w-8 flex-none items-center justify-center rounded-[9px] border border-grid"
          style={{ background: "rgb(var(--tint) / 0.04)" }}
        >
          <Icon name={icon} size={15} strokeWidth={1.9} />
        </span>
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="font-display text-[13.5px] font-medium leading-[1.4] text-body">
            {title}
          </p>
          <p className="max-w-[54ch] text-[12.5px] leading-[1.55] text-muted">{body}</p>
        </div>
      </div>
      <div className="flex flex-none flex-wrap items-center gap-2 min-[641px]:justify-end">
        <StatusPill status={status} label={statusLabel} />
        {action}
      </div>
    </div>
  );
}
