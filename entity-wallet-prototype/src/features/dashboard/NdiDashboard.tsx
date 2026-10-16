"use client";

import Link from "next/link";

import { GradientButton } from "@/components/ui/GradientButton";
import { Panel } from "@/components/ui/Panel";
import { StatusPill } from "@/components/ui/StatusPill";
import { WaveBanner } from "@/components/ui/WaveBanner";
import { Icon, type IconName } from "@/components/ui/icons";
import { NDI_ORG } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

/**
 * The dashboard of Bhutan NDI's own organisation — root's and the admins'.
 *
 * WHY IT OPENS ON THE PLATFORM, NOT THE STUDIO
 *
 * NDI's people have the whole Studio, but on day zero the one thing that
 * matters is that nobody can bring an organisation on until a platform admin
 * exists. So the page leads with that — who administers the platform, and
 * what is waiting for a decision — and puts the Studio's own work beside it
 * as links. Root's primary action is inviting the first two admins, while
 * it still may (FLOW-ONB-02 S9); an admin's is the queue, because that is
 * their job. Once two are active, root has nothing routine to do here, and
 * the page says so rather than offering a form that would be refused.
 */
export function NdiDashboard({ name }: { name: string }) {
  const { people, organizations, orgInvitations, accessRequests, currentPerson, firstRun, adminStatus: platformStatus } = useDemo();
  const isRoot = currentPerson.platformRole === "root";
  const rootMayInvite = isRoot && platformStatus().rootBlock === null;

  const admins = people.filter((p) => p.platformRole === "admin" && p.hasAccount !== false);
  const invited = orgInvitations.filter((i) => i.kind === "A" && i.state === "PENDING");
  const onPlatform = organizations.filter((o) => o.id !== NDI_ORG);
  const waiting = accessRequests.filter((a) => a.state === "PENDING");

  const adminStatus =
    admins.length > 0
      ? { status: "active", label: `${admins.length} active` }
      : invited.length > 0
        ? { status: "invited", label: "Invited — not yet accepted" }
        : { status: "not_set_up", label: "None yet" };

  const studio: { label: string; href: string; icon: IconName }[] = [
    { label: "Issue a credential", href: "/credentials/issue", icon: "issue" },
    { label: "Verify a credential", href: "/verification", icon: "verify" },
    { label: "Schemas", href: "/schemas", icon: "layers" },
    { label: "Ecosystems", href: "/ecosystems", icon: "ecosystems" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <WaveBanner
        eyebrow="— Bhutan NDI"
        title={
          <>
            {/* The platform's first day is greeted as one: root signing in to a
                platform deployed a moment ago has never been here before. */}
            {firstRun ? "Welcome" : "Welcome back"}, <span className="ndi-wave-text ndi-wave-tight">{name}</span>
          </>
        }
        lead={
          isRoot
            ? rootMayInvite
              ? "You're using the NDI root account. Its one job now is bringing on the platform's first two administrators — after that, they run it."
              : "You're using the NDI root account. Two administrators run the platform; the root account is for emergencies only."
            : "You administer the platform for Bhutan NDI. Organisations' requests come to you; the Studio is here too."
        }
        action={
          rootMayInvite ? (
            <Link href="/admin/team">
              <GradientButton>
                <Icon name="users" size={16} strokeWidth={2} />
                Invite a platform admin
              </GradientButton>
            </Link>
          ) : isRoot ? undefined : (
            <Link href="/admin/organisations">
              <GradientButton>
                <Icon name="building" size={16} strokeWidth={2} />
                {waiting.length > 0 ? "Review requests" : "See organisations"}
              </GradientButton>
            </Link>
          )
        }
      />

      <div className="grid gap-5 grid-cols-[repeat(auto-fit,minmax(280px,1fr))]">
        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Platform admins</h2>
              <StatusPill status={adminStatus.status} label={adminStatus.label} />
            </div>
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              {admins.length >= 2
                ? `${admins.map((a) => a.name).join(" and ")} run the platform, and approve what each other propose.`
                : admins.length === 1
                  ? `${admins[0].name} is the only administrator. Anything that needs a second administrator's approval waits until there are two.`
                  : "The platform needs two administrators: every approval takes a second one."}
            </p>
            <Link href="/admin/team" className="ndi-plainlink text-[12.5px] font-medium text-accent">
              {isRoot ? "Manage platform admins" : "See platform admins"}
            </Link>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="m-0 font-display text-[15px] font-semibold text-strong">Organisations</h2>
              <StatusPill
                status={waiting.length > 0 ? "requested" : "active"}
                label={waiting.length > 0 ? `${waiting.length} waiting for a decision` : "Nothing waiting"}
              />
            </div>
            <p className="m-0 text-[13px] leading-[1.6] text-muted">
              {onPlatform.length} on the platform. Requests to issue, verify or hold an Entity Wallet
              are decided by a platform admin.
            </p>
            <Link href="/admin/organisations" className="ndi-plainlink text-[12.5px] font-medium text-accent">
              Open organisations
            </Link>
          </div>
        </Panel>

        <Panel>
          <div className="relative z-[4] flex flex-col gap-3">
            <h2 className="m-0 font-display text-[15px] font-semibold text-strong">The Studio</h2>
            <ul className="m-0 flex list-none flex-col gap-2 p-0">
              {studio.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="ndi-plainlink flex items-center gap-2.5 text-[13.5px] text-body"
                  >
                    <Icon name={item.icon} size={15} strokeWidth={1.8} className="flex-none text-accent" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </Panel>
      </div>
    </div>
  );
}
