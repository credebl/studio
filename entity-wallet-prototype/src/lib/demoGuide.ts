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
 * WHY THE GUIDE STOPS WHEN PELDEN'S FIRST COLLEAGUE JOINS
 *
 * The prototype is scoped to onboarding: NDI's root administrator, the
 * platform admins root invites, a new company getting an Entity Wallet, and
 * the people that company brings on. The guide used to run on for six more
 * chapters — Bank of Bhutan's wallet, appointing a controller, presenting,
 * authority in a phone, revocation, appeals — which walk flows the catalogue
 * has not designed yet, and made a forty-step demo of an onboarding review.
 * Those screens still exist; the guide no longer walks them.
 *
 * Appointing a controller and a delegate follow it, because being invited
 * is only half of getting ready: a member can see the organisation, and
 * somebody still has to be able to act for it. Both are invited first and
 * appointed second, in that order and never the other way round, and both
 * prove who they are at the appointment rather than at the invitation
 * (FLOW-ONB-02 §7.3). Giving a member authority follows FLOW-DEL-01 and
 * SCR-DEL-02 to 05; the delegate's role is Flow 8, which is not designed yet,
 * so its chapter follows Story B5 and says on screen that it is ahead of spec.
 *
 * Member onboarding is here because the first day is now genuinely empty.
 * When it still listed the seed's colleagues, the room's first question on
 * seeing them was "how did these people get here?" — and the answer, an
 * invitation Dorji sends and they accept, is an onboarding in its own right.
 */
export const GUIDE_CHAPTERS: GuideChapter[] = [
  { title: "Before you start", shows: "What the demo is, and how to drive it" },
  { title: "Root admin onboarding", shows: "NDI's root administrator signs in to a ready organisation" },
  { title: "Platform admin onboarding", shows: "Root invites an admin by email; they set up from the link" },
  { title: "A new company signs up", shows: "A person signs up — nothing about any company yet" },
  { title: "Verify the organisation", shows: "The authority that registered it, not NDI, confirms the company" },
  { title: "Pelden brings on its people", shows: "The owner invites a colleague; they join from the link" },
  { title: "Give someone authority to act", shows: "Dorji chooses what Ugyen can do; Ugyen accepts with one wallet approval" },
  { title: "A role in a wallet — Flow 8, ahead of spec", shows: "A clearing agent is invited, then given a role in their own wallet" },
  { title: "Where to go next", shows: "The other routes, and what's simulated" },
];

