"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { useScreenState } from "@/components/demo/screenState";
import { AppShell } from "@/components/layout/AppShell";
import { GradientButton } from "@/components/ui/GradientButton";
import { PageHeader } from "@/components/ui/PageHeader";
import { Panel } from "@/components/ui/Panel";
import { SimulatedLink } from "@/components/ui/SimulatedStep";
import { StatusPill } from "@/components/ui/StatusPill";
import { Icon } from "@/components/ui/icons";
import { formatDate } from "@/features/controllership/scopeModel";
import { inOrg, type ControllershipRelation, type Person } from "@/lib/demoData";
import { useDemo } from "@/lib/demoStore";

import { presetOf } from "./presets";

/**
 * SCR-DEL-05 — People who can act for {organisation}.
 *
 * WHAT IT ANSWERS
 *
 * "Who can act for us, and what can each of them do?" — so the
 * representative is listed first, everyone else by the name their citizen
 * credential gave when they accepted (with the account's name beside it if
 * the two differ), what they can do in the preset's own words, since when
 * and until when. A pending appointment shows when it lapses; a declined
 * or expired one is stated per person, with the way to appoint again. The
 * earlier column on the members page had none of that, and after Ugyen
 * declined Dorji saw nothing at all.
 *
 * Someone who was appointed sees only their own row: what others can do is
 * the representative's business.
 */

interface Row {
  id: string;
  person: Person;
  relation: ControllershipRelation;
  status: "representative" | "active" | "pending" | "declined" | "expired";
}

const today = () => new Date().toISOString().slice(0, 10);

