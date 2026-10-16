import type { PersonaId } from "./demoData";

/**
 * The six acts, as the story runner drives them.
 *
 * One entity, one grant, one delegation, one failure. This is the only place
 * the running order lives: the runner reads it, and so does anything that
 * wants to say "you are in act 3 of 6". Adding a screen to the demo does not
 * mean adding an act — an act is a thing the audience learns, and there are
 * six of those.
 *
 * `route` is the act's entry point, not its whole path. Act 2 walks four
 * screens; the runner only has to put you at the first one, because from
 * there the screens lead into each other the way they will in the real
 * product. A runner that clicked through every screen for you would be a
 * video, and a demo whose screens do not lead anywhere is worth finding out
 * about before the room does.
 */
export interface Act {
  number: number;
  /** What happens. Shown in the runner. */
  title: string;
  /** What the audience is meant to take away. The reason the act exists. */
  learns: string;
  /** Who the console is driven as. Switching mid-story is the point. */
  persona: PersonaId;
  route: string;
}

export const ACTS: Act[] = [
  {
    number: 1,
    title: "The entity becomes real",
    learns:
      "An organisation can hold credentials — and the platform never asserts its identity by itself. A government register confirms it.",
    persona: "dorji",
    route: "/onboarding",
  },
  {
    number: 2,
    title: "Authority is granted, narrowly",
    learns:
      "Authority is a scoped, legally-grounded relation that the controller has to accept. Not a role dropdown.",
    persona: "dorji",
    route: "/controllership/relations/new",
  },
  {
    number: 3,
    title: "The Controller works, under approval",
    learns:
      "Least disclosure by default, an approval gate that actually holds, and an audit trail that records both the entity and the person.",
    persona: "rinzin",
    route: "/dashboard",
  },
  {
    number: 4,
    title: "Authority is delegated to a person's wallet",
    learns:
      "The entity issues authority into someone's own wallet, carrying constraints any verifier can read.",
    persona: "dorji",
    route: "/delegated-authority/new",
  },
  {
    number: 5,
    title: "Authority is checked at the point of use",
    learns:
      "The same authority passes, then fails once a role above it is withdrawn — with the failing link named. This is why the system exists.",
    persona: "pema",
    route: "/verifier/bnsw",
  },
  {
    number: 6,
    title: "There is recourse",
    learns:
      "Revocation is not arbitrary power. It carries a reason, a reference and a way to appeal.",
    persona: "pema",
    route: "/appeals",
  },
];

export const actByNumber = (n: number): Act | undefined => ACTS.find((a) => a.number === n);

/**
 * The Gate 2 flows, as jumps in the demo controls.
 *
 * The guided demo is the story told to someone new to the idea; Gate 2 is a
 * review of Flows 1 and 2 against their specs, by people who already know
 * it and want to walk one flow end to end. So each flow is a jump, with the
 * persona that starts it.
 *
 * `persona: null` is a flow that starts before anyone is signed in.
 *
 * TWO WAYS ONTO THE PLATFORM
 *
 * An organisation arrives one of two ways, and which one is a deployment
 * setting (FLOW-ONB-01 P3): with self-service sign-up on, its representative
 * signs up and adds it; with it off, an NDI administrator invites it
 * (FLOW-ONB-02 Kind O, no second approval for an ordinary business). Both
 * end in the same Flow 2 check against the register. `selfService` is the
 * setting the entry needs, applied when it is chosen, so neither route can
 * be started in a deployment where it would not exist.
 */
export type FlowGroup = "root" | "admin" | "company" | "members";

/**
 * The flows the demo controls offer — the onboardings the prototype is
 * scoped to, in the order they have to happen.
 *
 * WHY ONLY THESE
 *
 * The controls used to carry a six-act story runner and jumps into every
 * flow anyone had asked for: Bank of Bhutan's wallet, NDI inviting a
 * business, manual review. The current focus is onboarding — root, platform
 * admins, a new company, and the people that company then brings on — so
 * the panel offers exactly those, and nobody has to work out which of a
 * dozen buttons is under review. The other screens still exist; the
 * controls no longer point at them.
 *
 * Member onboarding came back once the first day stopped listing the seed's
 * colleagues: with Pelden starting as one person, how everyone else joins is
 * a question the demo has to answer on screen.
 */
export const FLOW_GROUPS: { id: FlowGroup; code: string; title: string }[] = [
  { id: "root", code: "FLOW-ONB-02", title: "Root admin onboarding" },
  { id: "admin", code: "FLOW-ONB-02", title: "Platform admin onboarding" },
  { id: "company", code: "FLOW-ONB-01 · Flow 2", title: "New company onboarding" },
  { id: "members", code: "FLOW-ONB-02 · Kind M", title: "Member onboarding" },
];

export interface FlowEntry {
  group: FlowGroup;
  label: string;
  persona: PersonaId | null;
  route: string;
  selfService?: boolean;
  /**
   * Where it starts, so a jump never lands on whatever half-state the last
   * demo left behind:
   *
   * - `dayZero` — the platform before any admin or business.
   * - `platformReady` — one platform admin set up, no business yet: where a
   *   company comes on.
   * - `firstDay` — Pelden registered a moment ago, Dorji its only member.
   * - `livedIn` — the story three months in, for the acts beyond onboarding.
   */
  start: "dayZero" | "platformReady" | "firstDay" | "livedIn";
}

export const FLOW_ENTRIES: FlowEntry[] = [
  { group: "root", label: "Root signs in", persona: null, route: "/sign-in", start: "dayZero" },
  { group: "admin", label: "Root invites a platform admin", persona: "root", route: "/admin/team", start: "dayZero" },
  { group: "company", label: "Create an account", persona: null, route: "/sign-up", selfService: true, start: "platformReady" },
  {
    group: "company",
    label: "Register the company",
    persona: "dorji",
    route: "/onboarding",
    selfService: true,
    start: "platformReady",
  },
  { group: "members", label: "Invite a member", persona: "dorji", route: "/members", start: "firstDay" },
];
