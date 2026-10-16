"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * Deleting an organization takes its ledger with it, so the page counts up
 * exactly what will go before it will let you do it.
 *
 * The confirmation asks you to type the organization's name rather than click
 * a red button: this is not undoable, and a typed name is the cheapest way to
 * make sure the person destroying it knows which one they are looking at.
 */
export function DeleteOrganizationView() {
  const router = useRouter();
  const demo = useDemo();
  const {
    organizations,
    activeOrgId,
    schemas,
    credDefs,
    credentials,
    verifications,
    connections,
    deleteOrganization,
  } = demo;

  const org = organizations.find((o) => o.id === activeOrgId) ?? organizations[0];
  const [typed, setTyped] = useState("");

  if (!org) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader
            crumbs={[{ label: "Organizations", href: "/organizations" }, { label: "Delete" }]}
            title="Delete organization"
          />
          <Panel padded={false}>
            <EmptyState
              icon="building"
              tone="filtered"
              title="No organization to delete"
              message="There is nothing here to remove."
              action={
                <Link href="/onboarding">
                  <HairlineButton>Register your organisation</HairlineButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const losses = [
    { label: "Schemas", n: schemas.length, icon: "layers" },
    { label: "Credential definitions", n: credDefs.length, icon: "credentials" },
    { label: "Issued credentials", n: credentials.length, icon: "issue" },
    { label: "Verification records", n: verifications.length, icon: "verify" },
    { label: "Connections", n: connections.length, icon: "connections" },
    { label: "Members", n: Math.max(0, (org?.memberIds.length ?? 1) - 1), icon: "users" },
  ] as const;

  const confirmed = typed.trim() === org.name;

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Organizations", href: "/organizations" }, { label: "Delete" }]}
          title="Delete organization"
        />

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span
                className="inline-flex h-11 w-11 flex-none items-center justify-center rounded-xl border"
                style={{
                  borderColor: "var(--text-danger)",
                  background: "rgb(var(--tint) / 0.03)",
                  color: "var(--text-danger)",
                }}
              >
                <Icon name="shieldAlert" size={19} strokeWidth={1.8} />
              </span>
              <div className="min-w-0">
                <h2 className="m-0 font-display text-[17px] font-semibold tracking-[-0.01em] text-strong">
                  This cannot be undone
                </h2>
                <p className="m-0 mt-1.5 text-[14px] leading-[1.6] text-muted">
                  Deleting <span className="text-strong">{org.name}</span> removes everything it
                  owns. Credentials already in holders&rsquo; wallets stay there, but you will no
                  longer be able to revoke them or verify against your definitions.
                </p>
              </div>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-4">
            <span className={LABEL_CLASS}>What will be deleted</span>
            <ul className="m-0 grid list-none gap-2.5 p-0 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
              {losses.map((l) => (
                <li
                  key={l.label}
                  className="flex items-center gap-3 rounded-xl border border-grid p-3.5"
                  style={{ background: "rgb(var(--tint) / 0.02)" }}
                >
                  <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-[10px] border border-grid text-faint">
                    <Icon name={l.icon} size={16} strokeWidth={1.7} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-display text-[16px] font-semibold text-strong">
                      {l.n}
                    </span>
                    <span className="block text-[12.5px] text-muted">{l.label}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-5">
            <label className="flex min-w-0 flex-col gap-[7px]">
              <span className={LABEL_CLASS}>
                Type <span className="text-strong">{org.name}</span> to confirm
              </span>
              <input
                className={`${FIELD_CLASS} h-12`}
                placeholder={org.name}
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                autoComplete="off"
              />
            </label>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              <button
                type="button"
                disabled={!confirmed}
                onClick={() => {
                  deleteOrganization(org.id);
                  router.push("/organizations");
                }}
                className="inline-flex h-12 cursor-pointer items-center justify-center gap-2.5 rounded-xl border px-6 font-display text-[14.5px] font-semibold transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-40"
                style={{
                  borderColor: "var(--text-danger)",
                  color: "var(--text-danger)",
                  background: "rgb(var(--tint) / 0.02)",
                }}
              >
                <Icon name="trash" size={16} strokeWidth={2} />
                Delete {org.name}
              </button>
              <Link href="/organizations">
                <HairlineButton className="h-12">Cancel</HairlineButton>
              </Link>
              <span className="text-[12.5px] text-faint">
                Reset demo data from your profile to bring the sample back.
              </span>
            </div>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