export const GUIDE_STEPS: GuideStep[] = [
  /* ---- 0 · Before you start ---- */
  {
    chapter: 0,
    title: "Onboarding onto the Entity Wallet",
    happening:
      "Everything it takes to get onto the Entity Wallet and ready to use it, in the order it has to happen: NDI's root account signs in, root brings on the platform's two administrators, who each set up their own account, a new company — Pelden Trading — signs up and is verified by the authority that registered it, and Pelden's owner invites a colleague and gives them authority to act, then — ahead of the specification — invites a clearing agent and gives them a role in their own wallet. Nothing is real: the dashed \"Prototype\" panels stand in for a phone, an inbox or a government register.",
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
      "Root types the address the invitation goes to — nobody is an admin until NDI decides to trust them. Using the root account is logged with the custodians present, and every administrator is told.",
    doThis:
      "Type **kinzang.dorji@bhutanndi.bt**, the custodians present such as **Karma and Sonam**, and optionally a reason such as **Bringing on the first administrators**, then press **Send invitation**, then **Open the invitation as kinzang.dorji@bhutanndi.bt** (dashed — it stands in for the invitee's inbox).",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Kinzang sets up the account",
    happening:
      "The invitation is the onboarding. It's from the Bhutan NDI root administrator — the account, not a person — and says what it gives and what it doesn't: Kinzang can't approve anything Kinzang proposes. The account is set up right here; the link already proves the address.",
    doThis:
      "Enter **Kinzang Dorji**, a password such as **Thimphu-Chorten-2026**, the same password again to confirm, then press **Set up account and accept**. Then press **Next**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 2,
    title: "Invite the second platform admin",
    happening:
      "One administrator isn't enough: anything that needs approving needs a second named one, and the root account won't be it. So root invites one more — and after that, root's form is gone.",
    doThis:
      "Type **tshendu@bhutanndi.bt** and the same custodians, press **Send invitation**, then **Open the invitation as tshendu@bhutanndi.bt**.",
    say: "The root account is break-glass. Once two people run the platform, it can't add anyone else.",
    route: "/admin/team",
    persona: "root",
  },
  {
    chapter: 2,
    title: "Tshendu sets up the account",
    happening: "The same invitation Kinzang had, from the same root account.",
    doThis:
      "Enter **Tshendu**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**. On the confirmation, press **Go to the admin console**.",
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
    happening: "Dorji has an account, but it belongs to no organisation yet.",
    doThis: "Press **Add your organisation**.",
    route: "/welcome",
  },

  /* ---- 4 · Verify the organisation ---- */
  {
    chapter: 4,
    title: "What kind of organisation",
    happening:
      "Each type names the authority that registered it, which is who checks it: a registered company, a sole proprietorship or a partnership.",
    doThis: "Leave **Registered company** selected and press **Continue**.",
    route: "/onboarding",
    match: "^/onboarding$",
  },
  {
    chapter: 4,
    title: "Its registration number",
    happening:
      "The one thing Dorji types. The format is shown before the field, and the button names the authority that will be asked — the same name Dorji's wallet will show.",
    doThis:
      "Type **CRA-2019-04477** (or press it in the dashed prototype panel), then press **Verify with Corporate Regulatory Authority**.",
    route: "/onboarding/details",
  },
  {
    chapter: 4,
    title: "The authority asks who Dorji is",
    happening:
      "The request comes from the Corporate Regulatory Authority, not from NDI. Only Dorji's identity is shared — nothing about the company, and NDI keeps nothing from it.",
    doThis: "Press **Simulate the scan** (the code doesn't really scan). Once it's answered, the next step opens by itself.",
    route: "/onboarding/prove",
  },
  {
    chapter: 4,
    title: "The authority decides",
    happening:
      "The CRA checks its own records — NDI never sees them — and decides. Then Pelden's wallet is set up and its registration added. The page could be closed: Dorji's account would show where it's up to.",
    doThis: "Wait — the next screen opens by itself when it's done.",
    say: "This is the moment the platform admits it can't decide who a company is. The authority does.",
    route: "/onboarding/verifying",
  },
  {
    chapter: 4,
    title: "Dorji accepts responsibility",
    happening:
      "Verified isn't usable yet. The screen says what acting for Pelden means — what Dorji can and can't do, and Dorji's responsibilities — and nothing on Pelden works until Dorji accepts. No scan: Dorji proved who they are to the CRA a minute ago.",
    doThis: "Press **Accept responsibility**.",
    route: "/onboarding/responsibility",
  },
  {
    chapter: 4,
    title: "Pelden is verified",
    happening:
      "Pelden holds its registration — added automatically, nobody accepted anything. The next step offered is its tax identity, and the screen says plainly what Pelden can't do: issue credentials or verify anyone.",
    doThis: "Press **Go to Pelden Trading**.",
    route: "/onboarding/foundational",
  },
  {
    chapter: 4,
    title: "Pelden's first day",
    happening:
      "A brand-new organisation: it holds its registration and Dorji's authority to act for it, and nothing else. No tasks, no history — so what it suggests first is its tax identity. Inviting colleagues is there too, further down.",
    doThis: "Have a look around, then press **Next**.",
    say: "Nothing has happened here yet, and the console doesn't pretend otherwise.",
    route: "/dashboard",
    persona: "dorji",
  },

  /* ---- 5 · Pelden brings on its people ---- */
  {
    chapter: 5,
    title: "Only Dorji, so far",
    happening:
      "Pelden's members: Dorji alone. Everyone else joins the way a colleague joins any organisation here — Dorji invites them by email, and they accept. Being a member lets someone see the organisation; acting for it is a separate grant.",
    doThis: "Press **Invite someone**.",
    route: "/members",
    persona: "dorji",
  },
  {
    chapter: 5,
    title: "Invite a colleague",
    happening:
      "The invitation names an address and a role, and says before it's sent what it gives and what it doesn't: they'll see Pelden, but can't act for it.",
    doThis:
      "Type **ugyen.phuntsho@peldentrading.bt**, leave **Member** selected and press **Send invitation**. Then press **Open the invitation as ugyen.phuntsho@peldentrading.bt** (dashed — it stands in for Ugyen's inbox).",
    say: "Letting someone in and letting them act for the company are two different things, and the screen says so before anything is sent.",
    route: "/members/invite",
  },
  {
    chapter: 5,
    title: "Ugyen sets up an account",
    happening:
      "The invitation names who sent it, to what, and what it doesn't include. Ugyen has no account yet, so it's set up right here: the link already proves the address, so there's no separate sign-up.",
    doThis:
      "Enter **Ugyen Phuntsho**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 5,
    title: "Ugyen has joined",
    happening:
      "The confirmation names the organisation joined — a person can belong to several — and repeats that membership isn't authority.",
    doThis: "Press **Go to Pelden Trading Pvt. Ltd.**",
    match: "^/invitation/[^/]+/accepted$",
  },
  {
    chapter: 5,
    title: "Pelden, as a member sees it",
    happening:
      "Ugyen can see Pelden but holds no authority for it, and the console says so in the same words the invitation used. No members page, and no giving others authority: those are the owner's.",
    doThis: "Press **Next** to go back to Dorji.",
    route: "/dashboard",
    /* No persona: accepting already drives the console as whoever joined. */
  },
  {
    chapter: 5,
    title: "Dorji sees who joined",
    happening:
      "Ugyen is a member now: identity not yet confirmed — joining never asks anyone — and no authority to act. That comes next: Dorji gives Ugyen authority to act, and Ugyen accepts with one approval in their own NDI wallet.",
    doThis: "Press **Next**.",
    route: "/members",
    persona: "dorji",
  },

  /* ---- 6 · Give someone authority to act (FLOW-DEL-01) ---- */
  {
    chapter: 6,
    title: "Choose what Ugyen can do",
    happening:
      "One of four choices, each saying what it allows and what it doesn't — there's no list of permissions to tick. Dorji confirms they're authorised to make the appointment; citing a document like a board resolution is optional and folded away.",
    doThis:
      "Choose **Ugyen Phuntsho**, leave **Receive credentials**, tick the statement that you're authorised, then press **Give authority**.",
    say: "Membership let Ugyen in. This is the separate thing that lets Ugyen act — and Dorji can say exactly what it covers.",
    route: "/people-who-can-act/give",
    persona: "dorji",
  },
  {
    chapter: 6,
    title: "Waiting for Ugyen",
    happening:
      "Dorji is listed first, as the representative. Ugyen's appointment waits for Ugyen, with the date it lapses if they don't accept. Nothing is in force yet.",
    doThis: "Press **Open it as Ugyen Phuntsho** (dashed — it stands in for Ugyen's notification).",
    route: "/people-who-can-act",
  },
  {
    chapter: 6,
    title: "Ugyen reviews the appointment",
    happening:
      "Who is appointing them — Dorji, by name — that Dorji confirmed they may, what Ugyen will and won't be able to do, and Ugyen's responsibilities. It says up front that accepting needs Ugyen's NDI wallet.",
    doThis: "Press **Accept**.",
    match: "^/appointments/[^/]+$",
  },
  {
    chapter: 6,
    title: "One approval is the acceptance",
    happening:
      "The request comes from Bhutan NDI Verification, named as the wallet will show it. Approving it confirms it's Ugyen and records that Ugyen accepts — there's nothing else to press afterwards.",
    doThis: "Press **Simulate the scan**. When it's done, the next screen opens by itself.",
    say: "Dorji couldn't accept on Ugyen's behalf. An acceptance someone else makes isn't worth recording.",
    match: "^/appointments/[^/]+/confirm$",
  },
  {
    chapter: 6,
    title: "Ugyen can act for Pelden",
    happening:
      "Exactly what Dorji chose — receive credentials — with what it doesn't cover listed beside it. Ugyen can read it and can't change it.",
    doThis: "Press **Next**.",
    route: "/organisation",
  },

  /* ---- 7 · A role in a wallet — Flow 8, ahead of spec ----
     Story B5. Flow 3 issues nothing into anyone's wallet (EW-FLOW3-SD/D4);
     role credentials are catalogue flow 8, and the chapter says so on its
     first step rather than letting it pass as part of Flow 3. */
  {
    chapter: 7,
    title: "Invite the clearing agent",
    happening:
      "Ahead of the specification: this is Flow 8, not designed yet, and built from the user stories. Pema Choden, of Druk Sharpa Freight, clears Pelden's imports and acts from their own wallet, not the console — but is still invited first, like Ugyen.",
    doThis:
      "Type **pema.choden@druksharpa.bt**, leave **Member** selected and press **Send invitation**. Then press **Open the invitation as pema.choden@druksharpa.bt**.",
    route: "/members/invite",
    persona: "dorji",
  },
  {
    chapter: 7,
    title: "Pema sets up an account",
    happening: "The same invitation Ugyen had: who sent it, what it gives, what it doesn't, and an account set up from the link.",
    doThis:
      "Enter **Pema Choden**, a password such as **Thimphu-Chorten-2026**, the same password again, then press **Set up account and accept**.",
    match: "^/invitation/[^/]+$",
  },
  {
    chapter: 7,
    title: "Pema has joined",
    happening: "Pema is a member of Pelden — still with no authority. Back to Dorji to appoint Pema as delegate.",
    doThis: "Press **Next**.",
    match: "^/invitation/[^/]+/accepted$",
  },
  {
    chapter: 7,
    title: "Issue a role into Pema's wallet",
    happening:
      "A delegate's authority is a credential in their own NDI Wallet. Its limits — what for, how much, with whom, until when — travel with it and are checked by every counterparty; \"What a counterparty reads\" shows them exactly as a verifier will.",
    doThis:
      "Leave **Role**, choose **Pema Choden**, name it **Customs clearing agent**, tick **Submit customs declarations**, type **500000** as the cap, tick **Bhutan National Single Window**, and press **Issue to Pema**. Then press **Accept it as Pema** (dashed — it stands in for Pema's phone).",
    say: "Accepting in their own wallet is Pema's consent, and it proves who Pema is — the wallet is bound to Pema's citizen credential.",
    route: "/delegated-authority/new",
    persona: "dorji",
  },
  {
    chapter: 7,
    title: "Pelden is ready",
    happening:
      "Three people, three different things: Dorji is the representative, Ugyen can receive credentials for Pelden in the console, and Pema holds a role in their own wallet (Flow 8, ahead of spec). Each was invited first, and each proved who they are when they took authority on.",
    doThis: "Press **Next**.",
    route: "/members",
    persona: "dorji",
  },

  /* ---- 8 · Where to go next ---- */
  {
    chapter: 8,
    title: "That's onboarding",
    happening:
      "The platform went from its root administrator to a first platform admin; Pelden Trading went from one person signing up to a company holding its own registration; and its people were invited, then given authority to act.",
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
