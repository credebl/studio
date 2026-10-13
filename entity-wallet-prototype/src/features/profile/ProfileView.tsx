"use client";

import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { HairlineButton } from "@/components/ui/HairlineButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { FIELD_BLOCK_CLASS, FIELD_CLASS, LABEL_CLASS } from "@/components/ui/formStyles";
import { Icon } from "@/components/ui/icons";
import { useDemo } from "@/lib/demoStore";

const TABS: TabItem[] = [
  { id: "profile", label: "Profile", icon: "user" },
  { id: "sessions", label: "Sessions", icon: "shieldCheck" },
];

/**
 * The signed-in person's profile.
 *
 * It used to be hard-coded to "Kezang Loday, kezang@bhutanndi.bt" — a
 * placeholder from the original Studio, and the name of the prototype's own
 * designer rather than anyone in the story — so whoever you were driving as,
 * Anand or Dorji or a member who had just joined, the profile said someone
 * else. It now reads the person the console is being driven as.
 */
export function ProfileView() {
  const { resetDemo, currentPerson } = useDemo();
  const [tab, setTab] = useState("profile");
  const [first, ...rest] = currentPerson.name.split(" ");
  const last = rest.join(" ");

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader crumbs={[{ label: "Profile" }]} title="Profile" />

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Profile sections" />

        {tab === "profile" ? (
          <Panel>
            <div className="relative z-[4] flex flex-col gap-6">
              <div className="flex flex-wrap items-center gap-4">
                <span
                  className="inline-flex h-16 w-16 flex-none items-center justify-center rounded-full border border-grid font-display text-[22px] font-semibold text-[var(--text-on-mint)]"
                  style={{ background: "var(--grad-mint)" }}
                >
                  {currentPerson.name.charAt(0)}
                </span>
                <HairlineButton className="h-11 px-4 text-[13px]">
                  <Icon name="edit" size={15} strokeWidth={1.8} />
                  Change photo
                </HairlineButton>
              </div>

              <div className="grid gap-4 min-[641px]:grid-cols-2">
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>First name</span>
                  <input key={`f-${currentPerson.id}`} className={`${FIELD_CLASS} h-12`} defaultValue={first} />
                </label>
                <label className={FIELD_BLOCK_CLASS}>
                  <span className={LABEL_CLASS}>Last name</span>
                  <input key={`l-${currentPerson.id}`} className={`${FIELD_CLASS} h-12`} defaultValue={last} />
                </label>
              </div>

              <label className={FIELD_BLOCK_CLASS}>
                <span className={LABEL_CLASS}>Email</span>
                {/* Shown but not editable here: the email is the account
                    identity, so changing it is a re-verification flow rather
                    than a field you save with the rest of the form. */}
                <input
                  className={`${FIELD_CLASS} h-12 cursor-not-allowed opacity-70`}
                  key={`e-${currentPerson.id}`}
                  defaultValue={currentPerson.email}
                  readOnly
                />
                <span className="text-[12.5px] leading-[1.5] text-faint">
                  Your email identifies the account and cannot be changed here.
                </span>
              </label>

              <div className="flex flex-wrap items-center gap-2.5 border-t border-subtle pt-5">
                <GradientButton>
                  <Icon name="check" size={16} strokeWidth={2.2} />
                  Save changes
                </GradientButton>
                <HairlineButton className="h-12">Cancel</HairlineButton>
              </div>
            </div>
          </Panel>
        ) : null}

        {tab === "profile" ? (
          <Panel>
            <div className="relative z-[4] flex flex-wrap items-center justify-between gap-4">
              <div className="min-w-0">
                <h2 className="m-0 font-display text-[15px] font-semibold text-strong">
                  Reset demo data
                </h2>
                <p className="m-0 mt-1 text-[13.5px] leading-[1.55] text-muted">
                  Puts every list back to the sample data this build ships with. Anything created
                  or deleted in this browser is discarded.
                </p>
              </div>
              <HairlineButton className="h-11 px-4 text-[13px]" onClick={resetDemo}>
                <Icon name="refresh" size={15} strokeWidth={1.8} />
                Reset demo data
              </HairlineButton>
            </div>
          </Panel>
        ) : null}

        {tab === "sessions" ? (
          <Panel padded={false}>
            {/* The current session is always real, so this table is never
                empty and needs no empty state. */}
            <DataTable columns={["Device", "Location", "Signed in", "Last active"]}>
              <tr>
                <td>
                  <span className="flex items-center gap-2.5">
                    <Icon name="shieldCheck" size={16} strokeWidth={1.8} className="text-accent" />
                    This device
                  </span>
                </td>
                <td className="text-muted">&mdash;</td>
                <td className="text-muted">&mdash;</td>
                <td className="text-muted">Now</td>
              </tr>
            </DataTable>
          </Panel>
        ) : null}
      </div>
    </AppShell>
  );
}
