"use client";

import Link from "next/link";
import { useState } from "react";

import { AppShell } from "@/components/layout/AppShell";
import { DataTable } from "@/components/ui/DataTable";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SearchField } from "@/components/ui/SearchField";
import { StatusPill } from "@/components/ui/StatusPill";
import { Tabs, type TabItem } from "@/components/ui/Tabs";
import { Toolbar, ToolbarCount } from "@/components/ui/Toolbar";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { useDemo } from "@/lib/demoStore";

const TABS: TabItem[] = [
  { id: "users", label: "Users", icon: "users" },
  { id: "invitations", label: "Invitations", icon: "mail" },
];

/**
 * The Studio's users of Bhutan NDI's own organisation — the people the story
 * has put there, read from the store.
 *
 * WHY NOT THE STUDIO'S OWN LIST
 *
 * This page used to list a fixture inherited from the original Studio: four
 * NDI staff, the first of them the prototype's own designer, none of whom
 * the story knows. On a platform whose root administrator signs in for the
 * first time, a list of colleagues already invited, issuing and verifying
 * contradicted everything the dashboard beside it said. Now it lists who
 * actually belongs to NDI's organisation — root from the deployment, and the
 * platform admins root has invited as they accept — and the invitations
 * still waiting.
 *
 * Inviting happens on Platform admins, where root decides whom to trust; a
 * second invite form here would make NDI staff by another route, with roles
 * ("Issuer", "Verifier") the platform's administration does not have.
 */
export function UsersView() {
  const { people, organizations, activeOrgId, orgInvitations, currentPerson, personById } = useDemo();
  const [tab, setTab] = useState("users");
  const [query, setQuery] = useState("");

  const org = organizations.find((o) => o.id === activeOrgId);
  const q = query.trim().toLowerCase();
  const matches = (name: string, email: string) =>
    !q || name.toLowerCase().includes(q) || email.toLowerCase().includes(q);

  /* When each admin joined: the day their invitation was accepted. Root's
     account came with the deployment. */
  const joinedOn = (email: string) =>
    orgInvitations.find((i) => i.kind === "A" && i.state === "ACCEPTED" && i.email.toLowerCase() === email.toLowerCase())
      ?.decidedAt ?? null;

  const users = people
    .filter((p) => p.hasAccount !== false && org?.memberIds.includes(p.id) && matches(p.name, p.email))
    .sort((a, b) => (a.platformRole === "root" ? -1 : b.platformRole === "root" ? 1 : 0));
  const invited = orgInvitations.filter(
    (i) => i.kind === "A" && i.state === "PENDING" && matches(i.email, i.email),
  );
  const isRoot = currentPerson.platformRole === "root";

  return (
    <AppShell>
      <div className="flex flex-col gap-5">
        <PageHeader
          crumbs={[{ label: org?.name ?? "Bhutan NDI" }, { label: "Users" }]}
          title="Users"
          actions={
            isRoot ? (
              <Link href="/admin/team">
                <GradientButton>
                  <Icon name="send" size={15} strokeWidth={2} />
                  Invite a platform admin
                </GradientButton>
              </Link>
            ) : undefined
          }
        />

        <Tabs tabs={TABS} active={tab} onChange={setTab} label="Users and invitations" />

        <Panel padded={false}>
          <Toolbar
            left={
              <ToolbarCount>
                {tab === "users" ? `${users.length} ${users.length === 1 ? "user" : "users"}` : `${invited.length} pending`}
              </ToolbarCount>
            }
            right={
              <SearchField
                className="w-full min-[561px]:w-[280px]"
                placeholder={tab === "users" ? "Search users" : "Search invitations"}
                value={query}
                onChange={setQuery}
              />
            }
          />
          {tab === "users" ? (
            <DataTable
              columns={["Name", "Email", "Role", "Status", "Joined"]}
              empty={{ icon: "users", title: "No users match", message: "Try a different name or address." }}
            >
              {users.length
                ? users.map((p) => (
                    <tr key={p.id}>
                      <td className="text-strong">{p.name}</td>
                      <td className="text-muted">{p.email}</td>
                      <td>{p.platformRole === "root" ? "Root administrator" : "Platform admin"}</td>
                      <td>
                        <StatusPill status="active" />
                      </td>
                      <td className="whitespace-nowrap text-muted">
                        {p.platformRole === "root"
                          ? "With the deployment"
                          : joinedOn(p.email)
                            ? formatDate(joinedOn(p.email) as string)
                            : "—"}
                      </td>
                    </tr>
                  ))
                : undefined}
            </DataTable>
          ) : (
            <DataTable
              columns={["Email", "Invited by", "Status", "Expires"]}
              empty={{
                icon: "mail",
                title: "No invitations waiting",
                message: "Platform admins root invites appear here until they set up their account.",
              }}
            >
              {invited.length
                ? invited.map((i) => (
                    <tr key={i.id}>
                      <td className="text-strong">{i.email}</td>
                      <td className="text-muted">{personById(i.invitedBy).name}</td>
                      <td>
                        <StatusPill status="invited" />
                      </td>
                      <td className="whitespace-nowrap text-muted">{i.expiresAt ? formatDate(i.expiresAt) : "—"}</td>
                    </tr>
                  ))
                : undefined}
            </DataTable>
          )}
        </Panel>
      </div>
    </AppShell>
  );
}
