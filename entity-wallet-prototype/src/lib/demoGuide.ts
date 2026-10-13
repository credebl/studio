import type { PersonaId } from "./demoData";

/**
 * The guided demo: the whole story as a script the screen reads out to
 * whoever is driving.
 *
 * WHY THIS EXISTS
 *
 * The demo grew a story runner, flow jumps, a persona switcher, a state
 * switcher and a deployment switch, all in one panel — a toolbox for someone
 * who already knows the story, and a maze for anyone who doesn't. The written
 * guide didn't close the gap: it lives in another window, and reading it
 * while clicking is exactly what a presenter can't do. So the script moved
 * onto the screen. Each step says where you are, what is going on, what to
 * press, and — when it matters — a line worth saying out loud.
 *
 * HOW A STEP FOLLOWS YOU
 *
 * `match` is the screen a step happens on. Pressing Next takes you to the
 * next step's screen, as the right person. Doing the step yourself also
 * works: when a click in the product lands on the *next* step's screen, the
 * guide moves on by itself. Only the next step is watched, so wandering off to
 * another page never skips the guide ahead.
 *
 * Button names in `doThis` are bolded with **…** and must match the product
 * exactly — the guide is only as good as its agreement with the screen.
 */
export interface GuideChapter {
  title: string;
  /** One line: what this part of the story shows. */
  shows: string;
}

export interface GuideStep {
  chapter: number;
  title: string;
  /** What is going on, for someone seeing it for the first time. */
  happening: string;
  /** Exactly what to press. **Bold** for on-screen names. */
  doThis: string;
  /** Optional line to say to the room. */
  say?: string;
  /** The screen this step is on — Next navigates here. */
  route?: string;
  /** Pattern for recognising that screen, when `route` alone is not enough. */
  match?: string;
  /** Who to drive as when the guide brings you to this step. */
  persona?: PersonaId;
}

/**
 * WHY THE GUIDE STOPS AT AN EMPTY ACCOUNT
 *
 * The prototype is delivered flow by flow, and this branch is Flow 1: how a
 * person gets onto the platform. NDI's root administrator, the platform
 * admins root invites, and a company's director creating an account of their
 * own. It ends on that account holding nothing, because that is where Flow 1
 * ends (FLOW-ONB-01 Q3) — the account is a shell until someone claims to act
 * for an organisation, and that claim is Flow 2's.
 *
 * Stopping there is the point rather than a gap. The screen that says "this
 * account can't do anything yet" is the one UX-EW-01 most wants tested
 * (UC-04), and a guide that hurried on to registering the company would walk
 * the room straight past it.
 */
export const GUIDE_CHAPTERS: GuideChapter[] = [
  { title: "Before you start", shows: "What the demo is, and how to drive it" },
  { title: "Root admin onboarding", shows: "NDI's root administrator signs in to a ready organisation" },
  { title: "Platform admin onboarding", shows: "Root invites an admin by email; they set up from the link" },
  { title: "A new company signs up", shows: "A person signs up — nothing about any company yet" },
  { title: "Where to go next", shows: "The other routes, and what's simulated" },
];

