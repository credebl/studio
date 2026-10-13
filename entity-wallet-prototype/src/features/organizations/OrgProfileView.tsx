"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

/**
 * The organization you are working in, and its settings.
 *
 * Deletion is reachable from here but pushed to its own page rather than sat
 * at the bottom of the form: it is not a setting, and nothing destructive
 * should share a Save button with a description field.
 */
export function OrgProfileView() {
  const { organizations, activeOrgId, updateOrganization, schemas, credentials } = useDemo();
  const org = organizations.find((o) => o.id === activeOrgId) ?? organizations[0];

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState("");
  const [saved, setSaved] = useState(false);

  /* Seeded from the store rather than held only in it, so the form can be
     edited and abandoned without the change leaking into the workspace. */
  useEffect(() => {
    if (!org) return;
    setName(org.name);
    setDescription(org.description);
    setWebsite(org.website ?? "");
    setLocation(org.location ?? "");
  }, [org?.id, org]);

  if (!org) {
    return (
      <AppShell>
        <div className="flex flex-col gap-5">
          <PageHeader crumbs={[{ label: "Organization" }]} title="Organization" />
          <Panel padded={false}>
            <EmptyState
              icon="building"
              title="No organization yet"
              message="Register your organisation to give it a wallet of its own."
              action={
                <Link href="/onboarding">
                  <GradientButton>Register your organisation</GradientButton>
                </Link>
              }
            />
          </Panel>
        </div>
      </AppShell>
    );
  }

  const save = () => {
    updateOrganization(org.id, {
      name: name.trim() || org.name,
      description: description.trim(),
      website: website.trim() || undefined,
      location: location.trim() || undefined,
    });
    setSaved(true);
    window.setTimeout(() => setSaved(false), 2000);
  };

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: "Organizations", href: "/organizations" }, { label: org.name }]}
          title="Organization profile"
          actions={
            <Link href="/organizations/billing">
              <HairlineButton className="h-11 px-4 text-[13px]">
                <Icon name="creditCard" size={15} strokeWidth={1.8} />
                Billing
              </HairlineButton>
            </Link>
          }
        />

        <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(240px,1fr))]">
          {[
            { label: "Members", n: org?.memberIds.length ?? 0, icon: "users" as const },
            { label: "Schemas", n: schemas.length, icon: "layers" as const },
            { label: "Credentials issued", n: credentials.length, icon: "issue" as const },
          ].map((s) => (
            <Panel key={s.label}>
              <div className="relative z-[4] flex items-center gap-3">
                <span
                  className="inline-flex h-10 w-10 flex-none items-center justify-center rounded-[10px] border border-grid text-accent"
                  style={{ background: "var(--ndi-mint-04)" }}
                >
                  <Icon name={s.icon} size={17} strokeWidth={1.7} />
                </span>
                <span className="min-w-0">
                  <span className="block font-display text-[20px] font-semibold tracking-[-0.02em] text-strong">
                    {s.n}
                  </span>
                  <span className="block text-[12.5px] text-muted">{s.label}</span>
                </span>
              </div>
            </Panel>
          ))}
        </div>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-6">
            <div className="flex flex-wrap items-center gap-4">
              <span
                className="inline-flex h-16 w-16 flex-none items-center justify-center rounded-2xl border border-grid font-display text-[22px] font-semibold text-[var(--text-on-mint)]"
                style={{ background: "var(--grad-mint)" }}
              >
                {org.name.slice(0, 1)}
              </span>
              <div className="min-w-0">
                <p className="m-0 font-display text-[16px] font-semibold text-strong">{org.name}</p>
                <p className="m-0 mt-1 flex flex-wrap items-center gap-2 text-[12.5px] text-faint">
                  <span>{org.role}</span>
                  <span>·</span>
                  <StatusPill status={org.visibility === "public" ? "active" : "invited"} />
                  <span>·</span>
                  <span>created {org.createdAt}</span>
                </p>
              </div>
            </div>

            <div className="grid gap-4 min-[641px]:grid-cols-2">
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Name</span>
                <input
                  className={`${FIELD_CLASS} h-12`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </label>
              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Location</span>
                <input
                  className={`${FIELD_CLASS} h-12`}
                  placeholder="Thimphu, Bhutan"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </label>
            </div>

            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Description</span>
              <input
                className={`${FIELD_CLASS} h-12`}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </label>

            <label className={FIELD_BLOCK_CLASS}>
              <span className={LABEL_CLASS}>Website</span>
              <input
                className={`${FIELD_CLASS} h-12`}
                placeholder="https://example.bt"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </label>

            <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
              <GradientButton onClick={save}>
                <Icon name={saved ? "check" : "check"} size={16} strokeWidth={2.2} />
                {saved ? "Saved" : "Save changes"}
              </GradientButton>
              <HairlineButton
                className="h-12"
                onClick={() =>
                  updateOrganization(org.id, {
                    visibility: org.visibility === "public" ? "private" : "public",
                  })
                }
              >
                <Icon name={org.visibility === "public" ? "eyeOff" : "eye"} size={15} strokeWidth={1.8} />
                Make {org.visibility === "public" ? "private" : "public"}
              </HairlineButton>
            </div>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-wrap items-center justify-between gap-4">
            <div className="min-w-0">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                Delete this organization
              </h2>
              <p className="m-0 mt-1 text-[13.5px] leading-[1.55] text-muted">
                Removes the organization and everything it owns. This cannot be undone.
              </p>
            </div>
            <Link href="/delete-organization">
              <HairlineButton
                className="h-11 px-4 text-[13px]"
                style={{ borderColor: "var(--text-danger)", color: "var(--text-danger)" }}
              >
                <Icon name="trash" size={15} strokeWidth={1.8} />
                Delete organization
              </HairlineButton>
            </Link>
          </div>
        </Panel>
      </div>
    </AppShell>
  );
}
