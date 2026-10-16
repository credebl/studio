import type { ApprovalPolicy, PresetId, Scope, ScopeGrant } from "@/lib/demoData";

/**
 * The four presets a representative chooses from on SCR-DEL-02
 * (EW-FLOW3-SD §4.2, decided 24 Sep 2026; UX-EW-01 UXD-22).
 *
 * WHY FOUR, AND NO CUSTOM OPTION
 *
 * This replaced a matrix of operations ticked one by one, with filters and
 * an approval rule each. A representative who ticked "receive" and "accept"
 * could not say afterwards what they had granted — the guided grant matched
 * no preset at all — and UC-20 asks exactly that: can they state one thing
 * the person can do and one they cannot. A custom option would bring the
 * matrix back behind a link. So every grant is one of four, and each is
 * described by what it allows **and what it doesn't** — the negative
 * clause every grant summary carries (UXD-04).
 *
 * TWO THINGS NO PRESET GIVES
 *
 * Giving others authority is the representative's alone — a property of
 * their position, not an operation. Exporting the organisation's
 * credentials is a dual-controlled workflow nobody performs alone. *Everything*
 * says both, because "everything" is otherwise read literally.
 *
 * The scope each resolves to is internal: it is what the rest of the
 * console checks against, and it never appears on a screen.
 */
export interface Preset {
  id: PresetId;
  /** The preset's own label, which the user does see (UX-EW-01 §2.4). */
  label: string;
  allows: string[];
  doesNotAllow: string[];
}

export const PRESETS: Preset[] = [
  {
    id: "receive",
    label: "Receive credentials",
    allows: ["Receive credentials offered to the organisation, accept them, and see what it holds"],
    doesNotAllow: ["Share anything the organisation holds", "Approve anyone else's actions", "Give anyone else authority"],
  },
  {
    id: "share",
    label: "Share credentials with named organisations",
    allows: ["See what the organisation holds, and share it — only with the organisations you name below"],
    doesNotAllow: ["Share with any organisation not named", "Receive or accept new credentials", "Give anyone else authority"],
  },
  {
    id: "approve",
    label: "Approve others' actions",
    allows: ["Approve or refuse what others ask to do for the organisation, and see what it holds"],
    doesNotAllow: ["Receive, accept or share credentials themselves", "Approve something they asked to do", "Give anyone else authority"],
  },
  {
    id: "everything",
    label: "Everything",
    allows: ["Receive, accept and share credentials, and approve others' actions"],
    doesNotAllow: ["Give anyone else authority — only you can", "Take the organisation's credentials off the platform"],
  },
];

export const presetOf = (id: PresetId | undefined) => PRESETS.find((p) => p.id === id);

/** Organisations listed as able to check credentials — what *Share* may name. */
export const SHARE_TARGETS = [
  "Bhutan National Single Window",
  "Bank of Bhutan",
  "Department of Revenue & Customs",
  "Royal Insurance Corporation of Bhutan",
];

const any = { mode: "any" } as const;

/** EW-FLOW3-SD §4.2's table, as the scope the console checks. */
export function scopeFor(
  id: PresetId,
  shareWith: string[],
  shareNeedsApproval: boolean,
  validFrom: string,
  validUntil: string | null,
): Scope {
  const g = (operation: ScopeGrant["operation"], approval: ApprovalPolicy = "AUTO", rp: ScopeGrant["relyingParties"] = any): ScopeGrant => ({
    operation,
    credentialTypes: any,
    relyingParties: rp,
    approval,
  });
  const present: ApprovalPolicy = shareNeedsApproval ? "SINGLE_APPROVER" : "AUTO";
  const named = { mode: "list" as const, values: shareWith };
  const grants: ScopeGrant[] =
    id === "receive"
      ? [g("credential:receive"), g("credential:accept"), g("credential:list")]
      : id === "share"
        ? [g("credential:list"), g("proof:present", present, named), g("connection:create", "AUTO", named)]
        : id === "approve"
          ? [g("approval:decide"), g("credential:list")]
          : [
              g("credential:receive"),
              g("credential:accept"),
              g("credential:list"),
              g("proof:present", present),
              g("connection:create"),
              g("approval:decide"),
            ];
  return { version: 1, validFrom, validUntil, grants };
}