export function PeopleWhoCanActView() {
  const router = useRouter();
  const { organizations, activeOrgId, relations, people, harness, setPersona } = useDemo();
  const forced = useScreenState("SCR-DEL-05", ["live", "only_you", "pending", "accepted", "declined", "expired"]);

  const org = organizations.find((o) => o.id === activeOrgId);
  const orgName = org?.name ?? "the organisation";
  const person = (id: string) => people.find((p) => p.id === id);

  const statusOf = (r: ControllershipRelation): Row["status"] | null => {
    if (r.isRootAuthority) return r.state === "ACTIVE" ? "representative" : null;
    if (r.state === "ACTIVE") return "active";
    if (r.state === "PENDING_ACCEPTANCE") return r.expiresAt && r.expiresAt < today() ? "expired" : "pending";
    if (r.state === "EXPIRED") return "expired";
    if (r.state === "TERMINATED" && r.endedReason === "declined") return "declined";
    return null;
  };

  let rows: Row[] = relations
    .filter(inOrg(activeOrgId))
    .map((r) => ({ id: r.id, person: person(r.personId)!, relation: r, status: statusOf(r)! }))
    .filter((r) => r.person && r.status)
    .sort((a, b) => (a.status === "representative" ? -1 : b.status === "representative" ? 1 : 0));

  /* A forced face needs a row to show it on, whatever the story's state. */
  if (forced !== "live") {
    const rep = rows.filter((r) => r.status === "representative");
    const ugyen = people.find((p) => p.id === "ugyen");
    const sample = (status: Row["status"]): Row[] =>
      ugyen
        ? [
            {
              id: "sample",
              person: ugyen,
              status,
              relation: {
                id: "sample",
                personId: "ugyen",
                legalBasis: "entity_consent",
                instrument: null,
                scope: { version: 1, validFrom: today(), validUntil: null, grants: [] },
                state: status === "active" ? "ACTIVE" : "PENDING_ACCEPTANCE",
                isRootAuthority: false,
                createdAt: today(),
                acceptedAt: status === "active" ? today() : null,
                activatedAt: status === "active" ? today() : null,
                preset: "receive",
                expiresAt: today(),
                verifiedName: status === "active" ? "Ugyen Phuntsho Dorji" : null,
              },
            },
          ]
        : [];
    rows = forced === "only_you" ? rep : [...rep, ...sample(forced === "accepted" ? "active" : (forced as Row["status"]))];
  }

  const isRepresentative = rows.some((r) => r.status === "representative" && r.person.id === harness.persona);
  const shown = isRepresentative ? rows : rows.filter((r) => r.person.id === harness.persona);
  const onlyYou = isRepresentative && shown.length === 1;

  return (
    <AppShell>
      <div className="mx-auto flex w-full max-w-[960px] flex-col gap-5">
        <PageHeader
          crumbs={[{ label: orgName }, { label: "People who can act" }]}
          title={`People who can act for ${orgName}`}
          actions={
            isRepresentative ? (
              <Link href="/people-who-can-act/give">
                <GradientButton>
                  <Icon name="plus" size={15} strokeWidth={2} />
                  Give someone authority
                </GradientButton>
              </Link>
            ) : undefined
          }
        />

        <Panel padded={false}>
          <ul className="relative z-[4] m-0 flex list-none flex-col p-0">
            {shown.map((row, i) => {
              const r = row.relation;
              const preset = presetOf(r.preset);
              const verified = r.verifiedName ?? null;
              const name = row.status === "active" && verified ? verified : row.person.name;
              const first = row.person.name.split(" ")[0];
              return (
                <li key={row.id} className={`flex flex-col gap-2 px-5 py-4 ${i > 0 ? "border-t border-subtle" : ""}`}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-display text-[14.5px] font-semibold text-strong">{name}</span>
                      {row.status === "active" && verified && verified !== row.person.name ? (
                        <span className="text-[12.5px] text-faint">
                          Name from their identity credential. Their account says {row.person.name}.
                        </span>
                      ) : null}
                      <span className="text-[13px] leading-[1.55] text-body">
                        {row.status === "representative"
                          ? `Recorded as ${orgName}'s representative. Can do everything, and is the only one who can give others authority.`
                          : preset
                            ? preset.label
                            : "What they can do was set individually, before the four choices existed."}
                      </span>
                      {r.preset === "share" && r.scope.grants.some((g) => g.relyingParties.mode === "list") ? (
                        <span className="text-[12.5px] text-faint">
                          With{" "}
                          {r.scope.grants.flatMap((g) => (g.relyingParties.mode === "list" ? g.relyingParties.values : []))
                            .filter((v, k, a) => a.indexOf(v) === k)
                            .join(", ")}
                          {r.shareNeedsApproval ? " — each share needs approval" : ""}
                        </span>
                      ) : null}
                    </span>
                    <StatusPill
                      status={
                        row.status === "representative" || row.status === "active"
                          ? "active"
                          : row.status === "pending"
                            ? "pending_acceptance"
                            : row.status === "declined"
                              ? "declined"
                              : "expired"
                      }
                      label={
                        row.status === "representative"
                          ? "Representative"
                          : row.status === "active"
                            ? "Can act"
                            : row.status === "pending"
                              ? "Waiting to accept"
                              : row.status === "declined"
                                ? "Declined"
                                : "Expired"
                      }
                    />
                  </div>
                  <p className="m-0 text-[12.5px] text-faint">
                    {row.status === "pending"
                      ? `Offered ${formatDate(r.createdAt)}. Lapses on ${formatDate(r.expiresAt ?? today())} if ${first} doesn't accept.`
                      : row.status === "declined"
                        ? `${first} declined.`
                        : row.status === "expired"
                          ? `${first} didn't accept in time.`
                          : `Since ${formatDate(r.activatedAt ?? r.createdAt)} · ${r.scope.validUntil ? `until ${formatDate(r.scope.validUntil)}` : "no end date"}`}
                  </p>
                  {isRepresentative && (row.status === "declined" || row.status === "expired") ? (
                    <div>
                      <Link href="/people-who-can-act/give" className="ndi-plainlink text-[12.5px] font-medium text-accent">
                        Appoint again
                      </Link>
                    </div>
                  ) : null}
                  {isRepresentative && row.status === "pending" && row.id !== "sample" ? (
                    <div>
                      <SimulatedLink
                        onClick={() => {
                          setPersona(row.person.id as Parameters<typeof setPersona>[0]);
                          router.push(`/appointments/${row.id}`);
                        }}
                      >
                        Open it as {row.person.name} (stands in for their notification)
                      </SimulatedLink>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </Panel>

        {onlyYou ? (
          <p className="m-0 max-w-[64ch] text-[13px] leading-[1.6] text-muted">
            Only you can act for {orgName} so far. You can give members authority to act for it — each
            of them has to accept with their own NDI wallet.
          </p>
        ) : null}
      </div>
    </AppShell>
  );
}