export const GUIDE_STEPS: GuideStep[] = [
  /* ---- 0 · Before you start ---- */
  {
    chapter: 0,
    title: "Onboarding onto the Entity Wallet",
    happening:
      "Three onboardings, in the order they have to happen: NDI's root account signs in, root brings on the platform's two administrators, who each set up their own account, and Pelden Trading's director signs up for an account of their own. Nothing is real: the dashed \"Prototype\" panels stand in for an inbox.",
    doThis:
      "Press **Next**. The guide takes you to each screen and tells you what to press; you do the clicking. **Minimise** tucks this card away when it's in the way.",
  },

  /* ---- 1 · Root admin onboarding ---- */
  {
    chapter: 1,
    title: "The root administrator signs in",
    happening:
      "Before any business, NDI's root administrator signs in. The account was made when the platform was deployed, so there is no sign-up and nothing to onboard.",
    doThis:
      "Press **Root** in the dashed panel (it fills in the address), type any password, then press **Sign in**.",
    route: "/sign-in",
    match: "^/sign-in$",
  },
  {
    chapter: 1,
    title: "NDI's own organisation",
    happening:
      "Root lands in Bhutan NDI's organisation, which is ready from the start: the whole Studio and NDI administration. Root is NDI's own account, held by two custodians together — not a person's — and its one job now is bringing on the first two administrators.",
    doThis: "Press **Invite a platform admin**.",
    route: "/dashboard",
    persona: "root",
  },
  /* ---- 2 · Platform admin onboarding ----
     Two administrators, because the root account approves nothing
     (FLOW-ONB-02 v0.6, S2): every second approval is a second named admin.
     Root brings both on at bootstrap, each with a reason and the custodians
     present (S9), and can add no more once two are active. */
  {
    chapter: 2,
    title: "Invite the first platform admin",
    happening:
      "Root types the address the invitation goes to — nobody is an admin until NDI decides to trust them. Using the root account is logged with a reason and the custodians present, and every administrator is told.",
    doThis:
      "Type **kinzang.dorji@bhutanndi.bt**, a reason such as **Bringing on the first administrators**, the custodians present such as **Karma and Sonam**, press **Send invitation**, then **Open the invitation as kinzang.dorji@bhutanndi.bt** (dashed — it stands in for the invitee's inbox).",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Kinzang sets up the account",
    happening:
      "The invitation is the onboarding. It's from the Bhutan NDI root administrator — the account, not a person — and says what it gives and what it doesn't: Kinzang can't approve anything Kinzang proposes. The account is set up right here; the link already proves the address.",
    doThis:
      "Enter **Kinzang Dorji**, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Invite the second platform admin",
    happening:
      "One administrator isn't enough: anything that needs approving needs a second named one, and the root account won't be it. So root invites one more — and after that, root's form is gone.",
    doThis:
      "Type **tshendu@bhutanndi.bt**, the same reason and custodians, press **Send invitation**, then **Open the invitation as tshendu@bhutanndi.bt**.",
    say: "The root account is break-glass. Once two people run the platform, it can't add anyone else.",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Tshendu sets up the account",
    happening: "The same invitation Kinzang had, from the same root account.",
    doThis:
      "Enter **Tshendu**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Two platform admins",
    happening:
      "Kinzang and Tshendu run the platform now and approve what each other propose. From here, a new administrator is invited by one of them and approved by the other — the root account is for emergencies only.",
    doThis: "Press **Next** — with administrators in place, a company can now come onto the platform.",
    route: "/dashboard",
    /* No persona: setting up the account already drives the console as
       whoever accepted. */
  },
  /* ---- 3 · A new company signs up ---- */
  {
    chapter: 3,
    title: "A new company: Dorji signs up",
    happening:
      "Pelden Trading has never been on NDI. Its director, Dorji Wangchuk, creates a personal account first — just the person; the company comes later.",
    doThis: "Type an email such as **dorji.w@peldentrading.bt** and press **Continue**.",
    say: "The account has to belong to the person who'll prove who they are later. That's checked in the next chapter, not here.",
    route: "/sign-up",
    match: "^/sign-up$",
  },
  {
    chapter: 3,
    title: "Check your email",
    happening: "In the product an email arrives with a link. No email is sent in this demo.",
    doThis: "Press **Open the link from the email** in the dashed prototype panel.",
    route: "/sign-up/check-email",
  },
  {
    chapter: 3,
    title: "Email confirmed",
    happening: "The link proves Dorji controls that address.",
    doThis: "Press **Continue**.",
    route: "/sign-up/verify",
  },
  {
    chapter: 3,
    title: "Name and password",
    happening: "The password rules are shown before anyone types, not after a failure.",
    doThis:
      "Enter **Dorji Wangchuk** as the name, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Create account**.",
    route: "/sign-up/password",
  },
  {
    chapter: 3,
    title: "An account with no organisation",
    happening:
      "Dorji has an account, but it belongs to no organisation yet — and the screen says so rather than showing an empty console. Adding the organisation is the next flow, entity onboarding, where a government register confirms the company.",
    doThis: "Press **Next**.",
    say: "An account on its own can do nothing. That's deliberate: what matters is checked when someone claims to act for a company.",
    route: "/welcome",
  },

  /* ---- 4 · Where to go next ---- */
  {
    chapter: 4,
    title: "That's onboarding",
    happening:
      "The platform went from its root administrator to a first platform admin, and Pelden Trading's director went from an email address to an account that can sign in — and, so far, do nothing else.",
    doThis:
      "To run any part again, use **Demo controls → Walk a flow**. The **Prototype · data simulated** chip lists what's simulated.",
  },
];

/** Whether a step's screen is the one showing. */
export function onStepScreen(step: GuideStep, pathname: string): boolean {
  if (step.match) return new RegExp(step.match).test(pathname);
  if (step.route) return pathname === step.route;
  return true;
}
