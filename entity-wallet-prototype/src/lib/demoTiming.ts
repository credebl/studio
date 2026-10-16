/**
 * Every wait in this demo is authored, because there is no server to wait for.
 *
 * Two ways to get this wrong. Make it instant and the demo dies: the Entity
 * Wallet's entire trust argument lives in waiting, denial and failure — the
 * register check, the parked approval, the verification decision. Resolve all
 * of that in 0ms and you have demoed a CRUD app. Make it realistic and nobody
 * sits through it in a room.
 *
 * So: long enough to read as work happening, short enough to narrate over,
 * and always skippable. The numbers live here rather than at their call sites
 * so the whole demo can be retuned in one edit after the first rehearsal —
 * which is when you find out that what felt right alone feels slow out loud.
 *
 * THE BUDGET, AS WALKED
 *
 * Across a full six-act run these add up to roughly:
 *
 *   act 1   search 0.7s + hand-off 2.2s + register 4.2s          ≈  7s
 *           and again if the refusal is shown                    ≈ 14s
 *   act 3   one wallet-signed approval                           ≈  2s
 *   act 4   accepting the registration offer                     ≈  2s
 *   act 5   hand-off 2.2s + decision 1.7s, twice                 ≈  8s
 *           and again if service-unreachable is shown            ≈ 12s
 *
 * — about 30 seconds of authored waiting in a 25-minute demo, or 2% of it,
 * with every one of them skippable. That is the right side of the trade: the
 * alternative is a product whose entire trust argument resolves instantly and
 * therefore reads as a CRUD app with extra words.
 */

/** A normal round-trip: an agent call, a policy check, a signature. */
export const ROUND_TRIP_MS = 1700;

/** Something that only touches the platform. Short, but not instant. */
export const LOCAL_MS = 650;

/**
 * The register confirmation in onboarding, given the honest treatment on
 * purpose. One screen in the demo should show what a real external
 * dependency feels like, and this is the one — it is the moment the platform
 * admits it cannot assert the entity's identity by itself. Every other wait
 * is compressed; this one earns its length.
 */
export const REGISTER_CHECK_MS = 4200;

/**
 * A wallet hand-off: somebody looking at their phone and answering.
 *
 * Retuned down from 2600 after walking the full story. The hand-off panel now
 * carries a "what you will share" block that the audience reads while they
 * wait, so the first second or so is doing work — but the remainder was dead
 * air, and act 5 sits through this two or three times in a row because it is
 * the act people ask to see again.
 */
export const WALLET_HANDOFF_MS = 2200;

/**
 * A "skip" appears after this long. Early enough that an impatient presenter
 * never feels trapped, late enough that it does not undercut the wait it is
 * offering to skip.
 */
export const SKIP_AFTER_MS = 900;

/**
 * How long a success message stays up before the flow moves on by itself.
 *
 * Long enough to read one line — "You've proved you are …" — and short enough
 * that nobody reaches for a button. The alternative, a Continue button under
 * a confirmation, asked people to acknowledge something they had just done,
 * and in the room it was the click everyone forgot. A "Continue now" stays
 * for anyone who does not want to wait, and for keyboard users.
 */
export const AUTO_ADVANCE_MS = 2200;
