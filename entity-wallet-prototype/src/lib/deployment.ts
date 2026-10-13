/**
 * Per-deployment settings and the thresholds the flow specifications fix.
 *
 * These are not design variants. FLOW-ONB-01 P3 is explicit that sign-up
 * being on or off changes no step of the flow, only whether the public route
 * leads into it — so the setting lives here, where a deployment would set it,
 * rather than as a branch inside any screen. The screens read it; the state
 * switcher can override what they render, which is how the disabled face of
 * SCR-ONB-01 is reviewed without redeploying.
 */

/**
 * FLOW-ONB-01 P3. Default true. "An unset value is a configuration error, not
 * a default-to-open" — which is why it is a literal here and not an
 * environment read with a fallback.
 */
export const SELF_SERVICE_SIGNUP_ENABLED = true;

/** FLOW-ONB-01 E2 — the verification link works for 7 days. */
export const VERIFY_LINK_DAYS = 7;

/**
 * FLOW-ONB-01 S4 — agreed 15 Sep 2026: 5 requests per email address per hour.
 * (20 per source IP and a bot challenge after 3 are server-side and have no
 * face in the UI beyond E7, which renders the same as E1.)
 */
export const SENDS_PER_ADDRESS_PER_HOUR = 5;

/**
 * SCR-ONB-02 — "a resend control disabled for a short cooling period". The
 * specification does not fix the period; 30 seconds is long enough that a
 * double-tap does not send twice, and short enough that nobody reads it as
 * the product refusing.
 */
export const RESEND_COOLDOWN_SECONDS = 30;

/**
 * FLOW-ONB-02 §12 item 3 — invitations expire after 14 days (M) or 30 (O).
 * Kind A, added by item 7, takes 14 like Kind M: the invitee is NDI staff,
 * not an agency moving on institutional timescales.
 */
export const INVITATION_DAYS = { M: 14, O: 30, A: 14 } as const;
