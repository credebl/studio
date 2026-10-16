type Tone = "positive" | "pending" | "warning" | "negative" | "neutral";

/**
 * Status as a word with a dot, not a coloured word.
 *
 * Colour alone would put the whole meaning in a channel some readers do not
 * get, so the label always carries it and the dot only reinforces. Tones map
 * to the palette's status tokens rather than to raw colours, so they follow
 * the theme.
 */
const TONES: Record<Tone, { fg: string; bg: string; dot: string }> = {
  positive: { fg: "var(--accent)", bg: "var(--ndi-mint-08)", dot: "var(--ndi-success)" },
  pending: { fg: "var(--text-body)", bg: "rgb(var(--tint) / 0.05)", dot: "var(--ndi-info)" },
  warning: { fg: "var(--text-body)", bg: "rgb(var(--tint) / 0.05)", dot: "var(--ndi-warning)" },
  negative: { fg: "var(--text-body)", bg: "rgb(var(--tint) / 0.05)", dot: "var(--ndi-danger)" },
  neutral: { fg: "var(--text-muted)", bg: "rgb(var(--tint) / 0.04)", dot: "var(--text-faint)" },
};

/**
 * The states the app shows, mapped once so tables stay consistent.
 *
 * Keys are lower-cased and underscored, so a lifecycle value straight out of
 * the data (`PENDING_ACCEPTANCE`) resolves without each caller pre-formatting
 * it. Anything unmapped falls back to neutral and still renders, which is the
 * right failure: an unknown status should look plain, never invisible.
 */
const STATUS_TONE: Record<string, Tone> = {
  accepted: "positive",
  active: "positive",
  verified: "positive",
  valid: "positive",
  completed: "positive",
  issued: "positive",
  offered: "pending",
  requested: "pending",
  invited: "pending",
  processing: "pending",
  pending: "pending",
  expiring: "warning",
  partial: "warning",
  declined: "negative",
  revoked: "negative",
  expired: "negative",
  failed: "negative",

  /* ---- Entity wallet ----
     Relation lifecycle, approval lifecycle, and the outcomes of a scope or
     authority check. Grouped by what they mean rather than by which screen
     shows them, because the same word has to read the same way everywhere. */

  /* Relations on their way to being real. Not yet authority. */
  draft: "neutral",
  /* Platform access: what an organisation may do, and a request for more. */
  inactive: "neutral",
  not_set_up: "neutral",
  pending_acceptance: "pending",
  pending_registration: "pending",
  /* Reversible stop, then the final one. Suspension is a warning because it
     can be undone; termination is not a warning, it is an outcome. */
  suspended: "warning",
  terminated: "negative",

  /* Approvals in flight. `parked` is the one to get right: it is the normal,
     healthy state of an operation that policy holds back, so it must not
     look like a problem. */
  parked: "pending",
  awaiting_signature: "pending",
  awaiting_acceptance: "pending",
  sent: "pending",
  approved: "positive",
  rejected: "negative",
  /* Approved, then invalidated before it ran. Negative rather than warning:
     nothing happened and nothing will. */
  stale: "negative",

  /* Verification outcomes. PASS/FAIL arrive upper-cased from the decision. */
  pass: "positive",
  fail: "negative",
  service_unreachable: "negative",

  /* Scope decisions, as the server returns them. */
  allowed: "positive",
  requires_approval: "pending",
  out_of_scope: "negative",
  denied: "negative",

  /* Appeals. An upheld appeal is a reinstatement, which is a good outcome. */
  notice_issued: "warning",
  open: "pending",
  under_review: "pending",
  upheld_reinstated: "positive",
  window_closed: "neutral",

  /* Invitations (FLOW-ONB-02). An invitation waiting on a second
     administrator is pending, not a problem: the gate doing its job. A void
     one is negative but says nothing about the invitee — E6 is a lapse. */
  pending_approval: "pending",
  refused: "negative",
  void: "negative",
  delivery_failed: "warning",

  /* Presentation flow. */
  ready: "pending",
  signing: "pending",
  presented: "positive",
};

/**
 * `label` overrides the word shown without changing which tone is picked, for
 * the few places where the data's own vocabulary is not what a reader should
 * see — "Out of scope" rather than "out_of_scope".
 */
export function StatusPill({ status, label }: { status: string; label?: string }) {
  const key = status.toLowerCase().replace(/[\s-]+/g, "_");
  const tone = TONES[STATUS_TONE[key] ?? "neutral"];
  /* Sentence case, computed rather than done in CSS. `capitalize` would title
     case every word ("Pending Acceptance"), which is not this product's
     casing, and `::first-letter` does not apply inside an inline-flex box. */
  const words = key.replace(/_/g, " ");
  const text = label ?? words.charAt(0).toUpperCase() + words.slice(1);
  return (
    <span
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-grid px-2.5 py-1 text-[12px] font-medium"
      style={{ color: tone.fg, background: tone.bg }}
    >
      <span
        aria-hidden="true"
        className="h-1.5 w-1.5 flex-none rounded-full"
        style={{ background: tone.dot }}
      />
      {text}
    </span>
  );
}
